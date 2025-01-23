const app=require("./app");
const dotenv=require("dotenv");
const express = require('express')
const http = require('http')
const { Server } = require("socket.io");
const { connectDB } = require("./config/database");
dotenv.config({path: "./config/config.env"});
connectDB();

const server = http.createServer(app);


server.listen(5000 , ()=>{
    console.log(`Server is UP.`);
});