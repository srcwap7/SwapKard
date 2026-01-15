const mongoose=require("mongoose");
require("dotenv").config({path:"../config.env"});

exports.connectDB=()=>{
mongoose.connect(`mongodb+srv://arpang:${process.env.MONGO_PASSWORD}@cluster0.9auhutx.mongodb.net/?appName=Cluster0`).then((data)=>{
    console.log(`MongoDB connected to host: ${data.connection.host}`);
}).catch((err)=>{
    console.log(`Error: ${err}`);
})
}