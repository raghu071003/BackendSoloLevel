import express from "express";
import { app } from "./app.js";
import { connectDb } from "./db/connectDb.js";
import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})
connectDb().then(
    app.listen(process.env.PORT || 8090,()=>{
    console.log(`Server is running on PORT ${process.env.PORT || 8090}`);
})
).catch((e)=>{
    console.log("Error Occured",e)
})