import evmodel from '../models/station.js'; // adjust as needed
import { configDotenv } from 'dotenv';
configDotenv();


// 👉 Utility: Get lat/lng from Ola place_id
const getLatLngFromPlaceId = async (placeId) => {
  const apiKey = process.env.OLA_MAPS_API_KEY;
  const url = `https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("here is lat long data",data)
    
    const lat = data?.result?.geometry?.location?.lat;
    const lng = data?.result?.geometry?.location?.lng;
    
    if (!lat || !lng) throw new Error(`No coordinates for ${placeId}`);
    return [lng, lat]; // MongoDB requires [lng, lat]
  } catch (err) {
    console.error("Error fetching coordinates:", err.message);
    return null;
  }
};

// 👉 Helper function to extract station name from structured_formatting or description
const getStationName = (place) => {
  // Try to get from structured_formatting first
  if (place.structured_formatting && typeof place.structured_formatting === 'object') {
    if (place.structured_formatting.main_text) {
      return place.structured_formatting.main_text;
    }
  }
  
  // Fallback to parsing description for station name
  if (place.description) {
    // Extract the first part before the first comma (usually the station name)
    const firstPart = place.description.split(',')[0].trim();
    return firstPart || 'Unnamed Station';
  }
  
  return 'Unnamed Station';
};

// 👉 Helper function to extract operator from terms or description
const getOperator = (place) => {
  // Try to get from terms array first
  if (place.terms && Array.isArray(place.terms) && place.terms.length > 0) {
    // Look for known operators in terms
    const knownOperators = ['Shell', 'Bharat Petroleum', 'BP', 'HP', 'IOCL', 'Reliance'];
    for (const term of place.terms) {
      if (term.value) {
        const termValue = term.value.trim();
        const foundOperator = knownOperators.find(op => 
          termValue.toLowerCase().includes(op.toLowerCase())
        );
        if (foundOperator) return foundOperator;
      }
    }
    // If no known operator found, return first term
    return place.terms[0].value || 'Unknown';
  }
  
  // Fallback to parsing description for operator
  if (place.description) {
    const knownOperators = ['Shell', 'Bharat Petroleum', 'BP', 'HP', 'IOCL', 'Reliance'];
    const foundOperator = knownOperators.find(op => 
      place.description.toLowerCase().includes(op.toLowerCase())
    );
    if (foundOperator) return foundOperator;
  }
  
  return 'Unknown';
};

// 👉 Main Enrichment Function
export const EnrichAndSaveEVFromPredictions = async (predictions) => {
  if (!Array.isArray(predictions)) {
    throw new Error("Invalid predictions array");
  }
  
  console.log(`Processing ${predictions.length} predictions...`);
  
  for (const place of predictions) {
    try {
      console.log(`Processing: ${place.place_id}`);
      
      const coords = await getLatLngFromPlaceId(place.place_id);
      if (!coords) {
        console.warn(`⚠️ Skipping ${place.place_id} - couldn't fetch coordinates`);
        continue;
      }
      
      // Generate mock data
      const mockBatterySwapping = Math.random() < 0.5;
      const mockSlots = Math.floor(Math.random() * 10) + 1;
      const mockAvgRating = parseFloat((Math.random() * 5).toFixed(1));
      const mockTotalReviews = Math.floor(Math.random() * 200);
      
      const rushHourDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const rushHourData = rushHourDays.map(day => ({
        day,
        startTime: "18:00",
        endTime: "21:00",
        averageWaitTime: Math.floor(Math.random() * 10) + 1,
        chargingDemand: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)]
      }));
      
      // Create EV station document
      const evStation = new evmodel({
        name: getStationName(place),
        operator: getOperator(place),
        address: place.description || 'No address',
        location: {
          type: 'Point',
          coordinates: coords
        },
        batterySwapping: {
          isAvailable: mockBatterySwapping
        },
        slotsAvailable: mockSlots,
        rushHourData: {
          peakHours: rushHourData,
          lastUpdated: new Date()
        },
        ratings: {
          averageRating: mockAvgRating,
          totalReviews: mockTotalReviews
        },
        // Additional fields that might be useful
        placeId: place.place_id,
        reference: place.reference,
        distanceMeters: place.distance_meters,
        types: place.types || [],
        layer: place.layer || []
      });
      
      const result=await evStation.save();
      return result;

      console.log(`✅ Saved: ${evStation.name} (${evStation.operator})`);
      
    } catch (err) {
      console.error(`❌ Failed to save ${place.place_id}:`, err.message);
      // Continue with next place instead of breaking
      continue;
    }
  }
  
  console.log(`✅ Completed processing all predictions`);
};

// 👉 Example usage function
export const processOlaPredictions = async (olaApiResponse) => {
  try {
    if (!olaApiResponse || !olaApiResponse.predictions) {
      throw new Error("Invalid API response format");
    }
    
    if (olaApiResponse.status !== 'ok') {
      throw new Error(`API returned status: ${olaApiResponse.status}`);
    }
    
    await EnrichAndSaveEVFromPredictions(olaApiResponse.predictions);
    
  } catch (err) {
    console.error("Error processing Ola predictions:", err.message);
    throw err;
  }
};