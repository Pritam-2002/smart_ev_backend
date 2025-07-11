import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  chargers: [{
    type: { type: String, enum: ['AC', 'DC'], required: true },
    power: { type: Number, required: true }, // kW
    connectorType: { type: String, enum: ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'Tesla'], required: true },
    isAvailable: { type: Boolean, default: true },
    pricePerKWh: Number,
    estimatedChargingTime: Number // minutes for 80% charge
  }],
  amenities: [{
    type: String,
    enum: ['WiFi', 'Restroom', 'Restaurant', 'Shopping', 'Parking', 'Coffee', 'ATM']
  }],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create geospatial index
stationSchema.index({ location: '2dsphere' });

// Calculate distance method
stationSchema.methods.getDistance = function(userLat, userLng) {
  const [stationLng, stationLat] = this.location.coordinates;
  const R = 6371; // Earth's radius in km
  
  const dLat = (userLat - stationLat) * Math.PI / 180;
  const dLng = (userLng - stationLng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(stationLat * Math.PI / 180) * Math.cos(userLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const usermodel=mongoose.model("Station",stationSchema);
export default usermodel;