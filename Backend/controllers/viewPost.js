import { getPosts } from "../utils/getData.js";

export const viewPost = async (req, res) => {
  try {
    const allPosts = await getPosts();
    res.render("post.ejs", { 
      posts: allPosts, 
      error: null  // Add this to satisfy the EJS check
    });
  } catch (err) {
    res.status(404).res.send(`404!! Page not found!`);
  }
};
