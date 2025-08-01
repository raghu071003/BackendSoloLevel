import mongoose from "mongoose";

const connectDb = async()=>{
    try {
        const mongoInstance = await mongoose.connect(`${process.env.MONGO_URI}soloDSA`)  
        console.log("Connected");
    } catch (error) {
        console.log(error);
        
    }
}
export {connectDb}