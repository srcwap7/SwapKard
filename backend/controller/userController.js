const user=require("../models/userModels")
const bcrypt=require("bcryptjs");
const JWT=require("jsonwebtoken");
const sendForgotPassOTP = require("../utils/forgotPassMailMobile");
const crypto=require("crypto");
const sendEmailVerificationOTP   = require("../utils/sendVerificationOTP");
const sendEmailVerificationModel = require("../models/emailVerification");
const cloudinary = require("../config/cloudinary_conf")
const qrcode = require('qrcode');

exports.sendEmailOtp = async(req,res,next) => {
    try{
        const {email} = req.body
        if(!email){
            return res.status(400).json({
                success:false,
                message:"Email is required"
            });
        }
        else{
            const existingUser = await user.findOne({email});
            if (existingUser){
                return res.status(401).json({
                    success:false,
                    message:"User already exists"
                });
            }
            sendEmailVerificationOTP(req, email).catch((err)=>{console.log(err);})
            return res.status(200).json({
                success:true,
                message:"OTP sent successfully"
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Internal Server error"
        });
    }
};

exports.registerUserMobile = async(req,res,next) => {
    try {
        const transactionEmail = req.user.email;
        const authentication_token = req.user.authentication_token;
        const result = await sendEmailVerificationModel.findOne({ userEmail:transactionEmail,authenticationToken:authentication_token });
        if (!result) {
            console.log(transactionEmail,authentication_token);
            console.log(result);
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        const {name,email,password,avatar,job,workAt,age,phone} = req.body;
        if (!name || !email || !password || !age || !job || !workAt) {
          return res.status(400).json({
            message: "Missing info"
          });
        }

        const existingUser = await user.findOne({ email });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "User already exists"
          });
        }
        const hashedPass = await bcrypt.hash(password, 10);
        await sendEmailVerificationModel.findOneAndDelete({email:email,authenticationToken: authentication_token});
        const privateQRSalt = crypto.randomBytes(48).toString('hex');

        const user1 = await user.create({
            name,
            email,
            password: hashedPass,
            avatar:avatar,
            phone:phone,
            job,
            workAt,
            broadcastQRsalt:privateQRSalt,
            age
        });

        const qrCodedataB = JSON.stringify({
            id: user1._id,
            type: 0,
            timestamp: Date.now(),
            randomHash: privateQRSalt,
        });

        const qrCodedataA = JSON.stringify({
            id: user1._id,
            type: 1,
            timestamp: Date.now(),
        });

        const qrCodeA = await qrcode.toDataURL(qrCodedataA);
        const qrCodeB = await qrcode.toDataURL(qrCodedataB);

        const token = JWT.sign({id: user1._id, email: user1.email}, process.env.JWT_SECRET, { expiresIn: '200h' });
        console.log(user1);
        
        return res.status(200).json({
          success: true,
          userId: user1._id,
          qrBroadcast: qrCodeB,
          qrPrivate: qrCodeA,
          user: user1,
          token:token
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Internal Server error"
        });
    }
} 

exports.forgotPasswordMobile = async(req,res,next) => {
    try{
        const {email} = req.body;
        const result = await user.findOne({email:email});
        if (!result){
            console.log("Invalid email");
            return res.status(401).json({
                success:false,
                message:"Invalid email"
            })
        }
        const otp = Math.floor(1000 + Math.random() * 9000);
        await sendForgotPassOTP(req,email,otp);
        return res.status(200).json({
            success:true,
            message:"OTP sent successfully"
        });        
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Internal Server error"
        });
    }
}


exports.uploadProfilePic = async(req,res,next) => {
    try{
        const {email,authentication_token} = req.user;
        const result = await sendEmailVerificationModel.findOne({userEmail:email,authenticationToken:authentication_token});
        if (!result){
            return res.status(401).json({
                success:false,
                message:"Invalid authentication token"
            });
        } 
        const profilePicture = req.files?.profilePicture;
        let profilePictureUrl = "";
        if (profilePicture) {
          console.log(process.env.CLOUDINARY_API_KEY);
          const cloudinaryResult = await cloudinary.uploader.upload(profilePicture.tempFilePath, {
            folder: "user_profiles",
            width: 500,
            crop: "scale"
          });
          profilePictureUrl = cloudinaryResult.secure_url;
          return res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
            fileUrl: profilePictureUrl
          });
        }
        return res.status(400).json({
          success: false,
          message: "Profile picture is required"
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Internal Server error"
        });
    }
};

