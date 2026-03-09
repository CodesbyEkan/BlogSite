export const uploadPost = (req, res) => {
  const { title, content, author } = req.body;
  console.log(title, content, author);
  res.json({ title, content, author });
};
