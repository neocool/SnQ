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

async function updateSettingsBody(setting,user) {
    let name = user.name ;
    let email = user.email;
    let username = user.username ;
    let balance = user.balance;
    let id = user._id;
    let phone = user.phone
    let address = user.address
    let payment = user.paymentName
    
    let rouletteCheckbox = 'checked'
    try{
      let gameSettings = user.gameSettings
      for( game of gameSettings){
        if (game.name == "roulette" && game.live){
          rouletteCheckbox = "checked"
        }else{
          rouletteCheckbox = ""
        }
      }
    }catch{

    }


    if(setting == "profile"){
        // update inner HTML of settings-body element
        let settingsBody = document.querySelector('.settings-body');
        settingsBody.innerHTML = `<div class="user-info">
                                        <div class="user-name">
                                            <span class="settings-text">Name: ${name}</span>
                                        </div>
                                        <div class="user-email">
                                        <span class="settings-text">Email: ${email}</span>
                                    </div>
                                        <div class="user-username">
                                            <span class="settings-text">Id: ${username}</span>
                                            <input style="display:none" id="username-input" ></input>
                                            <button class="edit-button" id="username">Edit</button>
                                        </div>
                                        <div class="user-phone">
                                            <span class="settings-text">Phone Number: ${phone}</span>
                                            <input style="display:none" id="phone-input" required></input>
                                            <button class="edit-button" id="phone">Edit</button>
                                        </div>          
                                        <div class="user-address">
                                            <span class="settings-text">Address: ${address}</span>
                                            <input style="display:none" id="address-input" ></input>
                                            <button class="edit-button" id="address">Edit</button>
                                        </div>
                                    </div>`;

    }else if (setting == "security"){
        // update inner HTML of settings-body element
        let settingsBody = document.querySelector('.settings-body');
        settingsBody.innerHTML = `<div class="user-info">                                    
                                    <div class="user-username">
                                        <span class="settings-text">Id: ${username}</span>
                                    </div>                                    
                                    <div class="user-password">                                        
                                        <span class="settings-text">Password: ******</span>
                                        <button id="changePass" class="edit-button">Change Password</button>
                                        <form id = "changePassForm" style="display:none;"><div><p>Current Password</p><input autocomplete="current-password" type="password" name="currentPassword" id="currentPass"></input><p>New Password</p><input autocomplete="new-password"  type="password" name="newPassword" id="newPass"></input></br></div><button type="submit">Submit</button><span id="passSuggest"></span></form
                                    </div>
                                    <div id="setupDFA_div">
                                        <button id="setupDFA" class="setupDFA">Enable two factor authentication</button>
                                        <br>
                                      </div>
                                    </div>`;

    }else if (setting == "payment"){
        // update inner HTML of settings-body element
        let settingsBody = document.querySelector('.settings-body');
        settingsBody.innerHTML = `<div class="user-info">                                    
                                    <div class="user-payment">
                                        <span class="settings-text">Payment Method: ${payment}</span>
                                        <button class="edit-button">Change Payment</button>
                                    </div>`;
        
        
    }else if (setting == "gamesSettings"){
        // update inner HTML of settings-body element
        let settingsBody = document.querySelector('.settings-body');
        settingsBody.innerHTML = `<div class="user-info">                                    
                                    <div class="user-gameSettings">
                                        <div class="settings-text"><h4>Roulette Settings:</h4></br>
                                            <span class="settings-text">Live Table: </span>
                                            <input type="checkbox" class="check-button" id="checkbutton-roulette-live" ${rouletteCheckbox}></input>
                                        </div>
                                    </div>`;
    }

    let edit_buttons = document.getElementsByClassName('edit-button');
    for (const edit_button of edit_buttons){          
        edit_button.addEventListener('click', async () => { 
        if (edit_button.textContent == "Edit"){
          edit_button.textContent = "Submit"      
          const inputElement = document.getElementById(edit_button.id+"-input");        
          inputElement.style = ''
        }else if (edit_button.textContent == "Submit"){
          edit_button.textContent = "Edit"          
          const inputElement = document.getElementById(edit_button.id+"-input");          
          let value = inputElement.value
          button_api_call(edit_button.id,value,user)
          inputElement.style = 'display:none'
        }
      })
    }

    let check_buttons = document.getElementsByClassName('check-button');
    for (const check_button of check_buttons){          
        check_button.addEventListener('change', async () => { 
        button_api_call(check_button.id,check_button.checked,user);
      })
    }
    try{
      let twoFactorAuthButton = document.getElementById('setupDFA');
      if (user.dfa_enabled){
        twoFactorAuthButton.textContent = "Disable two factor authentication"
        
      }else{
        twoFactorAuthButton.textContent = "Enable two factor authentication"
      }
      twoFactorAuthButton.addEventListener('click', async () => {
        returnData = await button_api_call(twoFactorAuthButton.id,twoFactorAuthButton.value,user);  
        user = await getUserInfo();
        console.log(user.dfa_enabled )
        if (user.dfa_enabled){
          twoFactorAuthButton.textContent = "Disable two factor authentication"
          const instructions =  document.createElement('p');
          instructions.textContent = "Please scan this QR code using your google authenticator app"
          instructions.id = "two-factor-instructions"
          const qrimage =  document.createElement('img');
          qrimage.id = "qrimage"
          qrimage.src = returnData.image_data
          let setupDFA_div = document.getElementById('setupDFA_div');
          setupDFA_div.appendChild(instructions)
          setupDFA_div.appendChild(qrimage)
          
        }else{
          twoFactorAuthButton.textContent = "Enable two factor authentication"
          const qrimage = document.getElementById('qrimage');
          const instructions = document.getElementById('two-factor-instructions');
          qrimage.parentNode.removeChild(qrimage);
          instructions.parentNode.removeChild(instructions);
        }
      })
    }catch (err){
    }
  }
