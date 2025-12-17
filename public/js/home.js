const token = localStorage.getItem('token');
const createPost = document.getElementById("create-post");
const feed = document.getElementById("feed");
const exploreButton = document.getElementById("explore-button");
const feedButton = document.getElementById("feed-button");

//display posts inside post div
function displayPosts(posts){
    feed.innerHTML = "";
    posts.forEach(element => {
        feed.innerHTML += `<div class="post">
                            <p class="username">@${element.username}</p>
                            <p class="content">${element.content}</p>
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