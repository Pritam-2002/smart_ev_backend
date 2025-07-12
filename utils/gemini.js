import { GoogleGenerativeAI } from "@google/generative-ai";
import evModel from "../models/station.js"; // Adjust the import path as necessary
import moment from "moment-timezone";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

// Helper to calculate distance between two lat/lng points using Haversine formula
function calculateDistance(coord1, coord2) {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Function to check if current time is within peak hours
function isWithinPeakHours(currentTime, peakHours) {
  if (!peakHours || peakHours.length === 0) return false;

  const currentMoment = moment(currentTime, "HH:mm");

  for (const hourRange of peakHours) {
    const startTime = moment(hourRange.startTime, "HH:mm");
    const endTime = moment(hourRange.endTime, "HH:mm");

    // Handle overnight peak hours (e.g., 22:00 to 02:00)
    if (startTime.isAfter(endTime)) {
      if (currentMoment.isSameOrAfter(startTime) || currentMoment.isBefore(endTime)) {
        return true;
      }
    } else {
      if (currentMoment.isBetween(startTime, endTime, null, "[]")) { // [] makes it inclusive
        return true;
      }
    }
  }
  return false;
}

// Input validation helper
function validateInput(req) {
  const { batteryPercentage, rangeLeft, currentLocation } = req.body;
  const errors = [];

  if (!batteryPercentage || typeof batteryPercentage !== 'number' || batteryPercentage < 0 || batteryPercentage > 100) {
    errors.push("batteryPercentage must be a number between 0 and 100");
  }

  if (!rangeLeft || typeof rangeLeft !== 'number' || rangeLeft <= 0) {
    errors.push("rangeLeft must be a positive number");
  }

  if (!currentLocation?.coordinates || !Array.isArray(currentLocation.coordinates) || currentLocation.coordinates.length !== 2) {
    errors.push("currentLocation.coordinates must be an array with [longitude, latitude]");
  }

  return errors;
}

// Enhanced station data preparation
function prepareStationData(stations, currentLocation, currentDay, currentTime, rangeLeft) {
  return stations.map((station) => {
    const distanceKm = calculateDistance(
      currentLocation.coordinates,
      station.location.coordinates
    );

    // Filter peak hours for the current day
    const todayRushHours = station.rushHourData?.peakHours?.filter(
      (h) => h.day?.toLowerCase() === currentDay
    ) || [];
    
    const isInPeakHours = isWithinPeakHours(currentTime, todayRushHours);

    // Determine peak load based on current time and demand
    let currentPeakLoad = "UNKNOWN";
    let averageWaitTime = 0;
    let peakHourStart = "N/A";
    let peakHourEnd = "N/A";

    if (isInPeakHours && todayRushHours.length > 0) {
      // Find the active peak hour range
      const activePeakHour = todayRushHours.find(hour => {
        const startTime = moment(hour.startTime, "HH:mm");
        const endTime = moment(hour.endTime, "HH:mm");
        const currentMoment = moment(currentTime, "HH:mm");
        
        if (startTime.isAfter(endTime)) {
          return currentMoment.isSameOrAfter(startTime) || currentMoment.isBefore(endTime);
        } else {
          return currentMoment.isBetween(startTime, endTime, null, "[]");
        }
      });

      if (activePeakHour) {
        currentPeakLoad = activePeakHour.chargingDemand || "UNKNOWN";
        averageWaitTime = activePeakHour.averageWaitTime || 0;
        peakHourStart = activePeakHour.startTime || "N/A";
        peakHourEnd = activePeakHour.endTime || "N/A";
      }
    }

    return {
      name: station.name || "Unknown Station",
      distanceKm: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
      slotsAvailable: station.slotsAvailable || 0,
      totalSlots: station.totalSlots || station.slotsAvailable || 0,
      chargingDemand: currentPeakLoad,
      averageWaitTime: averageWaitTime,
      peakHourStart: peakHourStart,
      peakHourEnd: peakHourEnd,
      isInPeakHours: isInPeakHours,
      rating: station.ratings?.averageRating || 0,
      coordinates: station.location.coordinates,
      batterySwappingAvailable: station.batterySwapping?.isAvailable || false,
      chargingPower: station.chargingPower || "Unknown",
      price: station.pricePerKwh || "Unknown",
      operatingHours: station.operatingHours || "24/7"
    };
  }).filter(s => s.distanceKm <= rangeLeft); // Only include stations within range
}

// Enhanced AI prompt generation
function generateAIPrompt(batteryPercentage, rangeLeft, currentDay, currentTime, timezone, stationData) {
  const stationList = stationData.map((s, i) => `
Station ${i + 1}: ${s.name}
  - Distance: ${s.distanceKm} km
  - Available Slots: ${s.slotsAvailable}/${s.totalSlots}
  - Charging Demand: ${s.chargingDemand}
  - Average Wait Time: ${s.averageWaitTime} minutes
  - Peak Hours Today: ${s.peakHourStart} to ${s.peakHourEnd}
  - Currently in Peak Hours: ${s.isInPeakHours ? 'Yes' : 'No'}
  - Rating: ${s.rating}/5.0
  - Battery Swapping: ${s.batterySwappingAvailable ? 'Available' : 'Not Available'}
  - Charging Power: ${s.chargingPower}
  - Price: ${s.price}
  - Operating Hours: ${s.operatingHours}
`).join('\n');

  return `You are an expert EV charging station recommendation system. Analyze the following data and recommend the optimal charging station.

**Current EV Status:**
- Battery Level: ${batteryPercentage}%
- Remaining Range: ${rangeLeft} km
- Current Time: ${currentTime} on ${currentDay}
- Timezone: ${timezone}

**Available Charging Stations:**
${stationList}

**Recommendation Criteria (in order of priority):**
1. **Slot Availability Probability**: Consider current available slots, charging demand, and peak hour status
2. **Wait Time**: Minimize expected waiting time
3. **Distance**: Prefer closer stations when other factors are equal
4. **Reliability**: Consider station rating and operating status
5. **Additional Services**: Battery swapping, charging power, pricing

**Analysis Requirements:**
- Factor in travel time to reach the station
- Consider that high-demand stations may have no slots available upon arrival
- Account for current peak hour status and its impact on availability
- Evaluate the trade-off between distance and reliability

**Response Format:**
Provide a JSON response with these exact keys:
{
  "recommendedStation": "Station Name",
  "reason": "Detailed explanation of your recommendation including specific factors considered",
  "alternativeStation": "Second best option (if applicable)",
  "urgencyLevel": "LOW/MEDIUM/HIGH based on battery level and available options",
  "estimatedArrivalTime": "Estimated time to reach recommended station",
  "confidence": "Confidence level (1-10) in this recommendation"
}`;
}

export const getBestEVStation = async (req, res) => {
  try {
    // Input validation
    const validationErrors = validateInput(req);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Invalid input parameters", 
        errors: validationErrors 
      });
    }

    const { batteryPercentage, rangeLeft, currentLocation, timezone = 'Asia/Kolkata' } = req.body;

    // Check if battery level is critically low
    if (batteryPercentage < 5) {
      return res.status(400).json({ 
        message: "Battery level critically low. Please find the nearest charging station immediately.",
        urgencyLevel: "CRITICAL"
      });
    }

    // Calculate search radius with buffer
    const searchBuffer = Math.min(rangeLeft * 0.3, 50); // 30% buffer or max 50km
    const searchMaxDistance = (rangeLeft + searchBuffer) * 1000; // Convert to meters

    // Find nearby stations
    const nearbyStations = await evModel.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: currentLocation.coordinates,
          },
          $maxDistance: Math.min(searchMaxDistance, 10000) // Max 100km search radius
        },
      },
      isOperational: { $ne: false }, // Exclude non-operational stations
    }).limit(20); // Limit to 20 nearest stations for performance

    if (nearbyStations.length === 0) {
      return res.status(404).json({ 
        message: "No operational EV stations found within range.",
        searchRadius: Math.min(searchMaxDistance / 1000, 100)
      });
    }

    // Get current day and time
    const now = moment().tz(timezone);
    const currentDay = now.format("dddd").toLowerCase();
    const currentTime = now.format("HH:mm");

    // Prepare station data for AI analysis
    const stationDataForPrompt = prepareStationData(
      nearbyStations, 
      currentLocation, 
      currentDay, 
      currentTime, 
      rangeLeft
    );

    if (stationDataForPrompt.length === 0) {
      return res.status(404).json({ 
        message: "No suitable EV stations found within your current range.",
        availableStations: nearbyStations.length,
        rangeLeft: rangeLeft
      });
    }

    // Sort by distance for initial presentation
    stationDataForPrompt.sort((a, b) => a.distanceKm - b.distanceKm);

    // Generate AI prompt
    const prompt = generateAIPrompt(
      batteryPercentage, 
      rangeLeft, 
      currentDay, 
      currentTime, 
      timezone, 
      stationDataForPrompt
    );

    // Get AI recommendation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let aiResponse;
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      
      aiResponse = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!aiResponse.recommendedStation || !aiResponse.reason) {
        throw new Error("AI response missing required fields");
      }
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw AI response:", text);
      
      // Fallback to nearest station with available slots
      const fallbackStation = stationDataForPrompt.find(s => s.slotsAvailable > 0) || stationDataForPrompt[0];
      
      return res.status(200).json({
        recommendedStation: fallbackStation.name,
        reason: "AI parsing failed. Recommended nearest station with available slots as fallback.",
        fallback: true,
        stationDetails: fallbackStation,
        error: "AI response parsing error"
      });
    }

    // Add station details to response
    const recommendedStationDetails = stationDataForPrompt.find(
      s => s.name === aiResponse.recommendedStation
    );

    res.status(200).json({
      ...aiResponse,
      stationDetails: recommendedStationDetails,
      totalStationsAnalyzed: stationDataForPrompt.length,
      searchRadius: Math.min(searchMaxDistance / 1000, 100),
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error("EV Station Recommendation Error:", error);
    
    // Provide more specific error messages
    if (error.message.includes('API key')) {
      return res.status(500).json({ 
        message: "AI service configuration error. Please check API keys.",
        error: "Configuration Error"
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Database validation error",
        error: error.message
      });
    }
    
    res.status(500).json({ 
      message: "Internal server error while processing EV station recommendation",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};