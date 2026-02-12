import { getPosts } from "../utils/getData.js";

export const viewPost = async (req, res) => {
  try {
    res.render("post.ejs", { posts: await getPosts() });
  } catch (err) {
    res.status(404).res.send(`404!! Page not found!`);
  }
};
