const user=require("../models/userModels")
const bcrypt=require("bcryptjs");
const JWT=require("jsonwebtoken");
const sendForgotPassOTP = require("../utils/forgotPassMailMobile");
const crypto=require("crypto");
const sendEmailVerificationOTP = require("../utils/sendVerificationOTP");
const sendEmailVerificationModel = require("../models/emailVerification");
const cloudinary = require("cloudinary").v2;
const qrcode = require('qrcode');
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});


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
            await sendEmailVerificationOTP(req, email);
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
        const result = await sendEmailVerificationModel.findOneAndDelete({ userEmail:transactionEmail,authenticationToken:authentication_token });
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

        const token = JWT.sign({ id: user1._id, email: user1.email }, process.env.JWT_SECRET, { expiresIn: '200h' });
        
        return res.status(200).json({
          success: true,
          userId: user1._id,
          qrBroadcast: qrCodeB,
          qrPrivate: qrCodeA,
          user: user1,
          token: token
        });

    }catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Internal Server error"
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
            console.log("No such account found");
            return res.status(401).json({
                success:false,
                message:"Invalid authentication token"
            });
        }


        const email = req.body.email;

        const password = req.body.password;

        console.log(email,password,transactionEmail);

        if (email !== transactionEmail){

            console.log("Security Error");  
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

        await user.findOneAndUpdate({email:email},{password:req.body.password});

        await sendEmailVerificationModel.findOneAndDelete({userEmail:email,authenticationToken:authentication_token});

        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
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

exports.registerUser = async (req,res,next) => {
    try {
        const {name,email,password,job,workAt,age,phone} = req.body;
        console.log(req.files);
        const profilePicture = req.files?.profilePicture;

        if (!name || !email || !password || !age || !job || !workAt) {
          return res.status(400).json({
            message: "Give complete Data"
          });
        }

        const existingUser = await user.findOne({ email });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "User already exists"
          });
        }

        let profilePictureUrl = "";
        if (profilePicture) {
          const cloudinaryResult = await cloudinary.uploader.upload(profilePicture.tempFilePath, {
            folder: "user_profiles",
            width: 500,
            crop: "scale"
          });
          console.log(cloudinaryResult);
          profilePictureUrl = cloudinaryResult.secure_url;
        }

        const hashedPass = await bcrypt.hash(password, 10);
        const user1 = await user.create({
          name,
          email,
          password: hashedPass,
          avatar: profilePictureUrl,
          phone:phone,
          job,
          workAt,
          age
        });

        const token = await JWT.sign({ id: user1._id, email: user1.email }, process.env.JWT_SECRET, { expiresIn: '200h' });
        const option = {
          httpOnly: false,
          secure: true,
          sameSite: "none",
          expires: new Date(Date.now() + 200 * 60 * 60 * 1000)
        };

        req.user = user1;
        res.cookie('is_auth', true, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
          expires: new Date(Date.now() + 200 * 60 * 60 * 1000)
        });

        return res.status(200).cookie('token', token, option).json({
          success: true,
          user: user1,
          token: token
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: "Internal Server error"
      });
    }
  };
  

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

        console.log("Generated authentication token:", authentication_token);

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

        console.log("**********",userR,"**************");
        
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


exports.loginUser = async (req, res, next) => {
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
        const option = {
            httpOnly: false,
            secure: true,  
            sameSite: "none",
            expires: new Date(Date.now() + 200 * 60 * 60 * 1000) 
        };
        res.cookie('token', token, option);
        res.cookie('is_auth', true, {
            httpOnly: false,
            secure: true,
            sameSite: "none",
            expires: new Date(Date.now() + 200 * 60 * 60 * 1000)
        });
        return res.status(200).json({
            success: true,
            user:user1,
            token:token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Internal Server error: ${error}`
        });
    }
};

exports.logoutUser = async (req, res, next) => {
    try {
        res.cookie('token', null, {
            httpOnly: false,
            secure: true, 
            sameSite: "none",
            expires: new Date(Date.now()) 
        });

        res.cookie('is_auth', false, {
            httpOnly: false, 
            secure: true, 
            sameSite: "none",
            expires: new Date(Date.now()) 
        });

        req.user = null; 
        return res.status(200).json({
            success: false,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}` 
        });
    }
};

