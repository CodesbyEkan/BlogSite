import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { PostProvider } from "./context/PostContext";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import EachPost from "./pages/EachPost";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WritePost from "./pages/WritePost";
import Profile from "./pages/Profile";
import Error from "./pages/Error";

import { useEffect } from "react";

function App() {
  useEffect(() => {
    const getInitialTheme = (): "light" | "dark" => {
      const saved = localStorage.getItem("blogsite_theme");
      if (saved === "light" || saved === "dark") {
        return saved;
      }
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    };

    const initialTheme = getInitialTheme();
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, []);

  return (
    <AuthProvider>
      <PostProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth pages — no navbar/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Write/Edit — own minimal header */}
            <Route path="/write" element={<WritePost />} />
            <Route path="/write/:id" element={<WritePost />} />

            {/* Main layout with navbar + footer */}
            <Route element={<RootLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/posts/:id" element={<EachPost />} />
              <Route path="/profile/:identifier" element={<Profile />} />
              <Route path="*" element={<Error />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PostProvider>
    </AuthProvider>
  );
}

export default App;
