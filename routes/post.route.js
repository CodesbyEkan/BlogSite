import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const postsFilePath = path.join(__dirname, "../data/posts.json"); // Path to the JSON file

// Helper function to read posts from JSON
function getPosts() {
  try {
    const data = fs.readFileSync(postsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error( "Error reading posts:", error.message);
    return [];    
  }
};

// Route to show all posts
router.get("/", (req, res) => {
  try {
    const posts = getPosts();
    res.render("posts", { posts });
  } catch (error) {
    console.error("Error in /posts route:", error.message);
    res.status(500).send("Server error occurred");
  }
});

// Route to show a single post by ID
router.get("/:id", (req, res) => {
  try {
    const posts = getPosts();
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).send("Post not found!");
    res.render("post", { post });
  } catch (error) {
    console.error("Error in /posts/:id route:", error.message);
    res.status(500).send("Server error occurred");
  }
});


export default router;
