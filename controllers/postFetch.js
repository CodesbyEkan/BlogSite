const API_URL = "http://localhost:5000/posts";

async function fetchPosts() {
  try {
    const response = await fetch(API_URL);
    const posts = await response.json();
    displayPosts(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

function displayPosts(posts) {
  const container = document.getElementById("posts");

  container.innerHTML = "";

  posts.forEach(post => {
    container.innerHTML += `
      <h2>${post.title}</h2>
      <p>${post.content}</p>
      <hr />
    `;
  });
}

document.addEventListener("DOMContentLoaded", fetchPosts);