import express from "express";
import {
  userValidator,
  loginValidator,
  validateResultMiddleware,
} from "../middleware/validator.js";

import {
  createUser,
  loginUser,
  signupUser,
  signinUser,
} from "../controllers/user.controller.js";

export const userRouter = express.Router();

userRouter.get("/signup", signupUser);
userRouter.get("/signin", signinUser);
userRouter.post("/signup", userValidator, validateResultMiddleware, createUser);
userRouter.post("/signin", loginValidator, validateResultMiddleware, loginUser);
