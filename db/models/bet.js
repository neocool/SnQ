const mongoose = require('mongoose')

const BetSchema =  new mongoose.Schema({    
    name:{
        type:String,
        required:[true,'must provide name'],
        trim:true,
        maxLength:[20,'name can not be more than 10 characters']
    },
    tableID:{
        type:String,
        required:[true,'must provide table ID'],        
    },
    roundID:{
        type:String
    }, 
    playerID:{
        type:String,
        required:[true,'must provide player ID'],
    },
    amount:{
        type:Number,
        required:[true,'must provide bet amount'],
        default:0
    },
    date: Date
})


module.exports = mongoose.model('Bet', BetSchema)