import fs from "node:fs/promises";

export function getPosts() {
  try {
    const __dirname = import.meta.url
    console.log()
    const data = fs.readFileSync(postsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading posts:", error.message);
    return [];
  }
}
