const cookieParser = require('cookie-parser');
const {asyncWrapper} = require('../middleware/async')
const jwt = require('jsonwebtoken');
const User = require('../db/models/user');
const UnauthenticatedError = require('../errors/unauthenticated')
const BadRequest = require('../errors/bad-request')
const unauthorized = require('../errors/unauthorized')
require('dotenv').config();


const checkCookie = asyncWrapper ( async (req,res)=>{
    if (req.cookies.token) { 
        const decoded = jwt.verify(req.cookies.token,process.env.JWT_SECRET);            
        const username = decoded.username;            
        const user = await User.findOne({"username":username}).select("-password -bet_history");
        if (user){
            return res.status(201).json({success:true})}
        else{
            throw new unauthorized('Unauthorized')
        }
    }else{
        throw new unauthorized('Unauthorized')
    }
})


module.exports = {checkCookie}