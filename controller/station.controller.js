import EVStation from'../models/station.js';

import { EnrichAndSaveEVFromPredictions } from '../utils/GetNearbyevStations.js';


export const getAllStations = async (req, res) => {
  try {
    const { 
      lat=12.9716, 
      long=77.5946, 
      radius = 10000, 
      
    } = req.query;


    const predictionsResponse = await fetch(`https://api.olamaps.io/places/v1/nearbysearch?location=${lat},${long}&radius=${radius}&types=gas_station&api_key=${process.env.OLA_MAPS_API_KEY}`);
      
      const data = await predictionsResponse.json();
      console.log(data)
    let responsea
      if (data?.predictions?.length) {
       responsea= await EnrichAndSaveEVFromPredictions(data.predictions);
      } else {
        console.log("No stations found");
      }
   return res.status(200).json(responsea)

  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


export const findallstations=async(req,res)=>{
    try {
        const stations = await EVStation.find();
        res.json(stations);
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
}


export const getStationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const station = await EVStation.findById(id);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.json({
      success: true,
      data: { station }
    });
  } catch (error) {
    console.error('Get station by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getNearbyStations = async (req, res) => {
    try {
      const { lat, lng, radius = 5, limit = 10 } = req.query;
  
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }
  
      const stations = await EVStation.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radius * 1000
          }
        },
        isActive: true
      }).limit(parseInt(limit));
  
      res.json({
        success: true,
        data: { stations }
      });
    } catch (error) {
      console.error('Get nearby stations error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };


  export const updateRealTimeData = async (req, res) => {
    try {
      const { id } = req.params;
      const { currentOccupancy, queueLength, estimatedWaitTime } = req.body;
  
      const station = await EVStation.findByIdAndUpdate(
        id,
        {
          'realTimeData.currentOccupancy': currentOccupancy,
          'realTimeData.queueLength': queueLength,
          'realTimeData.estimatedWaitTime': estimatedWaitTime,
          'realTimeData.lastUpdated': new Date()
        },
        { new: true }
      );
  
      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Station not found'
        });
      }
  
      res.json({
        success: true,
        message: 'Real-time data updated successfully',
        data: { realTimeData: station.realTimeData }
      });
    } catch (error) {
      console.error('Update real-time data error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }; 