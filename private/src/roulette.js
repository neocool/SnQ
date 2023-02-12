toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-top-center toastr-top-margin",
  "preventDuplicates": true,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut",
  "escapeHtml" : true
}

// Function to add a new number to the list
function addNumber(number) {
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const blackNumbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];  
  // Get a reference to the number list
  const numberList = document.getElementById('number-list');
  // Create a new list item element
  const newNumber = document.createElement('li');
  
  // Set the text content of the list item to the new number
  newNumber.textContent = number;

  let lastChild = numberList.lastElementChild;
  try{
    lastChild.classList.remove("last-item");
  }catch(err){
  }   
  // Add the list item to the number list
  if (redNumbers.includes(number )) {
    newNumber.classList.add("red-prev-number");
  }else if(blackNumbers.includes(number)){
    newNumber.classList.add("black-prev-number");
  }else{
    newNumber.classList.add("zero-prev-number");
  }
  numberList.appendChild(newNumber);
  lastChild = numberList.lastElementChild;
  lastChild.classList.add("last-item");


  // If the list has more than 10 items, remove the first (oldest) item
  if (numberList.children.length > 10) {
    numberList.removeChild(numberList.firstChild);
  }
}
async function create_table(name,min,max){ 
  const tables = await apiCall("GET",`/api/v1/casino/tables/`) ;  
  for (table of tables.tables){
     if (table.name =="roulette" && table.current_Players.length <= 10){
        const id = table._id;
        return id
        }
      }
    
    const apiMethod = 'POST';
    const url = '/api/v1/casino/tables/';
    data = {"name":name, "min":min,"max":max};
    const rouletteTable = await apiCall(apiMethod,url,data)
    return rouletteTable.id
}
async function clearAll(){
  const betButtons = document.querySelectorAll('.bet-option');
  const rouletteButtons = document.querySelectorAll('.number-button');
  for (const button of rouletteButtons) {
    button.classList.remove('selected');
  }
  for (const button of betButtons) {
    button.classList.remove('selected');
  }
  //update html
  document.querySelector('#player-bet').innerHTML =  "Total Bet: "  + "<br>";  
}
async function apiCall(apiMethod,url,data=undefined){
  let returnData;
  if (apiMethod == 'POST' || apiMethod == 'PATCH'){
    await fetch(url, {
      method: apiMethod,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json()).then((body) => {                
        returnData =  body;
      })
      .catch(error => console.log(error));
  }else if (apiMethod == 'GET'){
    response = await fetch(url);
    returnData =  await response.json();
  }    
  return returnData
}

async function render_page(playerID){  
  const numbers = [3,6,9,12,15,18,21,24,27,30,33,36,2,5,8,11,14,17,20,23,26,29,32,35,1,4,7,10,13,16,19,22,25,28,31,34];
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  let player_current_num='';
  let player_bet_amount='';
  let tableHTML = `<div id="roulettewheel"><img src="/images/wheel.png" alt="wheel" width="300" height="300"></div><div id="table">`;
  tableHTML += `<div> <button value=0 class="number-button" id="zero-number-button">0</button></div>`

  tableHTML += `<div>`
  for (const number of numbers) {
    if (redNumbers.includes(number)){
      tableHTML += `<button value=${number} class="number-button" id="red-number-button">${number}</button>`;
    }else if(number === 0){
      tableHTML += `<button value=${number} class="number-button" id="zero-number-button">${number}</button>`;
    }else{
      tableHTML += `<button value=${number} class="number-button" id="black-number-button">${number}</button>`;
    }
    if (number == 36){
      tableHTML += `<button value="firstColumn" class="number-button" id="firstColumn"></button>`;
      tableHTML += `</div>`
      tableHTML += `<div>`
    }
    if (number == 35){
      tableHTML += `<button value="secondColumn" class="number-button" id="secondColumn"></button>`;
      tableHTML += `</div>`
      tableHTML += `<div>`
    }
    if (number == 34){
      tableHTML += `<button value="thirdColumn" class="number-button" id="thirdColumn"></button>`;
      tableHTML += `</div>`
    }
  }

  const dozensBets = ["first12Numbers","second12Numbers","third12Numbers"]
  const outsideBets = ["frst18","even","red","black","odd","scnd18"]
  
  tableHTML += `<div>`
  for (const dozensBet of dozensBets) {
    tableHTML += `<button value=${dozensBet} class="number-button" id="${dozensBet}"></button>`;
  }
  tableHTML += `</div>`

  tableHTML += `<div>`
  for (const outsideBet of outsideBets) {
    tableHTML += `<button value=${outsideBet} class="number-button" id="${outsideBet}"></button>`;
  }
  tableHTML += `</div></div>`
  
  document.querySelector('.roulette-table').innerHTML = tableHTML;

  document.querySelector('#red').textContent = "red";
  document.querySelector('#black').textContent = "black";
  document.querySelector('#even').textContent = "even";
  document.querySelector('#odd').textContent = "odd";
  document.querySelector('#red').textContent = "red";
  document.querySelector('#frst18').textContent = "1 -18";
  document.querySelector('#scnd18').textContent = "19 - 36";
  document.querySelector('#first12Numbers').textContent = "1st 12";
  document.querySelector('#second12Numbers').textContent = "2nd 12";
  document.querySelector('#third12Numbers').textContent = "3rd 12";
  document.querySelector('#firstColumn').textContent = "2:1";
  document.querySelector('#secondColumn').textContent = "2:1";
  document.querySelector('#thirdColumn').textContent = "2:1";

  //Adding Player Info:
  const playerInfo_html= `<div id="player-info">              
                          <span id="player-bet"></span>                       
                          </div>`
  const playerInfo = document.createElement('div');
  playerInfo.innerHTML = playerInfo_html;
  
  document.querySelector('.sidebar').appendChild(playerInfo); 
  
            

  //create roulette table in database
  const table_id = await create_table('roulette',1,1000)

  const rouletteTable = document.querySelector('.roulette-table');

  rouletteTable.addEventListener('mouseover', () => {
    rouletteTable.style.transform = 'scale(1.1)';
  });

  rouletteTable.addEventListener('mouseout', () => {
    rouletteTable.style.transform = 'scale(1)';
  });

  const betButtons = document.querySelectorAll('.bet-option');
  const rouletteButtons = document.querySelectorAll('.number-button');  
  for (const button of betButtons) {
    button.addEventListener('click', () => {
      // Remove the 'selected' class from all buttons
      for (const b of betButtons) {
        b.classList.remove('selected');
      }
      // Add the 'selected' class to the clicked button
      button.classList.add('selected');     
 
    });
  for (const button of rouletteButtons) {
    button.addEventListener('click', async () => {
      // Add the 'selected' class to the clicked button
      button.classList.add('selected');      
    })
  }
  }  
  const doubleButton = document.querySelector('.double-button');  
  const repeatButton = document.querySelector('.repeat-button');
  const clearButton = document.querySelector('.clear-button');

  clearButton.addEventListener('click', async () => {
    //clear all bets
    clearAll();
    const table_api_data =  await fetch(`/api/v1/casino/tables/${table_id}`);
    const table_data =  await table_api_data.json();    
    const tableID =  table_data._id
    const clearBets = await apiCall("POST","/api/v1/casino/bets/clear",data={"tableID":tableID,"playerID":playerID});
  })

  repeatButton.addEventListener('click', async () => {
    //clear all bets
    clearAll();
    const table_api_data =  await fetch(`/api/v1/casino/tables/${table_id}`);
    const table_data =  await table_api_data.json();    
    const tableID =  table_data._id
    const repeatBets =await apiCall("POST","/api/v1/casino/bets/repeat",data={"tableID":tableID,"playerID":playerID});
  }) 
  
  doubleButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const table_data =  await apiCall("GET",`/api/v1/casino/tables/${table_id}`);      
    const tableID =  table_data._id
    const doubleBets = await apiCall("POST","/api/v1/casino/bets/double",data={"tableID":tableID,"playerID":playerID});
  })
