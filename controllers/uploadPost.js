import express from "express";
import { body, validationResult } from "express-validator";

export const uploadPost = (req, res) => {
  const { name, role } = req.body;
  res.send(`Welcome to upload Page! ${role}`);
};
