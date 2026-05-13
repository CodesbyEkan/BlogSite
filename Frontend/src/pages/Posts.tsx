import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import type { Post } from "../services/api";
import { getAllPosts, getAllPostsDemo } from "../services/api";

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const getPostsPerPage = () =>
    window.innerWidth < 640 ? 4 : window.innerWidth < 1280 ? 6 : 9;

  const [POSTS_PER_PAGE, setPOSTS_PER_PAGE] = useState(getPostsPerPage);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const next = getPostsPerPage();
        setPOSTS_PER_PAGE((prev) => (prev === next ? prev : next));
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data: Post[] = await getAllPosts();

        if (!Array.isArray(data)) {
          const demoData = await getAllPostsDemo(); // Fallback to demo data if API response is not an array
          setPosts(demoData);
        } else {
          setPosts(data);
        }

        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-4 space-y-6 lg:py-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Posts
        </h1>
        <p className="text-slate-400">Loading posts...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-4 space-y-6 lg:py-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Posts
        </h1>
        <p className="text-red-400">Error: {error}</p>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <section className="py-4 space-y-6 lg:py-8">
      <h1 className="text-4xl font-semibold tracking-tight text-white">
        Posts
      </h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {currentPosts.map((post) => (
          <article
            key={post.id}
            className="flex flex-col h-full p-6 transition duration-300 border rounded-3xl border-white/10 bg-white/5 hover:-translate-y-1 hover:bg-white/10"
          >
            <p className="text-xs text-slate-400">{post.author}</p>
            <h2 className="mt-2 text-lg font-semibold text-white line-clamp-2">
              {post.title}
            </h2>
            <p className="mt-3 text-sm text-slate-300 line-clamp-3">
              {post.content}
            </p>
            <Link
              to={`/posts/${post.id}`}
              className="inline-flex items-center px-4 py-2 mt-auto text-sm font-semibold transition border rounded-full w-fit border-cyan-300/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400 hover:text-slate-950"
            >
              Read post
            </Link>
          </article>
        ))}
      </div>

      {posts.length > POSTS_PER_PAGE && (
        <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-slate-400">
            Showing {startIndex + 1}-
            {Math.min(startIndex + POSTS_PER_PAGE, posts.length)} of{" "}
            {posts.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              aria-label="Previous page"
              title="Previous page"
              className="grid w-10 h-10 transition border rounded-full place-items-center border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition ${page === safeCurrentPage
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              aria-label="Next page"
              title="Next page"
              className="grid w-10 h-10 transition border rounded-full place-items-center border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Posts;
