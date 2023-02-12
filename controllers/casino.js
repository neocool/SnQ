const {asyncWrapper} = require('../middleware/async')
const User = require('../db/models/user');
const Table = require('../db/models/table');
const Bet = require('../db/models/bet');
const cookieParser = require('cookie-parser');
const UnauthenticatedError = require('../errors/unauthenticated')
const BadRequest = require('../errors/bad-request')
const unauthorized = require('../errors/unauthorized')
const notfound = require('../errors/not-found')
const validator = require('validator');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const {startTable} = require("./roulette-app");
const table = require('../db/models/table');
const user = require('../db/models/user');

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

const createTable = asyncWrapper (async (req,res)=>{    
    const {name,min,max} = req.body;   
    if (name){
        if (!validator.isAlpha(name)){
            throw new BadRequest('Invalid table name') 
        }
    }
    if (min){
        if (typeof min== Number ){
            throw new BadRequest('Invalid min amount') 
        }
    }
    if (max){
        if (typeof max== Number ){
            throw new BadRequest('Invalid max amount') 
        }
    }
    const table = await Table.create({"name":name, "min":min,"max":max});
    startTable(table._id,table.roundID);
    res.status(201).json({success:true,"id":table._id})

})
const getAllTables = asyncWrapper (async (req,res)=>{
    const tables = await Table.find({})
    res.status(201).json({tables})
})

const getTable = asyncWrapper (async (req,res)=>{ 
    if (req.params.id){
        if (!validator.isAlphanumeric(req.params.id)){
            throw new BadRequest('Invalid tableID') 
        }
    }    
          
    const table = await Table.findOne({_id:req.params.id});
    if (!table){
        throw new notfound('No table found')
        
    }else{
        res.status(201).json(table)
    }
})

const updateTable = asyncWrapper (async (req,res)=>{
    if (req.params.id){
        if (!validator.isAlphanumeric(req.params.id)){
            throw new BadRequest('Invalid tableID') 
        }
    }
    if (req.cookies.token){
        const {id,username} = deconstructCookie(req.cookies)                
        const user = await User.findOne({_id:id}).select("-password -bet_history");
        if (user.admin == true){
            const table = await Table.updateOne({_id:req.params.id},req.body,{
                new:true,runValidators:true
            });
            if (!table){
                throw new notfound('No table found')
            }else{
                res.status(201).json({table})
            }
        }else{
            throw new unauthorized('Unauthorized') 
        }
    }
})

const deleteTable = asyncWrapper (async (req,res)=>{
    if (req.params.id){
        if (!validator.isAlphanumeric(req.params.id)){
            throw new BadRequest('Invalid tableID') 
        }
    }
    if (req.cookies.token){
        const {id,username} = deconstructCookie(req.cookies)                
        const user = await User.findOne({_id:id}).select("-password -bet_history");
        if (user.admin == true){
            const table = await Table.findOneAndDelete({_id:req.params.id});
            if (!table){
                throw new notfound('No table found')
            }else{
                res.status(201).json({success:true})
            }
        }else{
            throw new unauthorized('Unauthorized') 
        }
    }
})

const getALlBets = asyncWrapper (async (req,res)=>{    
    const {playerID,tableID}=req.body
    if (playerID){
        if (!validator.isAlphanumeric(playerID)){
            throw new BadRequest('Invalid playerID') 
        }
    }
    if (tableID){
        if (!validator.isAlphanumeric(tableID)){
            throw new BadRequest('Invalid tableID') 
        }
    }
    const bets = await Bet.find({"tableID":tableID,"playerID":playerID})
    res.status(201).json({bets})
})

const getBet = asyncWrapper(async (req,res)=>{
    
})

const placeBet = asyncWrapper(async (req,res)=>{    
    const {id,username} = deconstructCookie(req.cookies)
    const {name,tableID,playerID,amount} = req.body; 
    if (name){
        if (!validator.isAlphanumeric(name)){
            throw new BadRequest('Invalid Bet') 
        }
    }
    if (tableID){
        if (!validator.isAlphanumeric(tableID)){
            throw new BadRequest('Invalid tableID') 
        }
    }
    if (playerID){
        if (!validator.isAlphanumeric(playerID)){
            throw new BadRequest('Invalid playerID') 
        }
    }
    if (amount){
        if (typeof amount == Number){
            throw new BadRequest('Invalid amount') 
        }
    }
    const {roundID} = await Table.findOne({_id:tableID}); 
    const player = await User.findOne({_id:playerID}).select("-password"); 
    if (id == playerID && amount <= player.balance){
        const bet = await Bet.create({"name":name,"roundID":roundID, "tableID":tableID,"playerID":playerID,"amount":amount});    
        const user = await User.findOne({_id:playerID});    
        await User.updateOne({_id:playerID},{"balance":user.balance-amount},{
            new:true,runValidators:true
        });
        
        res.status(201).json({success:true})
    }
    else{
        throw new BadRequest('Failed to place a bet.')
    }
})

