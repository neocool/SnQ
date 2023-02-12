const mongoose = require('mongoose')

const TableSchema =  new mongoose.Schema({    
    name:{
        type:String,
        required:[true,'must provide name'],
        trim:true,
        maxLength:[20,'name can not be more than 30 characters']
    },
    min:{
        type:Number,
        required:[true,'must table min'],
        default:1
    },
    max:{
        type:Number,
        required:[true,'must table max'],
        default:1000
    },   
    previousNumbers:[{
        type:Number
    }],
    roundID:{
        type:String,
        default:"1"
    },   
    current_Players:[{
        type:String
    }],
    current_number:{
        type:Number
    },
    timer:{
        type:Number,
        default:0
    },
    enabled:{
        type:Boolean,
        default:true
    }
})


module.exports = mongoose.model('Table', TableSchema)