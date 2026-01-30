import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//2nd Approach
//Modular setup for mongoose connection
export const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Database connected: ${connectionInstance.connection.host}`);
    }catch(err){
        console.error("Database connection Failed:", err);
        process.exit(1);
    }
};