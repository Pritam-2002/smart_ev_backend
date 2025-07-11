import EVStation from'../models/station.js';
import validator from 'validator';

export const getAllStations = async (req, res) => {
  try {
    const { 
      lat, 
      lng, 
      radius = 10, 
      chargingType,
      batterySwap,
      page = 1,
      limit = 20
    } = req.query;

    let query = { isActive: true };
    
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    
    if (chargingType) {
      query['chargingPoints.chargingType'] = chargingType;
    }


    if (batterySwap === 'true') {
      query['batterySwapping.isAvailable'] = true;
    }

    const stations = await EVStation.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await EVStation.countDocuments(query);

    return res.json({
      success: true,
      data: {
        stations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



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