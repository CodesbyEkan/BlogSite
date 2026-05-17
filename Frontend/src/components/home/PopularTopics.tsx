import { Link } from "react-router-dom";

const topics = [
  "React", "TypeScript", "System Design", "WebAssembly",
  "Rust", "GraphQL", "Performance", "DevOps", "AI", "Cloud",
];

const PopularTopics = () => {
  return (
    <div className="bg-surface-container-low p-6 rounded-lg border border-surface-variant">
      <h3 className="text-xl font-semibold text-primary mb-4" style={{ fontFamily: "'Geist', sans-serif" }}>
        Popular Topics
      </h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Link
            key={topic}
            to={`/posts?topic=${encodeURIComponent(topic.toLowerCase())}`}
            className="bg-white text-on-surface text-xs font-semibold px-3 py-1.5 rounded uppercase tracking-wide
                       border border-outline-variant hover:border-secondary hover:text-secondary
                       transition-colors shadow-sm"
          >
            # {topic}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularTopics;
