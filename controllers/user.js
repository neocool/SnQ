const {asyncWrapper} = require('../middleware/async')
const User = require('../db/models/user');
const UnauthenticatedError = require('../errors/unauthenticated')
const BadRequest = require('../errors/bad-request')
const unauthorized = require('../errors/unauthorized')
const notfound = require('../errors/not-found')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const zxcvbn = require('zxcvbn');
const e = require('express');
require('dotenv').config();
const validator = require('validator');
const { options } = require('toastr');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');

//helper functions
function deconstructCookie(cookies){
    const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET);      
    id = decoded.id
    username =   decoded.username
    return {id,username}
}
function constructCookie(id,username){
    const token = jwt.sign({id,username},process.env.JWT_SECRET,{expiresIn:'30d'}); 
    return token
}
//api functions
const registerUser = asyncWrapper (async (req,res)=>{  
    let {name, email,password} = req.body;
    email = email.toLowerCase();
    username = email.split("@")[0]
    let user = await User.findOne({"email":email}).select("-bet_history");
    
    
    if (!validator.isAlpha(name,'en-US',{ignore: " "})){
        throw new BadRequest('The name includes unacceptable characters') 
    }

    if (!validator.isEmail(email)){
        throw new BadRequest('Invalid Email') 
    }

    //check if user already exsists
    if (user){
        //pretending that we are creating an account to stop user harvesting/timed attacks
        const strength = zxcvbn(password);    
        if (strength.score > 1){
            const hashedpassword = await bcrypt.hash(password, 10);           
            res.status(201).json({success:true});
        }
        else{
            res.status(422).json({success:false,msg:strength.feedback});
        }
    }else{
        //check if username already exsists
        user = await User.findOne({"username":username}).select("-bet_history");
        while (user){
            username = username + JSON.stringify(Math.floor(Math.random()*1000))
            user = await User.findOne({"username":username}).select("-bet_history");
        };

        const strength = zxcvbn(password);    
        if (strength.score > 1){
            const hashedpassword = await bcrypt.hash(password, 10);
            const user = await User.create({"name":name, "email":email,"username":username,"password":hashedpassword});
            res.status(201).json({success:true});
        }
        else{
            res.status(422).json({success:false,msg:strength.feedback});
        }
    }  
})

const disableDFA = asyncWrapper (async (req,res)=>{
    const {id,username} = deconstructCookie(req.cookies)   
    updates = {"dualFactorKey":'',"dfa_enabled":false}   
    const user = await User.updateOne({_id:id},updates,{new:true,runValidators:true});
    return res.status(201).json({success:true}) 
})

const twoFactorAuth = asyncWrapper (async (req,res)=>{
    const {id,username} = deconstructCookie(req.cookies) 
    let secret = speakeasy.generateSecret({length: 20});    
    updates= {"dualFactorKey":secret.base32,"dfa_enabled":true}    
    const user = await User.updateOne({_id:id},updates,{new:true,runValidators:true});
    QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
        return res.status(201).json({image_data})
        console.log(image_data); // A data URI for the QR code image
      });
})

const login = asyncWrapper (async (req,res)=>{
    const {username,password} = req.body;
    
    if (!validator.isAlphanumeric(username)){
        throw new unauthorized('Unauthorized') 
    }
    const user = await User.findOne({"username":username}).select("-bet_history");    
    const match =  await bcrypt.compare(password, user.password);
    if (user.password_attempts <= 5){
        if (match){
            if (user.dualFactorKey){                
                const {token}= req.body
                if (!token){
                    return res.status(200).json({success:true,msg:"Please provide two factor authentication"}) 
                }
                const secret = user.dualFactorKey                
                // Verify that the user token matches what it should at this moment                
                const verified = speakeasy.totp.verify({
                    secret: secret,
                    encoding: 'base32',
                    token: token
                });                
                if (verified){
                    await User.updateOne({_id:user._id},{"password_attempts":0},{
                        new:true,runValidators:true
                    });
                    id = user._id.toString();                         
                    const token = constructCookie(id,username)     
                    return res.status(201).cookie('token',token,{httpOnly:true}).json({success:true}) 
                }else{
                    throw new unauthorized('Unauthorized') 
                }
            }else{
                await User.updateOne({_id:user._id},{"password_attempts":0},{
                    new:true,runValidators:true
                });
                id = user._id.toString();                         
                const token = constructCookie(id,username)     
                return res.status(201).cookie('token',token,{httpOnly:true}).json({success:true}) 
            }            
        }else{
            await User.updateOne({_id:user._id},{"password_attempts":user.password_attempts+1},{
                new:true,runValidators:true
            });
            throw new unauthorized('Unauthorized') 
        }
    }else {
        throw new BadRequest('Account Locked out') 
    }
})

