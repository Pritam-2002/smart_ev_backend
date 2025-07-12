import drivermodel from '../models/user.model.js';

export const getcurruser=async(req,res)=>{
    try{
        const user = await drivermodel.findById(req.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
          }

        return res.status(200).json(user);
    }catch(error){
        console.error('isauth controller error:', error);
        return res.status(500).json({ message: `isauth controller error ${error}` });
    }
}