exports.resetPasswordMobile = async(req,res,next) => {
    try{
        const transactionEmail = req.user.email;
        const authentication_token = req.user.authentication_token;
        const result = await sendEmailVerificationModel.findOne({userEmail:transactionEmail,authenticationToken:authentication_token});
        if (!result){
            return res.status(401).json({
                success:false,
                message:"Invalid authentication token"
            });
        }
        const email = req.body.email;
        const password = req.body.password;
        
        if (email !== transactionEmail){
            return res.status(401).json({
                success:false,
                message:"Security Error"
            });
        }

        if (!password){
            return res.status(401).json({
                success:false,
                message:"Password is required"
            });
        }

        const hashedPass = await bcrypt.hash(req.body.password,10);
        await user.findOneAndUpdate({email:email},{password:hashedPass});
        await sendEmailVerificationModel.findOneAndDelete({userEmail:email,authenticationToken:authentication_token});
        return res.status(200).json({success:true,message:"Password reset successfully"});
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Internal Server error"
        });
    }
}
  

  exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log("Received request to verify email with:", { email, otp });

        if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });
        
        const emailver = await sendEmailVerificationModel.findOne({ userEmail: email, otp: otp });
        if (!emailver) {
            console.log("Invalid OTP or email");
            return res.status(400).json({ success: false, message: "Invalid OTP or email" });
        }

        if (emailver.createdAt + 5*60*1000 < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        const my_secret_key = process.env.JWT_SECRET;
        if (!my_secret_key) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const authentication_token = crypto.randomBytes(32).toString('hex');

        const token = JWT.sign(
            { email, authentication_token },
            my_secret_key,
            { expiresIn: '15m' }
        );
    
        await sendEmailVerificationModel.findOneAndUpdate(
            { userEmail: email },
            { authenticationToken: authentication_token }
        );

        console.log("Email verification successful");
        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            token: token,
        });
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ success: false, message: `Unable to verify email: ${error.message}` });
    }
};

exports.loginUserMobileSignedUp = async(req,res,next)=>{
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Enter complete data."
            });
        }
        const user1 = await user.findOne({ email });
        if (!user1) {
            console.log("User not found");
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const comp = await bcrypt.compare(password, user1.password);
        if (!comp) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = JWT.sign({ id: user1._id, email: user1.email }, process.env.JWT_SECRET, { expiresIn: '120h' });
        let userR = await user.findById(user1._id).select("_id name email deltaPending deltaConnection deletedConnections eventQueue").lean(); 
        const fields          = '_id name email job workAt avatar phone age';   

        userR.deltaPending    = await manuallyPopulateList(userR.deltaPending || [], fields);
        userR.deltaConnection = await manuallyPopulateList(userR.deltaConnection || [],fields);

        
        return res.status(200).json({
            success: true,
            user:userR,
            token: token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Internal Server error: ${error}`
        });
    }
}

async function manuallyPopulateList(list,fieldsToSelect) {
    const ids = list.map(entry => entry.id);
    const users = await user.find({ _id: {$in:ids} }, fieldsToSelect).lean();
    const userMap = {};
    users.forEach(u => {
        userMap[u._id.toString()] = u;
    });
    return list.map(entry => (userMap[entry.id.toString()]||null));
}
  

exports.loginUserMobile = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Enter complete data."
            });
        }

        const user1 = await user.findOne({ email });
        if (!user1) {
            console.log("User not found");
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const comp = await bcrypt.compare(password, user1.password);
        if (!comp) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = JWT.sign({ id: user1._id, email: user1.email }, process.env.JWT_SECRET, { expiresIn: '120h' });
        const userR = await user.findById(user1._id).lean();

        const fields          = '_id name email job workAt avatar phone age';
        userR.pendingList     = await manuallyPopulateList(userR.pendingList || [], fields);
        userR.deltaPending    = await manuallyPopulateList(userR.deltaPending || [], fields);
        userR.contactList     = await manuallyPopulateList(userR.contactList || [],fields);
        userR.deltaConnection = await manuallyPopulateList(userR.deltaConnection || [],fields);

        console.log(userR);

        const qrCodedataB = JSON.stringify({
            id:user1._id,
            type:0,
            timestamp: Date.now(),
            randomHash:user1.broadcastQRsalt
        });


        const qrCodedataA = JSON.stringify({
            id: user1._id,
            type: 1,
            timestamp:Date.now(),
        });

        const qrCodeA = await qrcode.toDataURL(qrCodedataA);
        const qrCodeB = await qrcode.toDataURL(qrCodedataB);

        return res.status(200).json({
            success:true,
            user:userR,
            qrBroadcast: qrCodeB,
            qrPrivate: qrCodeA,
            token: token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Internal Server error: ${error}`
        });
    }
};

exports.generateQR = async (req, res, next) => {
    try {
        const { id, isBroadcast } = req.body;
        const user1 = await user.findById(id);

        if (!user1) {
            return res.status(400).json({   
                success: false,
                message: "User doesn't exist"
            });
        }

        let qrCodedata;
        if (isBroadcast === '1') {
            qrCodedata = JSON.stringify({
                id: id,
                type: 1,
                timestamp: Date.now() 
            });
        } else {
            qrCodedata = JSON.stringify({
                id: id,
                type: 0,
                timestamp: Date.now()
            });
        }

        const qrcodeurl = await qrcode.toDataURL(qrCodedata);
        user1.qrcodeurl = qrcodeurl;
        await user1.save();

        return res.status(200).json({
            success: true,
            qrType: isBroadcast === '1' ? 'broadcast' : 'connection',
            qrcodeurl,
            user1
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};