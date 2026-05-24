import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Post } from "../../services/api";

const categoryMap: Record<string, string> = {
  cybersecurity: "Security",
  cloud: "Cloud",
  quantum: "Emerging Tech",
  edge: "Systems",
  AI: "AI",
  IoT: "IoT",
  blockchain: "Blockchain",
  "5G": "Networking",
  robotics: "Robotics",
  data: "Data",
  VR: "Immersive",
  AR: "Immersive",
  semiconductors: "Hardware",
  "renewable energy": "Green Tech",
  software: "Engineering",
  "digital twin": "Systems",
  HPC: "Performance",
  biotech: "Biotech",
  "smart cities": "Infrastructure",
  HCI: "UX",
};

function getCategory(tags: string[]): string {
  for (const tag of tags) {
    if (categoryMap[tag]) return categoryMap[tag];
  }
  return tags[0] ?? "Tech";
}

const placeholderImages = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
];

function getImage(id: number): string {
  return placeholderImages[(id - 1) % placeholderImages.length];
}

interface PostCardProps {
  post: Post;
}

const PostCard = memo(({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const category = getCategory(post.tags);
  const imageUrl = post.coverImageUrl || getImage(post.id);

  return (
    <Link to={`/posts/${post.id}`}>
      <article className="bg-white border border-[#e0e3e5] rounded-lg p-6
                          hover:border-[#6bd8cb] transition-colors duration-200
                          group cursor-pointer shadow-sm hover:shadow-lg">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Thumbnail */}
          <div className="w-full md:w-1/3 aspect-[4/3] rounded overflow-hidden bg-[#eceef0] flex-shrink-0">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-[#45464d]">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  {category}
                </span>
                <span className="text-xs">•</span>
                <span className="text-xs font-semibold">{post.date}</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-2"
                style={{ fontFamily: "'Geist', sans-serif" }}>
                {post.title}
              </h3>
              <p className="text-base text-[#45464d] line-clamp-2 leading-relaxed"
                style={{ fontFamily: "'Source Serif 4', serif" }}>
                {post.content}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2 flex-wrap">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#f2f4f6] text-[#191c1e] text-[11px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span
                className="text-xs text-[#45464d] hover:text-secondary hover:underline whitespace-nowrap ml-3 font-semibold cursor-pointer transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const authorId = (post as { authorId?: string }).authorId;
                  const identifier = authorId || post.author;
                  navigate(`/profile/${encodeURIComponent(identifier)}`);
                }}
              >
                {post.author}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
});

export default PostCard;
