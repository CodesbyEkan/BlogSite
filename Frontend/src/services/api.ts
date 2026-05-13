import axios from "axios";
import { posts } from "../data/posts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

export interface Post {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  tags: string[];
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAllPosts = async (): Promise<Post[]> => {
  const response = await apiClient.get("/post");
  return response.data;
};

export const getAllPostsDemo = async (): Promise<Post[]> => {
  const response = posts; // Simulate an API response using the imported posts data
  return response; // Return the posts data directly
};

export const getPostById = async (id: number): Promise<Post> => {
  const response = await apiClient.get(`/post/${id}`);
  return response.data;
};

export const getPostByIdDemo = async (
  id: number,
): Promise<Post | undefined> => {
  const response = posts.find((post) => post.id === id); // Simulate an API response by finding the post in the imported posts data
  return response; // Return the found post data directly
};

export default apiClient;
