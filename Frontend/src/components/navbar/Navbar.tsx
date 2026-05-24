import { useEffect, useState, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAllPosts, getAllPostsDemo } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { usePosts } from "../../context/PostContext";

function useDebounce(value: string, time = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, time);

    return () => {
      clearTimeout(timeout)
    }
  }, [value, time])

  return debouncedValue;
}

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { allPosts: contextPosts } = usePosts();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [theme, setTheme] = useState<"light" | "dark" | string>(() => {
    const saved = localStorage.getItem("blogsite_theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("blogsite_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const scrollToNewsletter = () => {
    const el = document.getElementById("newsletter");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubscribe = () => {
    if (pathname === "/") {
      // Already on home — scroll directly
      scrollToNewsletter();
    } else {
      // Navigate to home, then scroll once React has painted the element
      navigate("/");
      // rAF + small timeout ensures the new page DOM is in place
      requestAnimationFrame(() => {
        setTimeout(scrollToNewsletter, 80);
      });
    }
  };
  const [searchInput, setSearchInput] = useState(false);
  const [searchedInput, setSearchedInput] = useState("");
  const [foundPosts, setFoundPosts] = useState<string[]>([]);
  const [posts, setPosts] = useState<import("../../services/api").Post[]>([]);
  const debounceInput = useDebounce(searchedInput);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllPosts();
        const userCreated = contextPosts.filter((p) => p.isUserPost);
        const apiPosts = Array.isArray(data) ? data : await getAllPostsDemo();
        setPosts([...userCreated, ...apiPosts]);
      } catch {
        setPosts(contextPosts);
      }
    })();
  }, [contextPosts]);

  useEffect(() => {
    let ignore = false;

    async function getPostTitles(query: string): Promise<string[]> {
      return new Promise((resolve, reject) => {
        if (ignore) reject("cancel request");

        const includes = posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()));
        const startsWith = posts.filter((post) => post.title.toLowerCase().startsWith(query.toLowerCase()));
        resolve(([...startsWith, ...includes.filter((post) => !startsWith.includes(post))].map((post) => post.title)));
      });
    }

    (async () => {
      setFoundPosts([]);
      if (debounceInput.length > 0 || searchInput) {
        try {
          const found = await getPostTitles(debounceInput);
          if (!ignore) setFoundPosts(found);
        } catch {
          // ignore cancellation
        }
      }
    })();

    return () => { ignore = true; }
  }, [searchInput, debounceInput, posts])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Posts", to: "/posts" },
  ];

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "";

  return (
    <header className="sticky top-0 z-50 border-b bg-surface border-outline-variant">
      <div className="flex lg:grid lg:grid-cols-3 h-20 items-center justify-between max-w-[1200px] mx-auto px-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-primary lg:justify-self-start"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          BlogSite
        </Link>

        {/* Nav Links */}
        <nav className="items-center hidden gap-8 lg:flex lg:justify-self-center lg:justify-center">
          {navLinks.map(({ label, to }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "pb-1 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-secondary border-b-2 border-secondary"
                    : "text-on-surface-variant hover:text-secondary",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 lg:justify-self-end">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-800 dark:text-gray-300 hover:text-secondary rounded-full transition-all focus:outline-none flex items-center justify-center shrink-0"
            aria-label="Toggle light and dark mode"
          >
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Search */}
          <div className="relative flex items-center">
            <input
              type="text"
              name="search input"
              className={`px-3 py-1.5 border border-outline-variant bg-surface text-primary rounded-md w-36 sm:w-44 lg:w-56 h-fit focus:outline-none focus:ring-1 focus:ring-secondary ${searchInput ? "block absolute right-8" : "hidden"
                }`}
              value={searchedInput}
              onChange={(e) => {
                setSearchedInput(e.target.value);
              }}
              autoFocus={true}
            />
            <button
              aria-label="Search"
              onClick={() => setSearchInput(!searchInput)}
              className="text-2xl transition-colors text-on-surface hover:text-secondary flex items-center justify-center focus:outline-none"
            >
              <BiSearch className="dark:text-gray-200 text-gray-800" title="Search Blog by title." />
            </button>
          </div>

          {isAuthenticated && user ? (
            /* ── Authenticated: Write button + avatar dropdown ── */
            <>
              <button
                onClick={handleSubscribe}
                className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant
                           hover:text-secondary transition-colors duration-200 focus:outline-none mr-4"
                id="navbar-subscribe-auth-btn"
              >
                Subscribe
              </button>
              <Link
                to="/write"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant
                           hover:text-secondary transition-colors duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Write
              </Link>

              {/* Avatar dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="navbar-avatar-btn"
                  style={{ backgroundColor: user.avatarColor }}
                  aria-label="User menu"
                  id="user-menu-btn"
                >
                  {initials}
                </button>

                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <div
                        className="navbar-dropdown-avatar"
                        style={{ backgroundColor: user.avatarColor }}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="navbar-dropdown-name">{user.name}</p>
                        <p className="navbar-dropdown-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="navbar-dropdown-divider" />
                    <Link
                      to={`/profile/${user.id}`}
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                      id="navbar-profile-link"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      My profile
                    </Link>
                    <Link
                      to="/write"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Write a post
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="navbar-dropdown-item navbar-dropdown-logout"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── Not authenticated: Sign In + Get Started buttons ── */
            <>
              <button
                onClick={handleSubscribe}
                className="text-sm font-medium text-on-surface-variant hover:text-secondary
                           transition-colors duration-200 hidden sm:inline-block focus:outline-none mr-4"
                id="navbar-subscribe-unauth-btn"
              >
                Subscribe
              </button>
              <Link
                to="/login"
                className="text-sm font-medium text-on-surface-variant hover:text-secondary
                           transition-colors duration-200 hidden sm:inline-block"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-primary text-white text-sm font-semibold px-6 py-3 rounded-full
                           hover:-translate-y-0.5 transition-transform duration-200
                           shadow-sm hover:shadow-lg focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                id="get-started-btn"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
      <div className={`${foundPosts.length >= 1 ? "fixed" : "hidden"} left-0 w-full border-outline-variant shadow-lg border-y py-4 bg-background px-28 top-20 overflow-y-scroll`} style={{ maxHeight: "calc(100% - 300px)" }}>
        {foundPosts.map((post) => {
          const match = posts.find((p) => p.title === post);
          const route = match ? `/posts/${match.id}` : "#";
          return (
            <li key={post} className="pb-1 text-lg font-bold list-none border-b border-outline-variant font-label-md text-primary hover:text-secondary transition-colors">
              <Link to={route} onClick={() => { setFoundPosts([]); setSearchInput(false); setSearchedInput(""); }}>
                {post}
              </Link>
            </li>
          );
        })}
      </div>
    </header>
  );
};

export default Navbar;
