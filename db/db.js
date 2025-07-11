import mongoose from "mongoose";

export const connecttodb=async()=>{
    await mongoose.connect(process.env.MONGO_URL
    ).then(()=>{
        console.log("db is connected...")
    }).catch(error=>console.log(`mongodb error ${error}`));
}