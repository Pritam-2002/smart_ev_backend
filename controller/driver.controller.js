import validator from "validator";
import drivermodel from '../models/user.model.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, phone, vehicleInfo } = req.body;
        console.log("Registering driver with data:", req.body);

        const existuser = await drivermodel.findOne({ $or: [{ email }, { phone }] });
        if (existuser) {
            return res.status(400).json({ message: "driver already exist" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Enter Valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "password minimum 8 charecters" });
        }

        const hashpassword = await drivermodel.hashpassword(password);

        const driver = await drivermodel.create({
            name,
            email,
            password: hashpassword,
            phone,
            vehicleInfo
        });
        await driver.save();

        const token = await driver.generatetoken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({
            success: true,
            message: 'Driver registered successfully',
            data: {
                driver: {
                    id: driver._id,
                    name: driver.name,
                    email: driver.email,
                    phone: driver.phone,
                    vehicleInfo: driver.vehicleInfo
                },
                token
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: `register error ${error}` })
    }
}



export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const driver = await drivermodel.findOne({ email })
        if (!driver) {
            return res.status(404).json({ message: "driver not found" });
        }
        const ismatch = await driver.comparePassword(password);
        if (!ismatch) {
            return res.status(400).json({ message: "Incorrect Password" });
        }
        const token = await driver.generatetoken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return res.json({
            success: true,
            message: 'Login successful',
            data: {
                driver: {
                    id: driver._id,
                    name: driver.name,
                    email: driver.email,
                    phone: driver.phone,
                    vehicleInfo: driver.vehicleInfo,
                    currentLocation: driver.currentLocation,
                    preferences: driver.preferences
                },
                token
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Server error during login" });
    }
}

export const updateLocation = async (req, res) => {
    try {
      const { latitude, longitude, address } = req.body;
  
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }
  
      const driver = await drivermodel.findByIdAndUpdate(
        req.userId,
        {
            currentLocation: {
            type: 'Point',
            coordinates: [longitude, latitude],
            address: address || '',
            lastUpdated: new Date()
          }
        },
        { new: true }
      ).select('-password');
  
       return res.json({
        success: true,
        message: 'Location updated successfully',
        data: { 
          currentLocation: driver.currentLocation 
        }
      });
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };