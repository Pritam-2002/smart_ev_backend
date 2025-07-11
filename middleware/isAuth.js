import jwt from 'jsonwebtoken'


export const isAuth=async(req,res,next)=>{
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({ message: 'Token not found' }); 
        }

        const verifytoken= jwt.verify(token,process.env.JWT_SECRET);

        if(!verifytoken){
            return res.status(401).json({ message: 'driver does not have valid token' }); 
        }
      
          req.userId=verifytoken._id;
          next();

    }catch(error){
        console.error('isauth error:', error);
        return res.status(500).json({ message: 'isauth middleware error' },error);
    }
}