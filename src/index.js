// require("dotenv").config({path: './env'});
import dotenv from "dotenv";

dotenv.config({
    path: './env'
});

//1st Approach
//Basiv setup for express server and mongoose connection
/*import express from "express";
const app = express();
(
    async () => {
        try{
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
            app.on("error", (err) => {
                console.error("Express server error:", err);
                throw err;
            });
            app.listen(process.env.PORT, () => {
                console.log(`Server is running on port ${process.env.PORT}`);
            });
        }catch(err){
            console.error("Database connection error:", err);
            throw err;
        }
    }
)()*/


//2nd Approach
import {connectDB} from "./db/index.js";
connectDB();