async function render_page(){
  cookieBool = await checkCookie()  
  if(cookieBool==false ){
    window.location.href = '/login.html'
  }
}

async function button_api_call(id,value,user){
  if (id == "username"){
    const returnData = await apiCall("PATCH",`/api/v1/users/${user._id}`,{"newusername":value});
    return returnData
  }else if (id == "phone"){
    var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (phoneRegex.test(value)) {
      const returnData = await apiCall("PATCH",`/api/v1/users/${user._id}`,{"newphone":value});
      return returnData
    }
  }else if (id == "address"){
    const returnData = await apiCall("PATCH",`/api/v1/users/${user._id}`,{"newaddress":value});
    return returnData

  }else if (id == "checkbutton-roulette-live"){
    const returnData = await apiCall("PATCH",`/api/v1/users/${user._id}`,{"gameSettings":{"name":"roulette","live":value}});
    return returnData
  }else if (id == "setupDFA"){
    if (user.dfa_enabled){
      const returnData = await apiCall("GET",`/api/v1/users/disableDFA`);
      return returnData
    }else{
      const returnData = await apiCall("GET",`/api/v1/users/getDFA`);
      return returnData
    }
  }
}

async function main(){
    await render_page();
    user = await getUserInfo();
    await updateSettingsBody("profile",user)

    let profileTab = document.querySelector('.profileTab');    
    profileTab.addEventListener('click', async () => { 
      profileTab.id = "active";
      securityTab.id = "";
      paymentTab.id = "";
      gameTab.id = "";
      await updateSettingsBody("profile",user);
      
    });          

    let securityTab = document.querySelector('.securityTab');
    securityTab.addEventListener('click', async () => { 
      profileTab.id = "";
      securityTab.id = "active";
      paymentTab.id = "";
      gameTab.id = "";
      await updateSettingsBody("security",user); 
      let changePassword = document.getElementById('changePass');
      changePassword.addEventListener('click', async () => { 
        let changePassForm = document.getElementById('changePassForm');
        changePassForm.style = ''        
        changePassForm.addEventListener('submit', async function(event) {
          event.preventDefault();
          let formData = new FormData(changePassForm);
          let currentPassword = formData.get('currentPassword');
          let newPassword = formData.get('newPassword');
          let postdata = {"currentPassword":currentPassword,"newPassword":newPassword};
          
          const returnData = await apiCall("PATCH",`/api/v1/users/${user._id}`,postdata);  
          
          const passSuggest = document.getElementById("passSuggest")
          if (returnData.success == false){            
            suggestion_text = returnData.msg.suggestions[0]                
            passSuggest.innerHTML = `<P style="color:red;">${suggestion_text}</P>`
          }else if (returnData.msg == "Unauthorized"){            
            suggestion_text = "Wrong Password!"           
            passSuggest.innerHTML = `<P style="color:red;">${suggestion_text}</P>`
          }else if (returnData.success == true){
            changePassForm.style ="display:none" 
            suggestion_text = "Password changed successfuly!"
            passSuggest.innerHTML = `<P style="color:green;">${suggestion_text}</P>`
          }
        })
        })
    });

    let paymentTab = document.querySelector('.paymentTab');
    paymentTab.addEventListener('click', async () => { 
      profileTab.id = "";
      securityTab.id = "";
      paymentTab.id = "active";
      gameTab.id = "";
      await updateSettingsBody("payment",user); });

    let gameTab = document.querySelector('.gameTab');
    gameTab.addEventListener('click', async () => { 
      profileTab.id = "";
      securityTab.id = "";
      paymentTab.id = "";
      gameTab.id = "active";
      await updateSettingsBody("gamesSettings",user); });


  
}

  main()