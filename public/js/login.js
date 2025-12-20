const loginForm = document.getElementById("login-form");
const userNameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const token = localStorage.getItem('token');


//redirect to the home page if they are already logged in
if (token){
    window.location.href = "../home.html";
}
   

//send the users username and password to backend
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = userNameInput.value;
    const password = passwordInput.value;
    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username, password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const errorMeassage = document.getElementById('error-message');
        if (data.error){
            errorMeassage.textContent = data.error;
        } else{
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('token', data.token);
            window.location.href = '../home.html';
        }
    });
});