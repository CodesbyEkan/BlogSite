/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  headline?: string;
  about?: string;
  experience?: Array<{ id: string; role: string; company: string; duration: string; description: string }>;
  education?: Array<{ id: string; school: string; degree: string; duration: string }>;
  skills?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (profileData: {
    name?: string;
    headline?: string;
    about?: string;
    experience?: Array<{ id: string; role: string; company: string; duration: string; description: string }>;
    education?: Array<{ id: string; school: string; degree: string; duration: string }>;
    skills?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY_USER = "blogsite_user";
const STORAGE_KEY_USERS = "blogsite_users";

const AVATAR_COLORS = [
  "#6366f1", "#14b8a6", "#f97316", "#ec4899",
  "#8b5cf6", "#06b6d4", "#ef4444", "#10b981",
];

// TODO(security): Replace localStorage session with HttpOnly, Secure, SameSite=Lax cookies
// set by the backend. Tokens must never be accessible via JavaScript in production.

// TODO(security): Consider OAuth providers (Google, GitHub) for production auth.

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function pickAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // TODO(security): Never store plain-text passwords — demo only
  avatarColor: string;
  headline?: string;
  about?: string;
  experience?: Array<{ id: string; role: string; company: string; duration: string; description: string }>;
  education?: Array<{ id: string; school: string; degree: string; duration: string }>;
  skills?: string[];
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function getStoredSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getStoredSession());

  const login = useCallback(async (email: string, password: string) => {
    // TODO(security): Replace with real backend auth call using HTTPS.
    // Credentials must NEVER be sent in URL parameters.
    const trimmedEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const found = users.find((u) => u.email === trimmedEmail);

    if (!found) {
      return { success: false, error: "No account found with this email." };
    }
    if (found.password !== password) {
      // TODO(security): Do not reveal whether email exists — use generic message in production
      return { success: false, error: "Incorrect password." };
    }

    const sessionUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      avatarColor: found.avatarColor,
      headline: found.headline,
      about: found.about,
      experience: found.experience,
      education: found.education,
      skills: found.skills,
    };
    setUser(sessionUser);
    saveSession(sessionUser);
    return { success: true };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    // TODO(security): Replace with real backend signup endpoint using HTTPS.
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
 
    if (trimmedName.length < 2) {
      return { success: false, error: "Name must be at least 2 characters." };
    }
    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters." };
    }
 
    const users = getStoredUsers();
    if (users.some((u) => u.email === trimmedEmail)) {
      return { success: false, error: "An account with this email already exists." };
    }
 
    const newUser: StoredUser = {
      id: generateId(),
      name: trimmedName,
      email: trimmedEmail,
      password, // TODO(security): Hash with Argon2/bcrypt server-side
      avatarColor: pickAvatarColor(trimmedEmail),
      headline: "",
      about: "",
      experience: [],
      education: [],
      skills: [],
    };
 
    saveStoredUsers([...users, newUser]);
 
    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarColor: newUser.avatarColor,
      headline: newUser.headline,
      about: newUser.about,
      experience: newUser.experience,
      education: newUser.education,
      skills: newUser.skills,
    };
    setUser(sessionUser);
    saveSession(sessionUser);
    return { success: true };
  }, []);
 
  const updateProfile = useCallback(async (profileData: {
    name?: string;
    headline?: string;
    about?: string;
    experience?: Array<{ id: string; role: string; company: string; duration: string; description: string }>;
    education?: Array<{ id: string; school: string; degree: string; duration: string }>;
    skills?: string[];
  }) => {
    if (!user) {
      return { success: false, error: "Not authenticated." };
    }
 
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      return { success: false, error: "User not found in registry." };
    }
 
    const updatedUser: StoredUser = {
      ...users[index],
      ...profileData,
    };
 
    const newUsers = [...users];
    newUsers[index] = updatedUser;
    saveStoredUsers(newUsers);
 
    const sessionUser: User = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatarColor: updatedUser.avatarColor,
      headline: updatedUser.headline,
      about: updatedUser.about,
      experience: updatedUser.experience,
      education: updatedUser.education,
      skills: updatedUser.skills,
    };
 
    setUser(sessionUser);
    saveSession(sessionUser);
    return { success: true };
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    saveSession(null);
    // Clear any draft data
    localStorage.removeItem("blogsite_draft");
    // TODO(security): Invalidate server-side session/JWT when backend exists
    // Full page reload to clear cached state
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
