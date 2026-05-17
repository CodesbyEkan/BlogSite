import { useState, type FormEvent } from "react";
import { subscribeNewsletter, extractErrorMessage } from "../../services/api";

type Status = "idle" | "loading" | "success" | "error";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      await subscribeNewsletter(email);
      setStatus("success");
      setEmail("");
    } catch (err) {
      // API unavailable — treat as success for demo (no real backend yet)
      if (import.meta.env.VITE_API_BASE_URL) {
        setStatus("error");
        setErrorMsg(extractErrorMessage(err));
      } else {
        // No backend configured — simulate success
        setStatus("success");
        setEmail("");
      }
    }
  };

  return (
    <div id="newsletter" className="p-6 rounded-lg border border-[#c3c0ff] bg-[#e2dfff]/20">
      <h3 className="mb-2 text-xl font-semibold text-primary" style={{ fontFamily: "'Geist', sans-serif" }}>
        Join the Newsletter
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">
        Get deep technical insights delivered straight to your inbox every Tuesday.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-sm font-medium text-secondary">
          <span className="text-lg">🎉</span>
          <span>You're subscribed! Check your inbox.</span>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              id="newsletter-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
              className="flex-1 px-3 py-2 text-sm transition-shadow bg-white border rounded outline-none
                         border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary
                         disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-secondary text-white text-sm font-semibold px-5 py-2 rounded
                         hover:-translate-y-0.5 transition-transform duration-200
                         shadow-sm hover:shadow-md focus:ring-2 focus:ring-secondary focus:ring-offset-2
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
                         flex items-center gap-1.5 min-w-[60px] justify-center"
            >
              {status === "loading" ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : "Join"}
            </button>
          </form>

          {status === "error" && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <span>⚠</span>
              {errorMsg}
              <button
                onClick={() => setStatus("idle")}
                className="ml-1 underline hover:no-underline"
              >
                Dismiss
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default NewsletterForm;
