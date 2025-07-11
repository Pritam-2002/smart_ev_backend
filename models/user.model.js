const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    vehicleInfo: {
        make: String,
        model: String,
        year: Number,
        batteryCapacity: Number, // in kWh
        maxRange: Number // in km
    },
    currentLocation: {
        latitude: Number,
        longitude: Number,
        address: String,
        lastUpdated: Date
    },
    preferences: {
        maxDistance: { type: Number, default: 50 }, // km
        preferredChargingSpeed: { type: String, enum: ['slow', 'fast', 'rapid'], default: 'fast' },
        notifications: { type: Boolean, default: true }
    },
    searchHistory: [{
        batteryLevel: Number,
        location: {
            latitude: Number,
            longitude: Number
        },
        recommendedStation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Station'
        },
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

userschema.statics.hashpassword = async function (password) {
    return await bcrypt.hash(password, 10);
}
userschema.methods.generatetoken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return token;
}

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const usermodel=mongoose.model("user",userschema);
export default usermodel;
