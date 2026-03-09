import { body, validationResult } from "express-validator";

export const uploadValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 30 })
    .withMessage("Title must be be between 4 - 30 characters")
    .escape(),
  body("content")
    .escape()
    .notEmpty()
    .withMessage("Post Content is required!")
    .isLength({ min: 20, max: 1000 })
    .withMessage("post Content is either too short or too long!"),
];
export const userValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("name must contain alphabets only!")
    .isLength({ min: 3, max: 25 })
    .withMessage("Name must be between 3 - 25 characters")
    .escape(),
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

export const loginValidator = [
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
