import { body, validationResult } from "express-validator";

export const uploadValidator = [
  body("title")
    .escape()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 30 })
    .withMessage(
      "Title must be have more than 4 letters or less than 30 characters",
    ),
  body("content")
    .escape()
    .notEmpty()
    .withMessage("Post Content is required!")
    .isLength({ min: 20, max: 1000 })
    .withMessage("post Content is either too short or too long!"),
];
export const userValidator = [
  body("name")
    .escape()
    .notEmpty()
    .withMessage("Name is required")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage(
      "Name must have more than 2 letters or less than 30 characters",
    ),
  body("email").escape().isEmail().withMessage("email is required!").trim(),
  body("password")
    .isLength({ min: 8, max: 30 })
    .withMessage("Password should contain 8 to 30 characters.")
    .matches(/[a-z]/)
    .withMessage("Password must contain lowercase letters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain uppercase letters")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number."),
];

export const validateResultMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: "Validation Failed",
      errors: errors.array(),
    });
  }
  next();
};
