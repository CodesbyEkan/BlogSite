import express from "express";
import path from "node:path";
import cors from "cors";
import { pageRouter } from "./routes/post.routes.js";
import { userRouter } from "./routes/user.routes.js";
import connectToDB from "./config/db.js";

connectToDB();
const PORT = 5000;
const app = express();


export const __dirname = import.meta.dirname;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use("/", pageRouter);
app.use("/user", userRouter);
app.listen(PORT, () =>
  console.log(`Server running on http://127.0.0.1:${PORT}.`),
);
