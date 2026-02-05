let postContainer = document.getElementById("post-div");

async function getData() {
  let postTemplate = "";
  try {
    const posts = await fetch("http://localhost:5000/api/posts");
    if (!posts.ok) {
      throw new Error(`Response Status: ${data.status}`);
    }
    const data = await posts.json();
    console.log(data);
    data.forEach((blogPost) => {
      let postTags = blogPost.tags;
      postTemplate += `<section class="posts">
                <div class="author-date">
                    <p>${blogPost.published_date}</p>
                    <p>${blogPost.author}</p>
                </div>
                <h2>${blogPost.title}</h2>
                <p>${blogPost.content}
                </p>
                <div class="tags">
                    <p>
                        <span id="tag">Tags: </span>${blogPost.tags.join(", ")}
                    </p>
                </div>
            </section>`;
    });
    postContainer.innerHTML = postTemplate;
  } catch (err) {
    console.error(err);
  }
}

getData();
