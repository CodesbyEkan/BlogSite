export const uploadPost = (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  // res.send(
  //   `Welcome to upload Page! ${name}, Your email is ${email} & password: ${password}`,
  // );
  res.redirect("/user/signin");
};