exports.forgotPass = async (req, res, next) => {
    const user1 = await user.findOne({ email: req.body.email });
    if (!user1) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = user1.getresetpass();
    await user1.save({ validateBeforeSave: false });
  
    const resetPassURL = `https://swapkard.onrender.com/api/v1/resetPass/${resetToken}`;
  
    const message = `Your password reset token is: \n\n ${resetPassURL} \n\nIf you have not send this request, please ignore.`;
  
    try {
      await sendEmail({
        email: user1.email,
        subject: "Ecommerce Password recovery",
        message,
      });
      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
        user1: req.user,
      });
    }catch (error) {
      user1.resetPasswordToken = undefined;
      user1.resetPasswordExpite = undefined;
      await user1.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: `Internal server error: ${error}`,
      });
    }

};

exports.resetPassword= async(req, res)=>{
    try{
        const {password, confirmPass} = req.body;
        if(!password || !confirmPass){
            return res.status(401).json({
                success:false,
                message:"Enter complete data"
            })
        }
        if(password != confirmPass){
            return res.status(400).json({
                success:false,
                message:"Password not matching"
            })
        } 
        const tokenRecieved=crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user1=await user.findOne({resetPasswordToken:tokenRecieved});
        if(!user1){
            return res.status(400).json({
                success:false,
                message:"Invalid request"
            })
        }
        const newPassword=await bcrypt.hash(password, 10);
        user1.password=newPassword;
        user1.resetPasswordToken=undefined;
        user1.resetPasswordExpire=undefined
        await user1.save();
        return res.status(200).json({
            success:true,
            message:"Password changed successfully"
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`,
        });    
    }
}


exports.loadUser=async(req, res, next)=>{
    try{
        const user1=req.user;
        if(!user1){
            return res.status(400).json({
                success:false,
                message:"Currently not logged in"
            })
        }
        return res.status(200).json({
            success:true,
            user1
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal sever error", error
        })
    }
}

exports.updateProf=async(req, res, next)=>{
    try{
        const user1=req.user;
        const user2=await user.findByIdAndUpdate(user1.id , req.body , {
            new:true,
            runValidators:true,
            userFindAndModify:false
        })
        await user1.save();
        req.user=user2;
        return res.status(200).json({
            success:true,
            user2
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
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

exports.onScan = async(req, res, next)=>{
    try{
        const {qrId, myId, isBroadcast} = req.body;
        const bro = await user.findById(qrId);
        const me = await user.findById(myId);
        if(!bro || !me){
            return res.status(400).json({
                success:false,
                message:"User doesn't exists"
            })
        }
        if(isBroadcast == 0){
            bro.pendingList.push(myID);
            await bro.save();
        }
        if(isBroadcast == 1){
            me.contactList.push(qrId);
            await me.save();
        }
        return res.status(200).json({
            success:true,
            isBroadcast,
            me,
            bro
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.loadPending = async (req, res, next) => {
    try {
        const user1 = await user.findById(req.user._id).populate('pendingList', 'name email job workAt avatar age'); 

        if (!user1 || !user1.pendingList) {
            return res.status(404).json({
                success: false,
                message: "No pending connections found"
            });
        }

        return res.status(200).json({
            success: true,
            pendings: user1.pendingList
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.loadContact = async (req, res, next) => {
    try {
        const user1 = await user.findById(req.user._id).populate('contactList', 'name email job workAt avatar age'); 

        if (!user1 || !user1.contactList) {
            return res.status(404).json({
                success: false,
                message: "No pending connections found"
            });
        }

        return res.status(200).json({
            success: true,
            contacts: user1.pendingList 
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



exports.acceptInvite = async(req, res, next) =>{
    try{
        const {myId, broId} = req.body;
        const me = await user.findById(myId);
        const bro = await user.findById(broId);
        if(!me || !bro){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }
        bro.contactList.push(myId);
        me.contactList.push(broId);
        return res.status(200).json({
            success: true,
            me,
            bro
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}