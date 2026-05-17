import express from "express";
import path from "node:path";
import cors from "cors";
import { pageRouter } from "./routes/postRoutes.js";

const PORT = 5000;
const app = express();

export const __dirname = import.meta.dirname;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use("/", pageRouter); 
app.listen(PORT, () =>
  console.log(`Server running on http://127.0.0.1:${PORT}.`),
);
