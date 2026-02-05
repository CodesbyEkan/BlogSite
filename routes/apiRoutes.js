import express from "express";
import { getPostData } from "../controllers/getPostData.js ";

export const apiRouter = express.Router();

apiRouter.get("/posts", getPostData);