return table_id
}

async function fetchTableData(table_id) {  
  let timer;
  try {
    const table_data = await  apiCall("GET",`/api/v1/casino/tables/${table_id}`) ;         
    const current_number = table_data.previousNumbers[-1]; 
    const previousNums = table_data.previousNumbers;
  
    timer = JSON.parse(table_data.timer);    
    
    // Clear the previous numbers list
    document.querySelector('#number-list').innerHTML = '';
    // Add each of the previous numbers to the list
    for (const num of previousNums) {
      addNumber(num);
    }    
    
    //Player Api data
    const {playerID,name,balance} = await fetchPlayerData()
    let balancehtml = document.getElementById("balance").innerHTML;
    let balanceValue = Number(balancehtml.split(":")[1].trim().split("<")[0]);
       
    document.querySelector('#balance').innerHTML = `<p>Balance: ${balance}</p>`;
    if (balance>balanceValue){
      try{
        toastr.success(`Won ${balance-balanceValue}`,'', {timeOut: 1000, progressBar: false});
      }catch(err){
        console.log(err)
      }
    }

  }catch(err){
    console.log("Failed to setup table")
  } 
  const {playerID,name,balance} = await fetchPlayerData()
  const betButtons = document.querySelectorAll('.bet-option');
  const betControls = document.querySelectorAll('.betControls');
  const rouletteButtons = document.querySelectorAll('.number-button');
  
  if (timer <= 10){
    betButtons.forEach((button) => {
      button.disabled = true;
      });
    betControls.forEach((button) => {
      button.disabled = true;
      });
    rouletteButtons.forEach((button) => {
    button.disabled = true;
    });    
    }else{
      betButtons.forEach((button) => {
        button.disabled = false;
        });
      betControls.forEach((button) => {
        button.disabled = false;
        });
      rouletteButtons.forEach((button) => {
      button.disabled = false;
      });
    }
  if (timer >= 29){
    clearAll();   
  }
  if (timer <= 28 && timer >= 27 ){
    toastr.info('Place your bets!', '', {timeOut: 18000, progressBar: true});    
  }else if (timer <= 10 && timer >= 9 ){
    toastr.error('No more bets!', '', {timeOut: 10000, progressBar: true});
  }

  // Render top players on the table  
  let topScoreSection = document.getElementById("topPlayers")
  table = await apiCall('GET',`/api/v1/casino/tables/${table_id}`);
  if (table.current_Players.length >0){
    let topPlayers = []
    let topPlayersElement =''
    for (currentPlayerID of table.current_Players){
        let player =  await apiCall('GET',`/api/v1/users/${currentPlayerID}`);
        topPlayers.push({"username":player.user.username,"balance":player.user.balance})
      }
  topPlayers.sort((a,b)=>{return a.balance - b-balance});
  topPlayers.forEach((e)=>{
      topPlayersElement+= `<span>${e.username} : ${e.balance}</span><br>`
  });  

  topScoreSection.innerHTML = topPlayersElement;
  }else{
    topScoreSection.innerHTML = '';
  }

  //update total bet amout on page:
  const table_api_data =  await fetch(`/api/v1/casino/tables/${table_id}`);
  const table_data =  await table_api_data.json();  
  const roundID = table_data.roundID
  const tableID =  table_data._id
  const {betTotal}= await apiCall('POST','/api/v1/casino/bets/total',data={"tableID":tableID,"roundID":roundID,"playerID":playerID})  
  document.querySelector('#player-bet').innerHTML = "Total Bet: " + betTotal + "<br>"; 

}

