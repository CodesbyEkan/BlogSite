import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import type { Post } from "../services/api";
import { getAllPosts, getAllPostsDemo, extractErrorMessage } from "../services/api";
import PostCard from "../components/home/PostCard";
import PopularTopics from "../components/home/PopularTopics";
import NewsletterForm from "../components/home/NewsletterForm";

const FEATURED_COUNT = 3;

// ── Skeleton for featured post cards ─────────────────────────────────────────
const FeaturedSkeleton = () => (
  <div className="bg-white border border-[#e0e3e5] rounded-lg p-6 animate-pulse">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 aspect-[4/3] rounded bg-[#e5e7eb] flex-shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-3 bg-[#e5e7eb] rounded w-1/4" />
        <div className="h-5 bg-[#e5e7eb] rounded w-3/4" />
        <div className="h-3 bg-[#e5e7eb] rounded w-full" />
        <div className="h-3 bg-[#e5e7eb] rounded w-2/3" />
        <div className="flex gap-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 bg-[#e5e7eb] rounded w-14" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Inline error banner ───────────────────────────────────────────────────────
const FetchError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
    <span className="text-red-500 text-xl mt-0.5">⚠</span>
    <div className="flex-1">
      <p className="text-sm font-semibold text-red-700">Failed to load posts</p>
      <p className="text-xs text-red-500 mt-0.5">{message}</p>
    </div>
    <button
      onClick={onRetry}
      className="text-xs font-semibold text-red-600 border border-red-300 rounded px-3 py-1.5
                 hover:bg-red-100 transition-colors shrink-0"
    >
      Retry
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPosts();
        if (!cancelled) setFeaturedPosts(data.slice(0, FEATURED_COUNT));
      } catch (err) {
        // API unavailable — fall back to demo data silently
        try {
          const demo = await getAllPostsDemo();
          if (!cancelled) setFeaturedPosts(demo.slice(0, FEATURED_COUNT));
        } catch (demoErr) {
          if (!cancelled) setError(extractErrorMessage(demoErr));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFeatured();
    return () => { cancelled = true; };
  }, [retryKey]);

  // GSAP entrance animations (run once posts are ready)
  useEffect(() => {
    if (loading) return;
    const targets = [heroRef.current, featuredRef.current, sidebarRef.current].filter(Boolean);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    targets.forEach((el, i) => {
      tl.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8 }, i === 0 ? 0 : "-=0.55");
    });
    return () => { tl.kill(); };
  }, [loading]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-20">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="text-center max-w-[720px] mx-auto mb-20 space-y-6"
      >
        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl text-primary">
          The Future of Tech, Deciphered
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed font-[400]"
          style={{ fontFamily: "'Source Serif 4', serif" }}>
          Deep-dive technical analysis, architectural patterns, and engineering
          insights for modern software builders. We cut through the noise so you
          can focus on writing better code.
        </p>
        <div className="pt-3">
          <Link
            to="/posts"
            className="inline-block bg-secondary text-white text-sm font-semibold px-10 py-4 rounded-full
                       hover:-translate-y-0.5 transition-transform duration-200
                       shadow-sm hover:shadow-lg focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          >
            Start Reading
          </Link>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Featured Posts */}
        <div ref={featuredRef} className="space-y-10 lg:col-span-8">
          <h2 className="pb-3 mb-6 text-2xl font-bold border-b text-primary border-surface-variant"
            style={{ fontFamily: "'Geist', sans-serif" }}>
            Featured Insights
          </h2>

          {error ? (
            <FetchError message={error} onRetry={() => setRetryKey((k) => k + 1)} />
          ) : loading ? (
            <div className="flex flex-col gap-6">
              {Array.from({ length: FEATURED_COUNT }).map((_, i) => <FeaturedSkeleton key={i} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside ref={sidebarRef} className="space-y-10 lg:col-span-4">
          <PopularTopics />
          <NewsletterForm />
        </aside>
      </div>
    </div>
  );
};

export default Home;
