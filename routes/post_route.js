import express from 'express';
import { getAllPosts, getPostById } from '../controllers/get_post.js';

const router = express.Router();

router.get('/', getAllPosts);      // /posts
router.get('/:id', getPostById);   // /posts/:id

export default router;