const clearBets = asyncWrapper(async (req,res)=>{
    const {id,username} = deconstructCookie(req.cookies)
    const {tableID,playerID} = req.body;
    if (tableID){
        if (!validator.isAlphanumeric(tableID)){
            throw new BadRequest('Invalid tableID') 
        }
    }
    if (playerID){
        if (!validator.isAlphanumeric(playerID)){
            throw new BadRequest('Invalid playerID') 
        }
    }
    if (id == playerID){        
        const {roundID} = await Table.findOne({_id:tableID}); 
        const player = await User.findOne({_id:playerID}); 
        const bets = await Bet.find({"tableID":tableID,"roundID":roundID,"playerID":playerID});       
        let betTotal = 0;
        for (const bet of bets){
            betTotal += bet.amount;            
        }
        const newBalance = player.balance + betTotal        
        
        await User.updateOne({_id:playerID},{"balance":newBalance},{new:true,runValidators:true});
        await Bet.deleteMany({"tableID":tableID,"roundID":roundID,"playerID":playerID});
        res.status(201).json({success:true})
    }else{
        throw new unauthorized('Unauthorized')
    }
})

const doubleBets = asyncWrapper(async (req,res)=>{    
    const {id,username} = deconstructCookie(req.cookies)
    const {playerID,tableID} = req.body;
    if (tableID){
        if (!validator.isAlphanumeric(tableID)){
            throw new BadRequest('Invalid tableID') 
        }
    }
    if (playerID){
        if (!validator.isAlphanumeric(playerID)){
            throw new BadRequest('Invalid playerID') 
        }
    }
    if (id == playerID){        
        const table =  await Table.findOne({_id:tableID});             
        const player = await User.findOne({_id:playerID});                   
        const bets = await Bet.find({"tableID":tableID,"roundID":table.roundID,"playerID":playerID});        
        let betTotal = 0;        
        for (const bet of bets){
            betTotal += bet.amount;            
        }
        if (betTotal*2 <= table.max){
            for (bet of bets){
                await Bet.updateOne({_id:bet._id},{"amount":bet.amount*2},{new:true,runValidators:true});
            }
            await User.updateOne({_id:playerID},{"balance":player.balance-betTotal},{new:true,runValidators:true});
        }else{
            throw new BadRequest('Table Max Reached!')
        }

        res.status(201).json({success:true})
    }else{
        throw new unauthorized('Unauthorized')
    }
})

const repeatBets = asyncWrapper(async (req,res)=>{
    const {id,username} = deconstructCookie(req.cookies)
    if (id == playerID){
        const {tableID,playerID} = req.body;
        if (tableID){
            if (!validator.isAlphanumeric(tableID)){
                throw new BadRequest('Invalid tableID') 
            }
        }
        if (playerID){
            if (!validator.isAlphanumeric(playerID)){
                throw new BadRequest('Invalid playerID') 
            }
        }
        const {roundID} = await Table.findOne({_id:tableID}); 
        const player = await User.findOne({_id:playerID}); 
        const bets = await Bet.find({"tableID":tableID,"roundID":roundID,"playerID":playerID});       
        let betTotal = 0;
        for (const bet of bets){
            betTotal += bet.amount;            
        }
        const newBalance = player.balance + betTotal        
        
        await User.updateOne({_id:playerID},{"balance":newBalance},{new:true,runValidators:true});
        await Bet.deleteMany({"tableID":tableID,"roundID":roundID,"playerID":playerID});
        res.status(201).json({success:true})
    }else{
        throw new unauthorized('Unauthorized')
    }
})

const totalBets = asyncWrapper(async (req,res)=>{
    const {tableID,roundID,playerID} = req.body; 
    if (tableID){
        if (!validator.isAlphanumeric(tableID)){
            throw new BadRequest('Invalid tableID') 
        }
    }
    if (playerID){
        if (!validator.isAlphanumeric(playerID)){
            throw new BadRequest('Invalid playerID') 
        }
    }
    if (roundID){
        if (!validator.isNumeric(roundID)){
            throw new BadRequest('Invalid roundID') 
        }
    }
    const bets = await Bet.find({"tableID":tableID,"roundID":roundID,"playerID":playerID});       
    let betTotal = 0;
    for (const bet of bets){
        betTotal += bet.amount;            
    }
    res.status(201).json({success:true,"betTotal":betTotal})
})

module.exports = {createTable,getAllTables,getTable,updateTable,deleteTable,getALlBets,getBet,placeBet,clearBets,doubleBets,repeatBets,totalBets};