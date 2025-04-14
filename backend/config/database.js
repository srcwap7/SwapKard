const mongoose=require("mongoose");

exports.connectDB=()=>{
mongoose.connect("mongodb+srv://arpang:coromandelexpress12841@cluster0.9auhutx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then((data)=>{
    console.log(`MongoDB connected to host: ${data.connection.host}`);
}).catch((err)=>{
    console.log(`Error: ${err}`);
})
}