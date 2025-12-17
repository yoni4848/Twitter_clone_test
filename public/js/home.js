const token = localStorage.getItem('token');


fetch('/api/timeline', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        const feed = document.getElementById("feed");
        data.forEach(element => {
            feed.innerHTML += `<div class="post">
                            <p class="username">@${element.username}</p>
                            <p class="content">${element.content}</p>
                            </div>`
        });
    })