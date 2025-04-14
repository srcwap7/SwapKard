const express=require("express");
const {sendEmailOtp,registerUser,loginUser,logoutUser,forgotPass,resetPassword,loadUser,verifyEmail,uploadProfilePic,registerUserMobile } = require("../controller/userController");
const {forgotPasswordMobile, resetPasswordMobile, loginUserMobileSignedUp} = require("../controller/userController");
const { loginUserMobile } = require("../controller/userController");
const { isAuthenticated } = require("../middleware/auth");
const { verifyToken } = require("../middleware/isTokenValid");

const router=express.Router();

router.route("/register").post(registerUser);
router.route("/verify-email").post(verifyEmail);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/forgotPass").post(forgotPass)
router.route("/resetPass/:token").post(resetPassword)
router.route("/me").get(isAuthenticated, loadUser);
router.route("/sendOtp").post(sendEmailOtp);
router.route("/uploadProfilePic").post(verifyToken,uploadProfilePic);
router.route("/details").post(verifyToken,registerUserMobile);
router.route("/forgotPasswordMobile").post(forgotPasswordMobile);
router.route("/resetPasswordMobile").post(verifyToken,resetPasswordMobile);
router.route("/loginMobile").post(loginUserMobile);
router.route("/loginMobileSignedUp").post(loginUserMobileSignedUp);

module.exports=router;