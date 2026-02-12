import { getPosts } from "../utils/getData.js";

export const filterPost = async (req, res) => {
  const userId = req.params.id;
  try {
    const posts = await getPosts();
    const filteredPost = posts.filter((post) => post.id === Number(userId));
    if (!filteredPost.length) {
      res
        .status(404)
        .send(`No post found with id: ${userId}. Try a valid user id.`);
    }
    console.log(filteredPost);
    res.render("post.ejs", { posts: filteredPost });
  } catch (err) {
    return res.status(404).send();
  }
};
