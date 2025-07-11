import  mongoose from 'mongoose';

const evStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  operator: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type:String,
    required: true,
  },
 
  batterySwapping: {
    isAvailable: {
      type: Boolean,
      default: false
    }
  },
  rushHourData: {
    peakHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String,
      endTime: String,

      averageWaitTime: Number,
      chargingDemand: String, // HIGH, MEDIUM, LOW
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
}, {
  timestamps: true
});

// Index for geospatial queries
evStationSchema.index({ "location": "2dsphere" });
evStationSchema.index({ "operator": 1 });
evStationSchema.index({ "isActive": 1 });

const evmodel=mongoose.model("EVStation",evStationSchema);
export default evmodel;
