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
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    fullAddress: String
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  operatingHours: {
    monday: { open: String, close: String, is24Hours: Boolean },
    tuesday: { open: String, close: String, is24Hours: Boolean },
    wednesday: { open: String, close: String, is24Hours: Boolean },
    thursday: { open: String, close: String, is24Hours: Boolean },
    friday: { open: String, close: String, is24Hours: Boolean },
    saturday: { open: String, close: String, is24Hours: Boolean },
    sunday: { open: String, close: String, is24Hours: Boolean }
  },
  chargingPoints: [{
    connectorType: {
      type: String,
      enum: ['CCS', 'CHAdeMO', 'Type2', 'Type1', 'GB/T'],
      required: true
    },
    chargingType: {
      type: String,
      enum: ['AC', 'DC'],
      required: true
    },
    powerOutput: Number, // in kW
    count: Number,
    isAvailable: {
      type: Boolean,
      default: true
    },
    pricePerUnit: Number, // per kWh
    isOperational: {
      type: Boolean,
      default: true
    }
  }],
  amenities: [{
    type: String,
    enum: ['PARKING', 'RESTROOM', 'CAFE', 'WIFI', 'ATM', 'RESTAURANT', 'SHOPPING', 'WAITING_AREA']
  }],
  batterySwapping: {
    isAvailable: {
      type: Boolean,
      default: false
    },
    supportedVehicles: [{
      type: String,
      enum: ['2W', '3W', '4W', 'TRUCK', 'BUS']
    }],
    swappingTime: Number, // in minutes
    pricePerSwap: Number,
    availableBatteries: Number,
    totalBatteries: Number
  },
  rushHourData: {
    peakHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String,
      endTime: String,
      congestionLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']
      }
    }],
    averageWaitTime: {
      peak: Number, // in minutes
      offPeak: Number
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  realTimeData: {
    currentOccupancy: {
      type: Number,
      default: 0
    },
    totalCapacity: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    queueLength: {
      type: Number,
      default: 0
    },
    estimatedWaitTime: {
      type: Number,
      default: 0
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
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date
}, {
  timestamps: true
});

// Index for geospatial queries
evStationSchema.index({ "location": "2dsphere" });
evStationSchema.index({ "operator": 1 });
evStationSchema.index({ "isActive": 1 });

module.exports = mongoose.model('EVStation', evStationSchema);