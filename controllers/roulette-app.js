const User = require('../db/models/user');
const Table = require('../db/models/table');
const Bet = require('../db/models/bet');

const {readFile, writeFile, readFileSync} = require('fs');
const { Console } = require('console');



async function update_table(tableID,current_number){
    try{             
        //update table previous numbers field 
        let table = await Table.findOne({_id:tableID});
        //get all bets on the table
        
        let bets = await Bet.find({"tableID":tableID,"roundID":table.roundID});        
        let roundID = JSON.stringify(Number(table.roundID ) + 1);
        if (table.previousNumbers.length > 300){
            await Table.findOneAndUpdate({_id:tableID},{"$pop":{"previousNumbers":-1 }},{
                new:true,runValidators:true
            });
        }
        //update table current players field
        let currentPlayers = [];        
        for (bet of bets){
            if (currentPlayers.includes(bet.playerID) == false){
                currentPlayers.push(bet.playerID)
            }
            
            if (currentPlayers.length == 0){                
                await Table.findOneAndUpdate({_id:tableID},{"$unset":{"current_Players":undefined}})
            }
            
        }
        
        await Table.findOneAndUpdate({_id:tableID},{"$push":{"previousNumbers":current_number},"$set":{"roundID":roundID,"current_Players":currentPlayers}},{
            new:true,runValidators:true
        });
        table = await Table.findOne({_id:tableID});       
        roundID = table.roundID        
        
    }catch (err){
        console.log(err)
    }
    }

async function update_timer(tableID,timer){
    //update table timer field
    const table = await Table.updateOne({_id:tableID},{"timer":timer},{
        new:true,runValidators:true
    });
    }

async function update_players(tableID,current_number,roundID){
    try{
    //update table previous numbers field
    const table = await Table.findOne({_id:tableID});
    const bets = await Bet.find({"tableID":tableID,"roundID":roundID});   
    let playerID;
    let betname;
    let amount;
    for (const bet of bets){        
        playerID= bet.playerID;
        betname = bet.name;
        amount = bet.amount;          
        await update_balance(current_number,playerID,tableID,betname,amount);
    }
    }catch(err){
        console.log(err)
    }
    }

async function checkBet(current_number,bet,amount){
    let betresult = 0;    
    // Create an array of all roulette numbers
    const rouletteNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

    // Create an array to hold the red numbers
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    // Create an array to hold the black numbers
    const blackNumbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
    // Create an array to hold the odd numbers
    const oddNumbers = [];
    // Create an array to hold the even numbers
    const evenNumbers = [];
    // Create an array to hold the first 12 numbers
    const first12Numbers = [];
    // Create an array to hold the second 12 numbers
    const second12Numbers = [];
    // Create an array to hold the third 12 numbers
    const third12Numbers = [];
    //the 3 dozens:
    const firstColumn = [3,6,9,12,15,18,21,24,27,30,33,36];
    const secondColumn = [2,5,8,11,14,17,20,23,26,29,32,35];
    const thirdColumn = [1,4,7,10,13,16,19,22,25,28,31,34];

    //first 18
    const first18Numbers = [];
    //second 18
    const second18Numbers = [];

    // Iterate over the roulette numbers
    for (let i = 0; i < rouletteNumbers.length; i++) {             
        // Check if the number is odd or even
        if (rouletteNumbers[i] % 2 === 0) {
            evenNumbers.push(rouletteNumbers[i]);
        } else {
            oddNumbers.push(rouletteNumbers[i]);
        }
        // check the number for which dozens it belongs to
        if(i<12) {
            first12Numbers.push(rouletteNumbers[i]);
        } else if(i>11 && i<24) {
            second12Numbers.push(rouletteNumbers[i]);
        } else {
            third12Numbers.push(rouletteNumbers[i]);
        }
        if(i<=18) {
            first18Numbers.push(rouletteNumbers[i]);
        }else{
            second18Numbers.push(rouletteNumbers[i]);
        }
    }
    
    //check if red or black
    if (redNumbers.includes(current_number)  && bet === "red"){
        betresult = amount *2
    }else if (blackNumbers.includes(current_number) && bet === "black"){
        betresult = amount *2
    }

    //check if odd or even
    if (oddNumbers.includes(current_number)  && bet === "odd"){
        betresult = amount *2  
    }else if (evenNumbers.includes(current_number)  && bet === "even"){
        betresult = amount *2
    }

    //check if in the first 12 second or third 12
    if (first12Numbers.includes(current_number)  && bet === "first12Numbers"){
        betresult = amount *3  
    }else if (second12Numbers.includes(current_number)  && bet === "second12Numbers"){
        betresult = amount *3 
    }else if (third12Numbers.includes(current_number)  && bet === "third12Numbers"){
        betresult = amount *3 
    }
    //check if in the 3 columns
    if (firstColumn.includes(current_number)  && bet === "firstColumn"){
        betresult = amount *3  
    }else if (secondColumn.includes(current_number)  && bet === "secondColumn"){
        betresult = amount *3 
    }else if (thirdColumn.includes(current_number)  && bet === "thirdColumn"){
        betresult = amount *3 
    }
    if (first18Numbers.includes(current_number)  && bet === "frst18"){
        betresult = amount *2  
    }else if (second18Numbers.includes(current_number)  && bet === "scnd18"){
        betresult = amount *2 
    }

    //check if you hit a number
    const current_num = JSON.stringify(current_number)
    if ( bet == current_num ){
        betresult = amount*35
    }
    return betresult
}   

async function update_balance(current_number,playerID,tableID,betname,amount){    
    const player = await User.findOne({_id:playerID});    
    let outcome;
    betresult = await checkBet(current_number,betname,amount)
    if (betresult > 0){
        outcome = "win"
    }else{
        outcome = "loss"
    }
    let balance = player.balance + betresult;
    let bet_history = player.bet_history;
    
    bet_history.push({"bet":betname,"tableID":tableID,"outcome":outcome});
    await User.updateOne({_id:playerID},{"balance":balance,"bet_history":bet_history},{
        new:true,runValidators:true
    });
}

async function startTable(tableID,roundID){
    let timer = 30
    let current_number;
    setInterval(async ()=>{
        timer--             
        await update_timer(tableID,timer)
        if (timer === 0){
            current_number = Math.floor(Math.random() * 37);
            await update_table(tableID,current_number)            
            await update_players(tableID,current_number,roundID)
            timer = 30;

            const table = await Table.findOne({_id:tableID});
            roundID = table.roundID
        }
    },1000)
}

module.exports = {startTable}