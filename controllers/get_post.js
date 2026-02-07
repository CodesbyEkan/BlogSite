import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../data/posts.json');

export const getAllPosts = (req, res) => {
  try {
     fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.status(500).send('Error reading posts');
      const posts = JSON.parse(data);
      res.render('posts', { posts });
    });
  } catch (error) {
    res.status(500).send('Error reading posts');
  }
};

export const getPostById =  (req, res) => {
  try {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.status(500).send('Error reading post');
      const posts = JSON.parse(data);

      const post = posts.find(p => p.id === Number(req.params.id));

      if (!post) return res.status(404).send('Post not found');

      res.render('singlePost', { post });
    });
  } catch (error) {
    res.status(500).send('Error reading post');
  }
};