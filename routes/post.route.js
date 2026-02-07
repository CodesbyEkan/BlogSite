import express from 'express';
import { getAllPosts, getPostById } from '../controllers/postController.js';

const router = express.Router();

router.get('/', getAllPosts);  // Route to get all posts
router.get('/:id', getPostById); // Route to get a specific post by its ID

export default router;