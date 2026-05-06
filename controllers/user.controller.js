import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const signupUser = (req, res) => {
  res.render("signup.ejs");
};

export const signinUser = (req, res) => {
  res.render("signin.ejs");
};

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const checkEmail = await User.findOne({
    where: { email },
    logging: console.log,
  });
  // console.log(checkEmail);
  if (checkEmail) {
    return res.status(404).json({
      status: false,
      message: "Email has been used!",
      data: [],
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = User.create({ name, email, password: hashedPassword });
  console.log(user);

  if (!user) {
    return res.status(400).json({
      status: false,
      message: "Could not create user.",
      data: [],
    });
  }

  return res.status(303).redirect("/user/signin");

  // return res.status(201).json({
  //   status: true,
  //   message: "User created successfully!",
  //   data: user,
  // });
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;
  const checkUser = User.findOne({ where: { email } });
  console.log(checkUser);
};
