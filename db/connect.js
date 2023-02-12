const mongoose = require('mongoose')
require('dotenv').config()


const connectDB = (url)=>{
    mongoose.set('strictQuery', false);
    return mongoose.connect(url)
}

module.exports = connectDB;