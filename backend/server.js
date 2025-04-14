const { app, server } =require("./app");
const dotenv=require("dotenv");
const express = require('express')
const { connectDB } = require("./config/database");
dotenv.config({path: "./config/config.env"});

connectDB();


server.listen(5000 , ()=>{
    console.log(`Server is UP.`);
});