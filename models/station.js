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
  // Ola Maps Integration Data
  olaMapData: {
    place_id: String,
    reference: String,
    description: String,
    types: [String],
    layer: [String],
    distance_meters: Number,
    business_status: String,
    url: String,
    formatted_phone_number: String,
    international_phone_number: String,
    website: String,
    photos: [String],
    rating: Number,
    amenities_available: [String],
    wheelchair_accessibility: Boolean,
    parking_available: Boolean,
    is_landmark: Boolean,
    landmark_type: String,
    payment_mode: String,
    popular_items: [String],
    language_spoken: String,
    opening_hours: {
      open_now: Boolean,
      periods: [{
        open: {
          day: Number,
          time: String
        },
        close: {
          day: Number,
          time: String
        }
      }],
      weekday_text: [String]
    }
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
    fullAddress: String,
    // Structured address from Ola Maps
    structured_formatting: {
      main_text: String,
      secondary_text: String
    },
    terms: [{
      offset: Number,
      value: String
    }]
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
    totalBatteries: Number,
    swappingStations: [{
      stationNumber: String,
      isOperational: Boolean,
      lastMaintenance: Date,
      batteryTypes: [String], // Different battery capacities
      roboticSwapping: Boolean // Automated or manual
    }],
    reservationRequired: Boolean,
    advanceBookingHours: Number,
    compatibleBrands: [String] // Vehicle brands supported
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
        enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'EXTREME']
      },
      averageWaitTime: Number,
      chargingDemand: String, // HIGH, MEDIUM, LOW
      priceMultiplier: Number // Dynamic pricing during rush hours
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
  sustainabilityScore: {
    renewableEnergyPercentage: Number,
    carbonFootprint: Number,
    solarPanels: Boolean,
    windPower: Boolean,
    greenCertification: String
  },
  emergencyServices: {
    has24x7Support: Boolean,
    towingService: Boolean,
    emergencyCharging: Boolean,
    breakdownAssistance: Boolean,
    emergencyContactNumber: String
  },
  accessibility: {
    wheelchairAccessible: Boolean,
    audioAssistance: Boolean,
    visualAssistance: Boolean,
    brailleSignage: Boolean,
    lowHeightChargers: Boolean,
    assistedCharging: Boolean
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

const evmodel=mongoose.model("EVStation",evStationSchema);
export default evmodel;
