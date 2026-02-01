// require("dotenv").config({path: './env'});
import dotenv from "dotenv";
import { app } from "./app.js";

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


//2nd Approach A production based approach
import {connectDB} from "./db/index.js";
connectDB()
.then(() => {
    app.on("error", (err) => {
        console.error("Express server error:", err);
        throw err;
    });
    app.listen(process.env.PORT || 8000,()=> {
        console.log(`Server is running at port ${process.env.PORT}`);
        console.log(`http://localhost:${process.env.PORT}`);
    });
})

.catch(err => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
});
