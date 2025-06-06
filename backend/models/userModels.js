const mongoose=require("mongoose");
const crypto=require("crypto");

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
    },
    password:{
        type:String,
        required:true,
        minLength:[8, "Enter at least 6 characters"]
    },
    job:{
        type:String,
    },
    workAt:{
        type:String
    },
    contactList:[{
        id:{
            type:mongoose.Schema.ObjectId,
        }
    }],
    avatar:{
        type: String
    },
    age:{
        type:Number
    },
    dirty:{
        type:Boolean,
        default:false
    },
    deltaConnection:[{
        id:{type:mongoose.Schema.ObjectId}
    }],
    deltaPending:[{
        id:{type:mongoose.Schema.ObjectId}
    }],
    deletedConnections:[{
        id:{type:mongoose.Schema.ObjectId}
    }],
    broadcastQRsalt:{
        type:String
    },
    pendingList:[{
        id:{type:mongoose.Schema.ObjectId}
    }],
    eventQueue:[{
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        fieldChanged: {
          type: String,
          required: true,
        },
        newData: {
          type: mongoose.Schema.Types.Mixed, // allows strings, numbers, objects, etc.
          required: true,
        }
    }],
    invitationsSent:[{
        id:{type:mongoose.Schema.ObjectId}
    }],
    resetPasswordToken:String,
    resetPasswordExpire: Date,
})

userSchema.methods.getresetpass=function(){
    const resetToken=crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire=new Date(Date.now()+15*60*1000);
    return resetToken;
}
module.exports = mongoose.model("User",userSchema );