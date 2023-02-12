function renderPage(){
    // Register form and logic
    document.getElementById('register').addEventListener('click', function() {
        // code to open the pop-up form goes here
        let registerform = document.createElement('form');
        registerform.innerHTML = '<input type="text" placeholder="First name" name="firstName"><br>'+
                        '<input type="text" placeholder="Last name" name="lastName"><br>'+
                        '<input type="email" placeholder="Email" name="email"><br>'+                    
                        '<input type="password" placeholder="Password" name="password"><br>';

        registerform.innerHTML += '<button class="submit" type="submit">Submit</button>';
        
        // create the modal element
        var modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = '<div class="modal-content"><span class="close">&times;</span><div class="modal-body"></div></div>';

        // add the form to the modal body
        modal.querySelector('.modal-body').appendChild(registerform);

        // add the modal to the document
        document.body.appendChild(modal);

        // show the modal
        modal.style.display = 'block';

        // close the modal when the close button is clicked
        modal.querySelector('.close').addEventListener('click', function() {
        modal.style.display = 'none';
        });


        registerform.addEventListener('submit', function(event) {
            event.preventDefault();
            let formData = new FormData(registerform);
            let firstName = formData.get('firstName');
            let lastName = formData.get('lastName');
            let email = formData.get('email');        
            let password = formData.get('password');
            let postdata = {
                "name": firstName + ' ' + lastName,
                "email": email,            
                "password": password
                };        
            fetch('/api/v1/users/register', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                    },
                body: JSON.stringify(postdata)
            })
            .then(function(response) {
                // handle the response from the server
                if (response.status == 201){
                    modal.style.display = 'none';
                }
                else{
                    modal.appendChild("<p>Incorret information received</p>")
                }
            })
            .catch(function(error) {
                // handle any errors
                console.log(error);
            });
            });

    });
    
    //Login logic
    loginform = document.getElementById('login')
    
    loginform.addEventListener('submit', function(event) {
        event.preventDefault();
        let formData = new FormData(loginform);
        let username = formData.get('uname');
        let password = formData.get('passwd');
        let postdata = {        
            "username": username,
            "password": password
            };
        if (formData.get('code')){
            postdata.token = formData.get('code')
        }
        fetch('/api/v1/users/login', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(postdata)
        })
        .then(function(response) {
            // handle the response from the server
            if (response.status == 201){            
                window.location = '/';
            }else if (response.status == 200){
                codeInput = document.getElementById('code')
                codeInput.style = ""
                codeInput.attributes[required]
            }else{
                try{
                    badloginerr = document.querySelector(".incorrectPassClass")
                    badloginerr.textContent = "Incorrect information provided"               
                }catch(err){
                    badloginerr = document.createElement('p');
                    badloginerr.className = "incorrectPassClass"
                    badloginerr.style= "color: red; font-size: 16px;margin-left:30px;"
                    badloginerr.textContent = "Incorrect information provided"
                    loginform.appendChild(badloginerr)
                }
            }
        })
        .catch(function(error) {
            // handle any errors
            console.log(error);
        });
        });

    // forgot password logic
}

function main(){
    user = 
    renderPage()
}


main()