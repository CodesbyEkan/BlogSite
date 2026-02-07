import express from "express";
import { getPostData } from "../controllers/getPostData.js ";
import { filterPosts } from "../controllers/filterData.js";
export const apiRouter = express.Router();

apiRouter.get("/posts", getPostData);
apiRouter.get('/filter-post/:id', filterPosts)