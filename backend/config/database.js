const mongoose=require("mongoose");

exports.connectDB=()=>{
mongoose.connect("mongodb+srv://ashwinj:Ashwin4545@cluster3.0f17v.mongodb.net/zwapkard?retryWrites=true&w=majority&appName=Cluster3").then((data)=>{
    console.log(`MongoDB connected to host: ${data.connection.host}`);
}).catch((err)=>{
    console.log(`Error: ${err}`);
})
}