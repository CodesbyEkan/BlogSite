/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Post } from "../services/api";
import { posts as demoPosts } from "../data/posts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreatePostInput {
  title: string;
  content: string;
  tags: string[];
  coverImageUrl?: string;
  author: string;
  authorId: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  tags?: string[];
  coverImageUrl?: string;
}

export interface PostWithMeta extends Post {
  authorId?: string;
  coverImageUrl?: string;
  isUserPost?: boolean;
}

interface PostContextType {
  allPosts: PostWithMeta[];
  getUserPosts: (authorId: string) => PostWithMeta[];
  getPostById: (id: number) => PostWithMeta | undefined;
  createPost: (input: CreatePostInput) => PostWithMeta;
  updatePost: (id: number, authorId: string, updates: UpdatePostInput) => { success: boolean; error?: string };
  deletePost: (id: number, authorId: string) => { success: boolean; error?: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "blogsite_user_posts";

// TODO(security): All CRUD operations must be authorized server-side when backend
// endpoints are added. Client-side author checks are for UX only and can be bypassed.

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredPosts(): PostWithMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredPosts(posts: PostWithMeta[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function generatePostId(): number {
  // Offset above demo post IDs to avoid collisions
  return 1000 + Date.now() % 1_000_000;
}

function formatDate(): string {
  const d = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? "st"
    : day % 10 === 2 && day !== 12 ? "nd"
    : day % 10 === 3 && day !== 13 ? "rd"
    : "th";
  return `${day}${suffix} of ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePosts = (): PostContextType => {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error("usePosts must be used within a PostProvider");
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [userPosts, setUserPosts] = useState<PostWithMeta[]>(() => getStoredPosts());

  // Merge demo + user posts, user posts first (newest)
  const allPosts: PostWithMeta[] = [
    ...userPosts.map((p) => ({ ...p, isUserPost: true })),
    ...demoPosts.map((p) => ({ ...p, isUserPost: false })),
  ];

  const getUserPosts = useCallback(
    (authorId: string) => userPosts.filter((p) => p.authorId === authorId),
    [userPosts],
  );

  const getPostById = useCallback(
    (id: number): PostWithMeta | undefined => {
      return (
        userPosts.find((p) => p.id === id) ??
        demoPosts.find((p) => p.id === id)
      );
    },
    [userPosts],
  );

  const createPost = useCallback(
    (input: CreatePostInput): PostWithMeta => {
      const newPost: PostWithMeta = {
        id: generatePostId(),
        title: input.title,
        content: input.content,
        tags: input.tags,
        author: input.author,
        authorId: input.authorId,
        date: formatDate(),
        coverImageUrl: input.coverImageUrl,
        isUserPost: true,
      };
      const updated = [newPost, ...userPosts];
      setUserPosts(updated);
      saveStoredPosts(updated);
      return newPost;
    },
    [userPosts],
  );

  const updatePost = useCallback(
    (id: number, authorId: string, updates: UpdatePostInput) => {
      // TODO(security): Authorization must be enforced server-side
      const idx = userPosts.findIndex((p) => p.id === id);
      if (idx === -1) return { success: false, error: "Post not found." };
      if (userPosts[idx].authorId !== authorId) {
        return { success: false, error: "You can only edit your own posts." };
      }

      const updated = [...userPosts];
      updated[idx] = { ...updated[idx], ...updates };
      setUserPosts(updated);
      saveStoredPosts(updated);
      return { success: true };
    },
    [userPosts],
  );

  const deletePost = useCallback(
    (id: number, authorId: string) => {
      // TODO(security): Authorization must be enforced server-side
      const post = userPosts.find((p) => p.id === id);
      if (!post) return { success: false, error: "Post not found." };
      if (post.authorId !== authorId) {
        return { success: false, error: "You can only delete your own posts." };
      }

      const updated = userPosts.filter((p) => p.id !== id);
      setUserPosts(updated);
      saveStoredPosts(updated);
      return { success: true };
    },
    [userPosts],
  );

  return (
    <PostContext.Provider
      value={{ allPosts, getUserPosts, getPostById, createPost, updatePost, deletePost }}
    >
      {children}
    </PostContext.Provider>
  );
};

export default PostContext;
