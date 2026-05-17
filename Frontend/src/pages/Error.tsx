import { Link } from "react-router-dom";

const Error = () => {
  return (
    <section className="flex flex-1 items-center justify-center min-h-[calc(100vh-160px)] px-6 py-16">
      <div className="text-center max-w-lg w-full">
        {/* Icon */}
        <div className="w-28 h-28 rounded-full bg-[#ede9fe] flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-14 h-14 text-secondary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="m9 21 3-3 3 3" />
            <path d="M12 12v6" />
          </svg>
        </div>

        {/* Text */}
        <h1 className="text-7xl font-bold text-[#111827] mb-4" style={{ fontFamily: "'Geist', sans-serif" }}>
          404
        </h1>
        <h2 className="text-2xl font-bold text-[#111827] mb-3" style={{ fontFamily: "'Geist', sans-serif" }}>
          Page Not Found
        </h2>
        <p className="text-[#6b7280] text-base leading-relaxed mb-10">
          It seems this page has been moved or doesn't exist.<br />
          Let's get you back to reading insightful content.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-secondary text-white text-sm font-semibold
                       px-8 py-3.5 rounded-full hover:bg-indigo-600 transition-colors shadow-md shadow-secondary/30"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go Back Home
          </Link>
          <Link
            to="/posts"
            className="inline-flex items-center gap-2 border border-[#e5e7eb] text-[#374151] text-sm font-semibold
                       px-8 py-3.5 rounded-full hover:bg-[#f9fafb] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Error;
