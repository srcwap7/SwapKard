const sendEmailVerificationModel= require("../models/emailVerification");
const nodemailer=require("nodemailer");
const sendForgotPassOTP=async (req, user)=>{
    const otp=Math.floor(1000 + Math.random()*9000);
    await sendEmailVerificationModel.findOneAndDelete({userEmail:user});
    await new sendEmailVerificationModel({userEmail:user, otp:otp}).save();
    let transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    })
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user,
        subject: "OTP for password reset",
        html: `<p>Dear ${user.name},</p> <p>Following is your otp for resetting password of your SwapKard account</p>: ${otp}</h2>`
    });
}
module.exports= sendForgotPassOTP;