import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Contact", to: "/contact" },
  { label: "About", to: "/about" },
];

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-outline-variant mt-20">
      <div className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link to="/" className="text-xl font-bold text-primary" style={{ fontFamily: "'Geist', sans-serif" }}>
          BlogSite
        </Link>
        <nav className="flex gap-6 flex-wrap justify-center">
          {footerLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-secondary text-sm">
          © {new Date().getFullYear()} BlogSite. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