const logout = asyncWrapper (async (req,res)=>{
    if (req.cookies.token) { 
        const {id,username} = deconstructCookie(req.cookies)                
        const user = await User.findOne({_id:id}).select("-password -bet_history");            
        if (user){
            //send response back and clear cookie
            return res.status(201).clearCookie("token").json({success:true})            
        }else{
            return res.status(404).clearCookie("token").json({success:false})
        }
    }else{
        return res.status(404).clearCookie("token").json({success:false})
    }
})

const getAllUsers = asyncWrapper (async (req,res)=>{
    if (req.cookies.token){
        const {id,username} = deconstructCookie(req.cookies)                
        const user = await User.findOne({_id:id}).select("-password -bet_history");
        if (user.admin == true){
            const users = await User.find({}).select("-password -bet_history");
            res.status(201).json({users})
        }else{
            throw new unauthorized('Unauthorized') 
        }        
    }else{
        throw new UnauthenticatedError('Unauthenticated')
    }
})

const getUser = asyncWrapper (async (req,res)=>{
    if (!req.cookies.token){        
        throw new UnauthenticatedError('Unauthorized')
    }else if(req.cookies.token){
        const {id,username} = deconstructCookie(req.cookies)           
        const user = await User.findOne({"username":username}).select("-password -bet_history -admin -bet_history -dualFactorKey -password_attempts");       
        if (user._id == id){
            return res.status(201).json({user})            
        }else{
            throw new unauthorized('Unauthorized')            
        }
    }
})

const updateUser = asyncWrapper (async (req,res)=>{                         
    if(req.cookies.token && req.body.currentPassword && req.body.newPassword){ 
        const {id,username}= deconstructCookie(req.cookies)           
        let user = await User.findOne({_id:id}).select("-bet_history");        
        const {currentPassword,newPassword} = req.body;     
        const strength = zxcvbn(newPassword);
        const match =  await bcrypt.compare(currentPassword, user.password); 
        if (strength.score <= 1){  
            res.status(422).json({success:false,msg:strength.feedback});
        }else if (match){
            try{
            const hashedpassword = await bcrypt.hash(newPassword, 10);
            user = await User.updateOne({_id:req.params.id},{"password":hashedpassword},{
                new:true,runValidators:true
            });
            const token = constructCookie(id,username)  
            return res.status(201).cookie('token',token ,{httpOnly:true}).json({success:true})
            }catch (err){
                console.log(err)
            }
        }else{            
            throw new UnauthenticatedError('Unauthorized')
        }
        
    }else if(req.cookies.token){        
        const {id,username}= deconstructCookie(req.cookies)           
        let user = await User.findOne({_id:id}).select("-bet_history"); 
        const {newusername,newaddress,newphone,gameSettings} = req.body
        
        if (newusername){
            if (!validator.isAlphanumeric(newusername)){
                throw new BadRequest('Invalid username') 
            }
        }

        if (newphone){
            if (!validator.isMobilePhone(newphone)){
                throw new BadRequest('Invalid phone number') 
            }
        }
        if (newaddress){
            if (!validator.isAlphanumeric(newaddress,'en-US',{ignore: " "})){
                throw new BadRequest('Invalid address') 
            }
        }
        const updates = {};
        if(newusername){updates.username=newusername;};if(newaddress){updates.address=newaddress;};if(newphone){updates.phone=newphone;};if(gameSettings){updates.gameSettings=gameSettings;};
        if (user){            
            const user = await User.updateOne({_id:id},updates,{
                new:true,runValidators:true
            });
            res.status(201).json({success:true})
        }else{
            throw new unauthorized('Unauthorized')
        }
    }else{
        throw new unauthorized('Unauthorized')
    }
})

const deleteUser = asyncWrapper (async (req,res)=>{
    if (req.cookies.token){ 
        const {id,username}= deconstructCookie(req.cookies)
        const adminUser = await User.findOne({_id:id}).select("-password -bet_history");         
        if (adminUser.admin == true){
            const user = await User.findOneAndDelete({_id:req.params.id}).select("-password -bet_history"); ;
            res.status(201).json({success:true})
            return res.status(404).json({msg:`no user with id: ${req.params.id}`})
        }else{
            throw new unauthorized('Unauthorized')
        }
    }else{
        throw new unauthorized('Unauthorized')
    }
})

module.exports = {registerUser,getAllUsers,getUser,updateUser,deleteUser,login,logout,twoFactorAuth,disableDFA};