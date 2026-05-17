import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Post } from "../services/api";
import { getAllPosts, getAllPostsDemo, extractErrorMessage } from "../services/api";

const CATEGORY_FILTERS = ["ALL", "FRONTEND", "BACKEND", "AI", "DEVOPS", "DESIGN"];
const POSTS_PER_PAGE = 9;

const placeholderImages = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
  "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=600&q=80",
];

const tagToCategory: Record<string, string> = {
  react: "FRONTEND",
  vue: "FRONTEND",
  typescript: "FRONTEND",
  javascript: "FRONTEND",
  css: "FRONTEND",
  webassembly: "FRONTEND",
  "node.js": "BACKEND",
  cloud: "BACKEND",
  devops: "DEVOPS",
  aws: "DEVOPS",
  docker: "DEVOPS",
  kubernetes: "DEVOPS",
  ai: "AI",
  "machine learning": "AI",
  automation: "AI",
  design: "DESIGN",
  ux: "DESIGN",
  hci: "DESIGN",
};

function getPostCategory(tags: string[]): string {
  for (const tag of tags) {
    const cat = tagToCategory[tag.toLowerCase()];
    if (cat) return cat;
  }
  return "BACKEND";
}

function getReadTime(content: string): number {
  return Math.max(1, Math.round(content.split(" ").length / 200));
}

const PostCardGrid = ({ post, index }: { post: Post; index: number }) => {
  const imageUrl = placeholderImages[index % placeholderImages.length];
  const category = getPostCategory(post.tags);
  const readTime = getReadTime(post.content);

  const avatarColors = [
    "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-pink-500",
    "bg-purple-500", "bg-cyan-500",
  ];
  const avatarBg = avatarColors[post.id % avatarColors.length];
  const initials = post.author.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Link to={`/posts/${post.id}`} className="group block">
      <article className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden
                          hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-[#f3f4f6]">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold
                           tracking-widest text-[#374151] px-2.5 py-1 rounded-full uppercase">
            {category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-xs text-[#6b7280] mb-3">
            <span>🗓 {post.date}</span>
            <span>•</span>
            <span>{readTime} min read</span>
          </div>

          <h2 className="text-base font-bold text-[#111827] mb-2 line-clamp-2 group-hover:text-secondary transition-colors"
              style={{ fontFamily: "'Geist', sans-serif" }}>
            {post.title}
          </h2>
          <p className="text-sm text-[#6b7280] line-clamp-2 leading-relaxed flex-1"
             style={{ fontFamily: "'Source Serif 4', serif" }}>
            {post.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f3f4f6]">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold`}>
                {initials}
              </div>
              <span className="text-xs font-medium text-[#374151]">{post.author}</span>
            </div>
            <span className="text-xs font-semibold text-secondary flex items-center gap-1">
              Read →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden animate-pulse">
    <div className="aspect-[16/9] bg-[#e5e7eb]" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-[#e5e7eb] rounded w-1/3" />
      <div className="h-4 bg-[#e5e7eb] rounded w-3/4" />
      <div className="h-3 bg-[#e5e7eb] rounded w-full" />
      <div className="h-3 bg-[#e5e7eb] rounded w-2/3" />
      <div className="flex items-center gap-2 pt-2">
        <div className="w-7 h-7 rounded-full bg-[#e5e7eb]" />
        <div className="h-3 bg-[#e5e7eb] rounded w-1/4" />
      </div>
    </div>
  </div>
);

const Posts = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPosts();
        if (!cancelled) setAllPosts(Array.isArray(data) ? data : await getAllPostsDemo());
      } catch {
        // API unavailable — fall back to demo data silently
        try {
          const demo = await getAllPostsDemo();
          if (!cancelled) setAllPosts(demo);
        } catch (demoErr) {
          if (!cancelled) setError(extractErrorMessage(demoErr));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPosts();
    return () => { cancelled = true; };
  }, [retryKey]);


  const filtered = allPosts
    .filter((p) => activeFilter === "ALL" || getPostCategory(p.tags) === activeFilter)
    .sort((a, b) => sortBy === "newest" ? b.id - a.id : a.id - b.id);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  // Build page number list with ellipsis
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) pages.push(p);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#111827] mb-2" style={{ fontFamily: "'Geist', sans-serif" }}>
            Explore All Articles
          </h1>
          <p className="text-[#6b7280] text-base max-w-md">
            Dive into the latest insights, tutorials, and deep dives across the tech landscape.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6b7280] shrink-0">
          <span className="font-medium">SORT BY:</span>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as "newest" | "oldest"); setCurrentPage(1); }}
            className="border border-[#e5e7eb] rounded-lg px-3 py-1.5 text-sm text-[#374151] bg-white
                       focus:ring-2 focus:ring-secondary outline-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
            className={[
              "px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors",
              activeFilter === filter
                ? "bg-secondary text-white"
                : "bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]",
            ].join(" ")}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
          <span className="text-red-500 text-xl mt-0.5 shrink-0">⚠</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Failed to load posts</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="text-xs font-semibold text-red-600 border border-red-300 rounded-lg px-3 py-1.5
                       hover:bg-red-100 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : paginated.map((post, i) => <PostCardGrid key={post.id} post={post} index={i} />)
        }
      </div>

      {/* No results */}
      {!loading && filtered.length === 0 && (
        <p className="text-center text-[#6b7280] py-16 text-lg">
          No posts found in this category.
        </p>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-12">
          {/* Prev */}
          <button
            onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border border-[#e5e7eb]
                       text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            Prev
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-[#9ca3af] select-none">…</span>
            ) : (
              <button
                key={page}
                onClick={() => { setCurrentPage(page as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={[
                  "w-9 h-9 rounded-full text-sm font-semibold transition-colors",
                  currentPage === page
                    ? "bg-secondary text-white shadow-sm"
                    : "border border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6]",
                ].join(" ")}
              >
                {page}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border border-[#e5e7eb]
                       text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Posts;
