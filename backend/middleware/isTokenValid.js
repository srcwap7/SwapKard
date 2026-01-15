const jwt = require("jsonwebtoken");
require("dotenv").config({path:"../config.env"})

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const {email,authentication_token} = decoded;
        console.log("Decoded token:", decoded);
        req.user = {email:email,authentication_token:authentication_token};
        next();
    } 
    catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
}
