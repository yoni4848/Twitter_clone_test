const token = localStorage.getItem('token');
const createPost = document.getElementById("create-post");
const feed = document.getElementById("feed");
const exploreButton = document.getElementById("explore-button");
const feedButton = document.getElementById("feed-button");
const user = document.getElementById('user');
const logoutButton = document.getElementById('log-out');

//check if the user is logged in before letting access to the home page
if (!token){
    window.location.href = "../index.html";
}
    
//display the username at the top right corner
user.textContent += localStorage.getItem('username');

//like a post
function likePost(post_id){
    fetch(`/api/posts/${post_id}/like`, {
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(response => {
        const likeButton = document.getElementById(`like-btn-${post_id}`);
        if (response.status === 409){
            fetch(`/api/posts/${post_id}/like`, {
                method: 'DELETE',
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            .then(() => {
                let count = parseInt(likeButton.textContent.slice(1));
                likeButton.textContent = `❤ ${count - 1}`;
                likeButton.classList.remove("liked");
            })
        } else if (response.status === 201){
            let count = parseInt(likeButton.textContent.slice(1));
            likeButton.textContent = `❤ ${count + 1}`;
            likeButton.classList.add("liked");
        }
    })
}

//display posts inside post div
function displayPosts(posts){
    feed.innerHTML = "";
    posts.forEach(element => {
        feed.innerHTML += `<div class="post">
                            <p class="username">@${element.username}</p>
                            <p class="content">${element.content}</p>
                            <button id="like-btn-${element.post_id}" onclick="likePost(${element.post_id})">❤ ${element.like_count}</button>
                            </div>`
    });
}

//fetch explore posts
fetch('/api/explore', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        displayPosts(data);
    })

//create a new post
createPost.addEventListener("submit", (event) => {
    event.preventDefault();
    const postContent = document.getElementById("post-text-box");
    fetch('/api/posts', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({content: postContent.value})
    })
    .then(response => response.json())
  .then(data => {
      postContent.value = "";
      return fetch('/api/explore', {
        method: "GET"
      });
  })
  .then(response => response.json())
  .then(data => {
      displayPosts(data);
  })

});


//show popular post when explore is clicked
exploreButton.addEventListener("click", () => {
    feedButton.classList.remove('active');
    exploreButton.classList.add('active');
    fetch("/api/explore", {
        method: "GET"
    })
    .then (response => response.json())
    .then(data => {
        displayPosts(data);
    })

});

//show posts from accounts followed when feed is clicked

feedButton.addEventListener("click", () => {
    exploreButton.classList.remove('active');
    feedButton.classList.add('active');
    fetch("/api/timeline", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then (response => response.json())
    .then(data => {
        displayPosts(data);
    })

});

logoutButton.addEventListener("click", ()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = "../index.html"
})