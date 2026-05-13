import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Post } from "../services/api";
import { getPostById, getPostByIdDemo } from "../services/api";

const EachPost = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPostById(parseInt(id));
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setPost(data);
        } else {
          // Fallback to demo data if API response is unexpected
          const demoData = await getPostByIdDemo(parseInt(id));
          if (!demoData) {
            setError("Post not found");
            return;
          }
          setPost(demoData);
        }
      } catch {
        // API unavailable — fall back to demo data
        const demoData = await getPostByIdDemo(parseInt(id!));
        if (!demoData) {
          setError("Post not found");
        } else {
          setPost(demoData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const statusMessage = loading
    ? { text: "Loading post...", className: "text-slate-400" }
    : error
      ? { text: `Error: ${error}`, className: "text-red-400" }
      : !post
        ? { text: "Post not found", className: "text-slate-400" }
        : null;

  if (statusMessage) {
    return (
      <article className="mx-auto w-full max-w-3xl py-4 lg:py-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 sm:p-8 lg:p-10">
          <p className={statusMessage.className}>{statusMessage.text}</p>
        </div>
      </article>
    );
  }

  const p = post!;

  return (
    <article className="mx-auto w-full max-w-3xl py-4 lg:py-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 sm:p-8 lg:p-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            {p.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span>By {p.author}</span>
            <span>•</span>
            <span>{p.date}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-4">
            {p.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-8 space-y-4 text-slate-300 leading-relaxed">
          {p.content.split("\n").map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
};

export default EachPost;
