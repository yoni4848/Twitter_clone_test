const registerForm = document.getElementById('register-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    fetch('/api/users', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username, email, password
        })
    })
    .then(response => response.json())
    .then(data => {
        const errorMeassage = document.getElementById('error-message');
        if (data.error){
            errorMeassage.textContent = data.error;
        } else{
            window.location.href = "../index.html";
        }
    })
})