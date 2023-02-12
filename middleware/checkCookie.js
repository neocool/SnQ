const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('../db/models/user');
const UnauthenticatedError = require('../errors/unauthenticated')
require('dotenv').config();



const checkCookie = async (req, res, next) => {
    if (req.cookies.token) { 
        const decoded = jwt.verify(req.cookies.token,process.env.JWT_SECRET);            
        const username = decoded.username;            
        const user = await User.findOne({"username":username});
        if (user){
            next();
        }else{
            throw new UnauthenticatedError('Unauthorized')
        }
    }else{
        throw new UnauthenticatedError('Unauthorized')
    }
  };
  
  module.exports = {checkCookie}