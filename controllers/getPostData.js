import { getPosts } from "./getData.js";

export const getPostData = async (req, res) => {
  const posts = await getPosts();
  console.log(posts);
  res.status(200);
  res.header("content-type", "application/json");
  res.json(posts);
};
