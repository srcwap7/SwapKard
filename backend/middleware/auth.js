const jwt = require("jsonwebtoken");
const user = require("../models/userModels.js");
exports.isAuthenticated = async (req, res, next) => {
    try {
       const token = req.cookies.token;
       console.log(token);
       if(token=="j:null"){
            return res.status(401).json({
                success:false,
                message:"Not logged in currently"
            })
       }
       const decodedData= jwt.verify(token, process.env.JWT_SECRET);
       const user1=await user.findOne({email:decodedData.email})
       if(!user1){
        return res.status(401).json({
            success:false,
            message:"Not logged in currently"
        })
       }
       req.user=user1;
       next(); 
    } 
    catch (error) {
      return res.status(500).json({
         success: false,
         message: `Internal server errorrrrrr: ${error}`,
      });
    }
 };