async function placebets(bet){
  if(bet.name && bet.amount){
    apiCall("POST",'/api/v1/casino/bets/placeBet',data=bet);
    bet.name , bet.amount = undefined  
  }  
}

async function fetchPlayerData(){
  const player_api_data = await fetch('/api/v1/users/user');   
  const player =  await player_api_data.json();
  const player_data = player.user  
  const player_balance = player_data.balance;  
  const player_name = player_data.name;
  const playerID = player_data._id ;  
  return {"playerID":playerID,"name":player_name,"balance":player_balance}
}

async function main(){
  const {playerID}= await fetchPlayerData();   
  const table_id = await render_page(playerID);
   
  const betButtons = document.querySelectorAll('.bet-option');
  const rouletteButtons = document.querySelectorAll('.number-button');
  const bet = {};

  rouletteButtons.forEach(button => {
    button.addEventListener('click', async () => {
    bet.name =  button.value;
    bet.tableID = table_id;
    const table_api_data =  await fetch(`/api/v1/casino/tables/${table_id}`); 
    const table_data =  await table_api_data.json();    
    
    bet.playerID = playerID;
    for (const button of betButtons){
      if (button.classList.contains('selected')){
        bet.amount = Number(button.value);
      }
    }
    placebets(bet);
    })
  });

  // Fetch the table data every 5 seconds
  setInterval(async ()=>{
    fetchTableData(table_id);
  }, 1000);
}


main()