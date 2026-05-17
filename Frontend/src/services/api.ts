import axios, { type AxiosError } from "axios";
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

export interface ApiError {
  message: string;
  status?: number;
}

/** Extract a human-readable message from any caught value. */
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr.response) {
      // Server responded with a non-2xx status
      const serverMsg = axiosErr.response.data?.message;
      const status = axiosErr.response.status;
      if (serverMsg) return serverMsg;
      if (status === 404) return "The requested resource was not found.";
      if (status === 401 || status === 403) return "You are not authorised to view this content.";
      if (status >= 500) return "The server encountered an error. Please try again later.";
    }
    if (axiosErr.request) {
      // Request sent but no response received
      return "Unable to reach the server. Check your internet connection.";
    }
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred. Please try again.";
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ─── Response interceptor: normalise errors ──────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    // Re-throw so callers can still catch with extractErrorMessage
    return Promise.reject(err);
  },
);

// ─── Posts ────────────────────────────────────────────────────────────────────

export const getAllPosts = async (): Promise<Post[]> => {
  const response = await apiClient.get<Post[]>("/post");
  return response.data;
};

export const getAllPostsDemo = async (): Promise<Post[]> => posts;

export const getPostById = async (id: number): Promise<Post> => {
  const response = await apiClient.get<Post>(`/post/${id}`);
  return response.data;
};

export const getPostByIdDemo = async (id: number): Promise<Post | undefined> =>
  posts.find((post) => post.id === id);

/**
 * Returns up to `limit` posts that share at least one tag with the given post,
 * excluding the post itself. Falls back to demo data if the API is unavailable.
 */
export const getRelatedPosts = async (
  postId: number,
  tags: string[],
  limit = 3,
): Promise<Post[]> => {
  let all: Post[];
  try {
    all = await getAllPosts();
  } catch {
    all = await getAllPostsDemo();
  }
  const lowerTags = tags.map((t) => t.toLowerCase());
  return all
    .filter(
      (p) =>
        p.id !== postId &&
        p.tags.some((t) => lowerTags.includes(t.toLowerCase())),
    )
    .slice(0, limit);
};

// ─── Newsletter ───────────────────────────────────────────────────────────────

export const subscribeNewsletter = async (email: string): Promise<void> => {
  await apiClient.post("/newsletter/subscribe", { email });
};

export default apiClient;
