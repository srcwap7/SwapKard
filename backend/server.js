require("dotenv").config({path:"./config.env"});
const { app, server } =require("./app");
const { connectDB } = require("./config/database");
connectDB();
server.listen(2000,()=>{console.log(`Server is UP.`);});