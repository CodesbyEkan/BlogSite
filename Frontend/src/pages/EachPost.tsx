import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Post } from "../services/api";
import { getPostById, getPostByIdDemo, getRelatedPosts, extractErrorMessage } from "../services/api";

const placeholderImages = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
  "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=1200&q=80",
];

const tagToCategory: Record<string, string> = {
  react: "REACT", typescript: "TYPESCRIPT", architecture: "ARCHITECTURE",
  performance: "PERFORMANCE", systems: "SYSTEMS", cloud: "CLOUD",
  devops: "DEVOPS", ai: "AI", iot: "IOT",
};

function getCategory(tags: string[]): string {
  for (const tag of tags) {
    const cat = tagToCategory[tag.toLowerCase()];
    if (cat) return cat;
  }
  return tags[0]?.toUpperCase() ?? "TECH";
}

function getReadTime(content: string): number {
  return Math.max(1, Math.round(content.split(" ").length / 200));
}

const avatarColors = [
  "bg-indigo-500", "bg-teal-500", "bg-orange-500",
  "bg-pink-500", "bg-purple-500", "bg-cyan-500",
];

const EachPost = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPostById(parseInt(id));
        if (!cancelled) setPost(data);
      } catch (err) {
        // API unavailable — fall back to demo data
        try {
          const demo = await getPostByIdDemo(parseInt(id));
          if (!cancelled) {
            if (!demo) setError("Post not found.");
            else setPost(demo);
          }
        } catch {
          if (!cancelled) setError(extractErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPost();
    return () => { cancelled = true; };
  }, [id, retryKey]);

  // Fetch related posts once the main post is loaded
  useEffect(() => {
    if (!post) return;
    let cancelled = false;
    getRelatedPosts(post.id, post.tags).then((data) => {
      if (!cancelled) setRelated(data);
    });
    return () => { cancelled = true; };
  }, [post]);

  if (loading) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-[#e5e7eb] rounded w-1/3" />
        <div className="h-10 bg-[#e5e7eb] rounded w-3/4" />
        <div className="h-4 bg-[#e5e7eb] rounded w-1/2" />
        <div className="aspect-[16/9] bg-[#e5e7eb] rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-[#e5e7eb] rounded" style={{ width: `${85 + (i % 3) * 5}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-24 flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">
          ⚠️
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#111827] mb-1">Couldn't load this post</h2>
          <p className="text-[#6b7280] text-sm max-w-sm">{error ?? "Post not found."}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="text-sm font-semibold bg-secondary text-white px-5 py-2.5 rounded-full
                       hover:-translate-y-0.5 transition-transform shadow-sm hover:shadow-md"
          >
            Try again
          </button>
          <Link
            to="/posts"
            className="text-sm font-semibold border border-[#e5e7eb] text-[#374151] px-5 py-2.5 rounded-full
                       hover:bg-[#f3f4f6] transition-colors"
          >
            ← All Posts
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = placeholderImages[(post.id - 1) % placeholderImages.length];
  const category = getCategory(post.tags);
  const readTime = getReadTime(post.content);
  const avatarBg = avatarColors[post.id % avatarColors.length];
  const initials = post.author.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();


  return (
    <article className="bg-background">
      {/* Back link */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        <Link
          to="/posts"
          className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-secondary transition-colors"
        >
          ← Back to Posts
        </Link>
      </div>

      {/* Article header */}
      <div className="max-w-[720px] mx-auto px-6 pt-8 pb-6">
        {/* Tags breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-secondary uppercase mb-4">
          <span>{category}</span>
          {post.tags[1] && (
            <>
              <span className="text-[#d1d5db]">/</span>
              <span className="text-[#9ca3af]">{post.tags[1].toUpperCase()}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-[#111827] leading-tight mb-6"
            style={{ fontFamily: "'Geist', sans-serif" }}>
          {post.title}
        </h1>

        {/* Author + meta */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#e5e7eb]">
          <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">{post.author}</p>
            <p className="text-xs text-[#6b7280]">Senior Engineering Blog</p>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-[#6b7280]">
            <span>{post.date}</span>
            <span>•</span>
            <span>{readTime} min read</span>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="max-w-[720px] mx-auto px-6 mb-8">
        <div className="rounded-xl overflow-hidden aspect-[16/9] bg-[#f3f4f6]">
          <img src={imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
        <p className="text-xs text-[#9ca3af] text-center mt-2 italic">
          Illustration of {category.toLowerCase()} concepts in modern software
        </p>
      </div>

      {/* Article body */}
      <div className="max-w-[720px] mx-auto px-6 pb-16">
        <div className="prose prose-lg max-w-none text-[#374151] leading-relaxed space-y-5"
             style={{ fontFamily: "'Source Serif 4', serif", fontSize: "18px", lineHeight: "1.8" }}>
          {post.content.split(". ").reduce<string[][]>((acc, sentence, i) => {
            const groupIdx = Math.floor(i / 3);
            if (!acc[groupIdx]) acc[groupIdx] = [];
            acc[groupIdx].push(sentence);
            return acc;
          }, []).map((group, idx) => (
            <p key={idx}>{group.join(". ")}{group[group.length - 1]?.endsWith(".") ? "" : "."}</p>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[#e5e7eb]">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#f3f4f6] text-[#374151] text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Share */}
        <div className="flex items-center gap-3 mt-6">
          <span className="text-xs font-medium text-[#6b7280] uppercase tracking-widest">Share</span>
          {["Twitter", "LinkedIn"].map((platform) => (
            <button
              key={platform}
              className="text-xs font-semibold text-secondary border border-[#e5e7eb] px-4 py-2
                         rounded-full hover:bg-secondary hover:text-white transition-colors"
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="bg-[#f9fafb] border-t border-[#e5e7eb] py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#111827] mb-8" style={{ fontFamily: "'Geist', sans-serif" }}>
              Related Articles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relPost) => {
                const relImage = placeholderImages[(relPost.id - 1) % placeholderImages.length];
                const relCategory = getCategory(relPost.tags);
                return (
                  <Link key={relPost.id} to={`/posts/${relPost.id}`} className="group block">
                    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-[16/9] overflow-hidden bg-[#f3f4f6]">
                        <img src={relImage} alt={relPost.title}
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">
                          {relCategory}
                        </span>
                        <h3 className="text-sm font-bold text-[#111827] mt-1 line-clamp-2 group-hover:text-secondary transition-colors"
                            style={{ fontFamily: "'Geist', sans-serif" }}>
                          {relPost.title}
                        </h3>
                        <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">{relPost.content}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default EachPost;
