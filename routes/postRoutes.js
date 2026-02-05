import express from "express";
import { renderHomepage } from "../controllers/renderHomepage.js";
import { getPost } from "../controllers/getPost.js";

export const pageRouter = express.Router();

pageRouter.get("/", renderHomepage);
pageRouter.get("/post", getPost);
