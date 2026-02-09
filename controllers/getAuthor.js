import { getPosts } from "./getData.js";

export async function getAuthor(req, res) {
  try {
    const data = await getPosts();
    const authorsAndTitles = data.map(post => ({
      author: post.author,
      title: post.title
    }));

    res.status(200).json(authorsAndTitles);

  } catch (err) {
    res.status(500).json({ message: "Error fetching posts" });
  }
}

