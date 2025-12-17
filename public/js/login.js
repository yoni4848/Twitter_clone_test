const loginForm = document.getElementById("login-form");
const userNameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

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
        localStorage.setItem('token', data.token);
        window.location.href = '../home.html';
    });
});