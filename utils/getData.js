import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filepath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filepath);
const postsFilePath = path.join(__dirname, "../data/posts.json");

export async function getPosts() {
  try {
    const data = await fs.readFile(postsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading posts:", error.message);
    return [];
  }
}
