function hambutton() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  };

  async function checkCookie() {
    const esult = false;
    await fetch('/api/v1/auth/checkCookie', {
        headers: {
          'Cookie': document.cookie
        }
      })
      .then(response => {
        
        if (response.status === 201) {
          // the cookie is set, do something          
            result = true;            
        } else {
          // the cookie is not set, do something else
          result= false
        }
      })
      .catch(error => {
        console.log(error);
      });

    return result
}

async function getUserInfo(){
    let user = {};
    await fetch('/api/v1/users/user', {
        method:'GET',
        headers: {
          'Cookie': document.cookie
        }
      })
      .then(async response => {        
        if (response.status === 201) {
          // the cookie is set, do something     
            body = await response.json();
            user = (body.user)        
        } else {
          // the cookie is not set, do something else
          console.log('failed')
        }
      })
      .catch(error => {
        console.log(error);
      });
    return user
}  

async function logout(){
  //make a request to the server to log the user out
    const response = await fetch('/api/v1/users/logout', {
      method: 'POST',
      credentials: 'include' //to send cookies
    });
  
    window.location.href = '/login.html';
  }

async function main(){
  if(await checkCookie()){
      //connect to server to get user info using the cookie
      user = await getUserInfo();
      let name = user.name 
      let email = user.email
      let username = user.username 
      let balance = user.balance

      //update profile values on the page
      profileName = document.getElementById('name')
      profileEmail = document.getElementById('email')
      profileUsername = document.getElementById('username')
      profileBalance = document.getElementById('balance')
      
      profileName.innerHTML =  `<h3>${name}</h3>`
      profileEmail.innerHTML =  `<p>${email}</p>`
      profileUsername.innerHTML =  `<p>${username}</p>`
      profileBalance.innerHTML =  `<p>Balance: ${balance}</p>`

      //remove login link and replace it with a logout link
      navbarLogin = document.querySelector('.login-link');
      navbarLogin.textContent = "Logout";
      navbarLogin.href = "#";

      navbarLogin.addEventListener('click', () => {
        logout();
      });
  }
}



main();
