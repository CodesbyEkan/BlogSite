import { getPosts } from "../utils/getData.js";

export const filterPost = async (req, res) => {
  const userId = req.params.id;
  try {
    const posts = await getPosts();
    const filteredPost = posts.filter((post) => post.id === Number(userId));

    // If post does not exist returns an empty post and error
    if (!filteredPost.length) {
      return res.status(404).render("post.ejs", {
        posts: [],
        error: `No post found with id: ${userId}. Try a valid id.`,
      });
    }
    console.log(filteredPost);

    // Rendering aavailable post
    res.render("post.ejs", {
      posts: filteredPost,
      error: null,
    });
  } catch (err) {
    return res.status(404).send();
  }
};
