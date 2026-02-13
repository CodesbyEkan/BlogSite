    import express from "express";
    import { filterPost } from "../controllers/filterPost.js";
    import { viewPost } from "../controllers/viewPost.js";
    import { viewHomePage } from "../controllers/viewHomePage.js";

    export const pageRouter = express.Router();

    // pageRouter.get("/", renderHomepage);
    pageRouter.get("/", viewHomePage);
    pageRouter.get("/post", viewPost);
    pageRouter.get("/post/:id", filterPost);
