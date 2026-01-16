const mongoose= require("mongoose");
  
const sendEmailVerificationSchema= new mongoose.Schema({
  userEmail: {type:String,required:true},
  otp: {type: String, required: true},
  authenticationToken : {type:String},
  createdAt: {type:Date, default: Date.now,expires:'900000'}
});

const sendEmailVerificationModel = mongoose.model("EmailVerification", sendEmailVerificationSchema);
module.exports=sendEmailVerificationModel;