import { FiArrowLeft } from "react-icons/fi";
import { Link, useLocation, useParams } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();
  const params = useParams();
  const isPostsPage = pathname === "/posts";
  const isEachPostPage = pathname === `/posts/${params.id}`;
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between w-full max-w-6xl px-4 py-4 mx-auto sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid w-10 h-10 text-sm font-semibold place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/20">
            BS
          </span>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            BlogSite
          </p>
        </Link>

        <nav className="flex items-center gap-2 text-sm text-slate-300">
          {!isPostsPage && !isEachPostPage && (
            <Link
              to="/posts"
              className="px-4 py-2 transition rounded-full hover:bg-white/10 hover:text-white"
            >
              Posts
            </Link>
          )}
          {isEachPostPage && (
            <Link
              to="/posts"
              className="flex items-center gap-2 px-4 py-2 transition rounded-full hover:bg-white/10 hover:text-white"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back to posts
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
