import mongoose from 'mongoose';
import  bcrypt from 'bcrypt'

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  vehicleInfo: {
    model: String,
    chargingType: {
      type: String,
      enum: ['AC', 'DC', 'BOTH'],
      default: 'BOTH'
    },
    vehicleType: {
      type: String,
      enum: ['2W', '3W', '4W', 'TRUCK', 'BUS'],
      required: true
    }
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    // maxDetourDistance: {
    //   type: Number,
    //   default: 10 // km
    // },
    // preferredChargingType: {
    //   type: String,
    //   enum: ['AC', 'DC', 'BOTH'],
    //   default: 'BOTH'
    // },
    batterySwapPreference: {
      type: Boolean,
      default: false
    },
    rushHourAvoidance: {
      type: Boolean,
      default: true
    }
  },
//   tripHistory: [{
//     startLocation: {
//       type: {
//         type: String,
//         enum: ['Point']
//       },
//       coordinates: [Number]
//     },
//     endLocation: {
//       type: {
//         type: String,
//         enum: ['Point']
//       },
//       coordinates: [Number]
//     },
//     stationsUsed: [{
//       stationId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'EVStation'
//       },
//       chargingTime: Number,
//       chargeAdded: Number,
//       cost: Number,
//       timestamp: Date
//     }],
//     totalDistance: Number,
//     totalTime: Number,
//     energyConsumed: Number,
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
driverSchema.index({ "currentLocation": "2dsphere" });

driverSchema.statics.hashpassword = async function (password) {
    return await bcrypt.hash(password, 10);
}
driverSchema.methods.generatetoken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return token;
}

driverSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const usermodel=mongoose.model("Driver",driverSchema);
export default usermodel;
