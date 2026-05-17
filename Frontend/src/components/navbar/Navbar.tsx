import { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAllPosts, getAllPostsDemo } from "../../services/api";

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
  const navigate = useNavigate();

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
        setPosts(data);
      } catch {
        const data = await getAllPostsDemo();
        setPosts(data);
      }
    })();
  }, []);

  async function getPostTitles(query: string, ignore: boolean): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (ignore) reject("cancel request");

      const includes = posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()));
      const startsWith = posts.filter((post) => post.title.toLowerCase().startsWith(query.toLowerCase()));
      resolve(([...startsWith, ...includes.filter((post) => !startsWith.includes(post))].map((post) => post.title)));
    })
  }

  useEffect(() => {
    let ignore = false;
    (async () => {
      setFoundPosts([]);
      if (debounceInput.length > 0 || searchInput) {
        const foundPosts = await getPostTitles(debounceInput, ignore);
        if (!ignore) setFoundPosts(foundPosts);
      }
    })();

    return () => { ignore = true; }
  }, [searchInput, debounceInput])

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Posts", to: "/posts" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-surface border-outline-variant">
      <div className="flex h-20 items-center justify-between max-w-[1200px] mx-auto px-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-primary"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          BlogSite
        </Link>

        {/* Nav Links */}
        <nav className="items-center hidden gap-8 lg:flex">
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
        <div className="flex items-center gap-6">
          <div className="relative flex items-center">
            <input type="text" name="search input" className={`px-3 py-1 border-2 border-black rounded-md w-36 sm:w-44  lg:w-56 h-fit focus:outline-1 focus:outline-secondary ${searchInput ? "block absolute right-8" : "hidden"}`} value={searchedInput} onChange={(e) => { setSearchedInput(e.target.value) }} autoFocus={true} />
            <button
              aria-label="Search"
              className="text-2xl transition-colors material-symbols-outlined text-on-surface hover:text-secondary"
            >
              <BiSearch onClick={() => setSearchInput(!searchInput)} title="Search Blog by title." />
            </button></div>
          <button
            onClick={handleSubscribe}
            className="bg-primary text-white text-sm font-semibold px-6 py-3 rounded-full
                       hover:-translate-y-0.5 transition-transform duration-200
                       shadow-sm hover:shadow-lg focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          >
            Subscribe
          </button>
        </div>
      </div>
      <div className={`${foundPosts.length >= 1 ? "fixed" : "hidden"} left-0 w-full border-gray-200 shadow-lg border-y py-4 bg-background px-28 shadow-gray-400 top-20 overflow-y-scroll`} style={{ maxHeight: "calc(100% - 300px)" }}>
        {foundPosts.map((post) => (
          <li key={post} className="pb-1 text-lg font-bold list-none border-b border-gray-400 font-label-md"><Link to={`/posts/${posts.findIndex((p) => p.title === post) + 1}`} onClick={() => { setFoundPosts([]); setSearchInput(false); setSearchedInput("") }}>{post}</Link></li>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
