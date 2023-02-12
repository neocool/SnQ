const mongoose = require('mongoose')

const UserSchema =  new mongoose.Schema({
    name:{
        type:String,
        required:[true,'must provide name'],
        trim:true,
        maxLength:[30,'name can not be more than 30 characters']
    },
    phone:{
        type:String,        
        trim:true,
        maxLength:[20,'phone can not be more than 30 characters']
    },    
    address:{
        type:String,        
        trim:true,
        maxLength:[30,'address can not be more than 30 characters']
    },      
    email:{
        type:String,
        required:[true,'must provide email'],
        trim:true,
        maxLength:[50,'email can not be more than 50 characters']
    },
    username:{
        type:String,
        required:[true,'must provide username'],
        trim:true,
        maxLength:[20,'username can not be more than 20 characters']
    },
    password:{
        type:String,
        required:[true,'must provide a password'],
        trim:true,        
    },    
    password_attempts:{
        type:Number,
        default:0
    },
    dualFactorKey:{
        type:String,  
    },
    dfa_enabled:{
        type:Boolean,
        default:false 
    },
    balance:{
        type:Number,
        default:10000
    },
    current_bets: [{
          table: Number,
          bet: String,
        }],
    bet_history:[{
        tableID:Number,
        bet:String,
        outcome:String        
        }],
    gameSettings:[{
        name:String,
        live:Boolean,       
        }],
    admin:{
        type:Boolean,
        default:false
    },
    enabled:{
        type:Boolean,
        default:true
    }
})


module.exports = mongoose.model('User', UserSchema)