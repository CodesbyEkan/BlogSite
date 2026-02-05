import posts from "../data/posts.json";

export const getPostData = (req, res) => {
  res.status(200);
  res.header("content-type", "application/json");
  res.json(posts);
};
