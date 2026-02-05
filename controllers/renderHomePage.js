import fs from "node:fs/promises";
import path from "node:path";
import { getContentType } from "../utils/getContentType.js";
import { __dirname } from "../index.js";

export const renderHomepage = async (req, res) => {
  try {
    const publicDir = path.join(__dirname, "public");
    const filepath = path.join(
      publicDir,
      req.url === "/" ? "index.html" : req.url,
    );

    const ext = path.extname(filepath);
    console.log(req.url);
    const contentType = getContentType(ext);
    const content = await fs.readFile(filepath);
    res.status(200);
    res.header("content-type", contentType);
    res.send(content);
  } catch (err) {
    console.log(err);
  }
};
