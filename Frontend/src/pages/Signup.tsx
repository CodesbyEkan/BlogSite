import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Password strength helper ─────────────────────────────────────────────────

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score: 2, label: "Fair", color: "#f97316" };
  if (score <= 3) return { score: 3, label: "Good", color: "#eab308" };
  if (score <= 4) return { score: 4, label: "Strong", color: "#22c55e" };
  return { score: 5, label: "Excellent", color: "#06b6d4" };
}

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  const strength = password.length > 0 ? getPasswordStrength(password) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.error ?? "Signup failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative background */}
      <div className="auth-bg-gradient" />
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-container">
        {/* Left panel — branding */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <Link to="/" className="auth-brand-logo">BlogSite</Link>
            <h2 className="auth-brand-heading">Join the community</h2>
            <p className="auth-brand-subtitle">
              Create an account to start writing, share your expertise, and connect with readers worldwide.
            </p>
            <div className="auth-brand-decoration">
              <div className="auth-brand-line" />
              <div className="auth-brand-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            {/* Mobile logo */}
            <Link to="/" className="auth-mobile-logo">BlogSite</Link>

            <h1 className="auth-form-title">Create Account</h1>
            <p className="auth-form-subtitle">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>

            {error && (
              <div className="auth-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field">
                <label htmlFor="signup-name" className="auth-label">Full name</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="auth-input"
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-email" className="auth-label">Email address</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <polyline points="22,7 12,14 2,7" />
                  </svg>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="auth-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-password" className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="auth-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-toggle-password"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Password strength meter */}
                {strength && (
                  <div className="password-strength">
                    <div className="password-strength-bar">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className="password-strength-segment"
                          style={{
                            backgroundColor: level <= strength.score ? strength.color : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                    <span className="password-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="signup-confirm" className="auth-label">Confirm password</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <input
                    id="signup-confirm"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="auth-input"
                    autoComplete="new-password"
                  />
                  {confirmPassword.length > 0 && password === confirmPassword && (
                    <svg className="auth-input-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
                id="signup-submit"
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* TODO(security): Implement OAuth providers (Google, GitHub) for production */}
            <button className="auth-social-btn" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="auth-footer-text">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
