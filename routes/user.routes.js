import express from "express";
import {
  userValidator,
  validateResultMiddleware,
} from "../middleware/validator.js";

import { createUser, signupUser } from "../controllers/user.controller.js";

export const userRouter = express.Router();

userRouter.get("/signup", signupUser);
userRouter.post("/signup", userValidator, validateResultMiddleware, createUser);
