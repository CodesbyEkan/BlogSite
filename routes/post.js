import express from "express";
import { getAuthor } from "../controllers/getAuthor.js";

export const authorRouter = express.Router();

authorRouter.get('/author', getAuthor)