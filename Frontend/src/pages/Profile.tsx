import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth, type User } from "../context/AuthContext";
import { usePosts, type PostWithMeta } from "../context/PostContext";
import PostCard from "../components/home/PostCard";

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-pink-500",
  "bg-purple-500", "bg-cyan-500", "bg-red-500", "bg-emerald-500",
];

// Helper to pick color from hash
function pickAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Helper to mask email for security/PII protection
function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface EducationItem {
  id: string;
  school: string;
  degree: string;
  duration: string;
}

const Profile = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const { user: currentUser, updateProfile } = useAuth();
  const { allPosts } = usePosts();
  const navigate = useNavigate();

  // Primary Profile states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarColor, setAvatarColor] = useState("");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [userPosts, setUserPosts] = useState<PostWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // LinkedIn CV specific states
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  // Tab control inside Activity section
  const [activeTab, setActiveTab] = useState<"posts" | "notifications">("posts");

  // Mock notifications retained inside the activity cards
  const [notifications, setNotifications] = useState(() => [
    {
      id: "1",
      type: "like",
      author: "Sarah Jenkins",
      message: "Sarah Jenkins liked your post 'Building Scalable APIs with Go'",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "comment",
      author: "Michael Chen",
      message: "Michael Chen commented: 'Excellent write-up! I especially loved the performance benchmarks.'",
      time: "1 day ago",
      read: false,
    },
    {
      id: "3",
      type: "follow",
      author: "Elena Rostova",
      message: "Elena Rostova started following your publication",
      time: "3 days ago",
      read: true,
    },
    {
      id: "4",
      type: "system",
      author: "BlogSite Team",
      message: "Welcome to BlogSite! Complete your profile by writing your first article.",
      time: "5 days ago",
      read: true,
    },
  ]);

  // Editing Interface States
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [editName, setEditName] = useState("");
  const [editHeadline, setEditHeadline] = useState("");

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [editAboutText, setEditAboutText] = useState("");

  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expRole, setExpRole] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expDuration, setExpDuration] = useState("");
  const [expDesc, setExpDesc] = useState("");

  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduDuration, setEduDuration] = useState("");

  const [newSkill, setNewSkill] = useState("");

  const totalReadTime = useMemo(() => {
    return userPosts.reduce((acc, p) => acc + Math.max(1, Math.round(p.content.split(" ").length / 200)), 0);
  }, [userPosts]);

  // Load and resolve user metadata dynamically
  useEffect(() => {
    if (!identifier) {
      navigate("/", { replace: true });
      return;
    }

    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      const decoded = decodeURIComponent(identifier);

      // 1. Resolve user registry from localStorage
      let regUser: User | null = null;
      try {
        const rawUsers = localStorage.getItem("blogsite_users");
        const users: User[] = rawUsers ? JSON.parse(rawUsers) : [];
        regUser = users.find(
          (u) =>
            u.id === decoded ||
            u.name.toLowerCase() === decoded.toLowerCase() ||
            u.email.toLowerCase() === decoded.toLowerCase()
        ) || null;
      } catch {
        // Ignore storage errors
      }

      // 2. Set profile states
      const own = currentUser && regUser && currentUser.id === regUser.id;
      setIsOwnProfile(!!own);

      if (regUser) {
        setName(regUser.name);
        setAvatarColor(regUser.avatarColor || "#6366f1");
        setEmail(own ? regUser.email : maskEmail(regUser.email));
        setHeadline(regUser.headline || (own ? "" : ""));
        setAbout(regUser.about || (own ? "" : ""));
        setExperience(regUser.experience || []);
        setEducation(regUser.education || []);
        setSkills(regUser.skills || []);

        // Prep edit states
        setEditName(regUser.name);
        setEditHeadline(regUser.headline || "");
        setEditAboutText(regUser.about || "");
      } else {
        // Demo user resolution
        setName(decoded);
        setAvatarColor(""); // Will use pickAvatarColor in render
        setEmail(maskEmail(`${decoded.toLowerCase().replace(/\s+/g, ".")}@example.com`));

        // Load premium mock CVs for demo authors
        if (decoded.toLowerCase().includes("george") || decoded.toLowerCase().includes("billy")) {
          setHeadline("Principal Systems Architect | Go & Rust Specialist");
          setAbout("Over 12 years of experience designing and implementing highly available systems and microservices. Passionate about performant network protocols, developer experience, and backend automation. Author of several open-source libraries in Go and Rust.");
          setExperience([
            { id: "g1", role: "Principal Systems Architect", company: "TechCorp Global", duration: "2021 - Present", description: "Architecting cloud-native service mesh architectures handling 100k+ RPS. Leading Rust/Go compiler migrations." },
            { id: "g2", role: "Senior Backend Engineer", company: "Amazon Web Services (AWS)", duration: "2017 - 2021", description: "Designed distributed storage adapters for EBS backends. Optimized I/O performance bottlenecks." }
          ]);
          setEducation([
            { id: "e1", school: "Massachusetts Institute of Technology (MIT)", degree: "Master of Science in Computer Science", duration: "2015 - 2017" }
          ]);
          setSkills(["Go", "Rust", "AWS", "Kubernetes", "gRPC", "Distributed Systems", "Docker", "Microservices"]);
        } else if (decoded.toLowerCase().includes("simon") || decoded.toLowerCase().includes("scoffield")) {
          setHeadline("Principal Cloud DevOps Engineer | CI/CD Pioneer");
          setAbout("DevOps evangelist focusing on automated infrastructure, blue-green delivery systems, and infrastructure as code. Championing secure pipeline operations and cloud observability setups.");
          setExperience([
            { id: "s1", role: "Principal Cloud Engineer", company: "Google Cloud Platform", duration: "2022 - Present", description: "Designed next-generation declarative build frameworks for GCP cloud run foundations." },
            { id: "s2", role: "DevOps Tech Lead", company: "Netflix", duration: "2018 - 2022", description: "Engineered automated Spinnaker pipeline structures supporting continuous canary deployments." }
          ]);
          setEducation([
            { id: "se1", school: "Stanford University", degree: "Bachelor of Science in Engineering", duration: "2013 - 2017" }
          ]);
          setSkills(["DevOps", "Kubernetes", "Terraform", "CI/CD", "AWS", "Docker", "Python", "Prometheus", "Linux"]);
        } else {
          // Fallbacks for other authors
          setHeadline("Software Engineering Leader");
          setAbout("Software engineering leader and technical writer. Sharing thoughts and case studies on architectural development, systems design, and engineering trends.");
          setExperience([
            { id: "d1", role: "Engineering Lead", company: "InnovateTech", duration: "2020 - Present", description: "Managing team of 8 full stack developers building premium web assets." }
          ]);
          setEducation([
            { id: "de1", school: "State University", degree: "Bachelor of Science in Computer Science", duration: "2012 - 2016" }
          ]);
          setSkills(["JavaScript", "React", "Node.js", "Web Development", "Product Architecture"]);
        }
      }

      // 3. Filter posts published by this author
      const matches = allPosts.filter(
        (p) =>
          (regUser && p.authorId === regUser.id) ||
          p.author.toLowerCase() === decoded.toLowerCase()
      );
      setUserPosts(matches);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [identifier, allPosts, currentUser, navigate]);

  // Edit Profile triggers
  const handleSaveIntro = async () => {
    if (!editName.trim()) return;
    if (updateProfile) {
      await updateProfile({
        name: editName.trim(),
        headline: editHeadline.trim(),
      });
    }
    setIsEditingIntro(false);
  };

  const handleSaveAbout = async () => {
    if (updateProfile) {
      await updateProfile({
        about: editAboutText.trim(),
      });
    }
    setIsEditingAbout(false);
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expRole.trim() || !expCompany.trim() || !expDuration.trim()) return;

    let updatedList = [...experience];
    if (editingExpId) {
      updatedList = updatedList.map((item) =>
        item.id === editingExpId
          ? { id: item.id, role: expRole.trim(), company: expCompany.trim(), duration: expDuration.trim(), description: expDesc.trim() }
          : item
      );
    } else {
      updatedList.push({
        id: `exp_${Date.now()}`,
        role: expRole.trim(),
        company: expCompany.trim(),
        duration: expDuration.trim(),
        description: expDesc.trim(),
      });
    }

    if (updateProfile) {
      await updateProfile({ experience: updatedList });
    }

    // Reset
    setIsAddingExperience(false);
    setEditingExpId(null);
    setExpRole("");
    setExpCompany("");
    setExpDuration("");
    setExpDesc("");
  };

  const handleDeleteExperience = async (id: string) => {
    const updatedList = experience.filter((item) => item.id !== id);
    if (updateProfile) {
      await updateProfile({ experience: updatedList });
    }
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduSchool.trim() || !eduDegree.trim() || !eduDuration.trim()) return;

    let updatedList = [...education];
    if (editingEduId) {
      updatedList = updatedList.map((item) =>
        item.id === editingEduId
          ? { id: item.id, school: eduSchool.trim(), degree: eduDegree.trim(), duration: eduDuration.trim() }
          : item
      );
    } else {
      updatedList.push({
        id: `edu_${Date.now()}`,
        school: eduSchool.trim(),
        degree: eduDegree.trim(),
        duration: eduDuration.trim(),
      });
    }

    if (updateProfile) {
      await updateProfile({ education: updatedList });
    }

    // Reset
    setIsAddingEducation(false);
    setEditingEduId(null);
    setEduSchool("");
    setEduDegree("");
    setEduDuration("");
  };

  const handleDeleteEducation = async (id: string) => {
    const updatedList = education.filter((item) => item.id !== id);
    if (updateProfile) {
      await updateProfile({ education: updatedList });
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;

    const updatedList = [...skills, trimmed];
    if (updateProfile) {
      await updateProfile({ skills: updatedList });
    }
    setNewSkill("");
  };

  const handleDeleteSkill = async (skillName: string) => {
    const updatedList = skills.filter((s) => s !== skillName);
    if (updateProfile) {
      await updateProfile({ skills: updatedList });
    }
  };

  if (loading) {
    return (
      <div className="max-w-[850px] mx-auto px-6 py-20 animate-pulse space-y-6">
        <div className="h-60 bg-[#e5e7eb] rounded-2xl" />
        <div className="h-40 bg-[#e5e7eb] rounded-2xl" />
        <div className="h-40 bg-[#e5e7eb] rounded-2xl" />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Avatar stylers
  const isTailwindColor = avatarColor && avatarColor.startsWith("bg-");
  const avatarStyle = isTailwindColor ? {} : { backgroundColor: avatarColor || "#6366f1" };
  const avatarClass = `w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg border-4 border-white uppercase shrink-0 ${
    isTailwindColor ? avatarColor : pickAvatarColor(name)
  }`;

  return (
    <div className="max-w-[850px] mx-auto px-6 py-12 space-y-6">
      {/* ─── 1. Intro Card (Header) ─── */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden shadow-sm">
        {/* Cover banner */}
        <div className="h-36 md:h-48 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#14b8a6] relative" />
        
        {/* Profile Details Container */}
        <div className="px-6 md:px-8 pb-6 md:pb-8 relative">
          {/* Avatar floating */}
          <div className="-mt-12 md:-mt-16 mb-4">
            <div className={avatarClass} style={avatarStyle}>
              {initials}
            </div>
          </div>

          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1.5 flex-1">
              {isEditingIntro ? (
                <div className="w-full text-left mt-2 bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-primary">Edit Intro Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="intro-name" className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Full Name</label>
                      <input
                        id="intro-name"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="intro-headline" className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Professional Headline</label>
                      <input
                        id="intro-headline"
                        type="text"
                        value={editHeadline}
                        onChange={(e) => setEditHeadline(e.target.value)}
                        placeholder="e.g. Senior Software Engineer at Tech Corp"
                        className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditingIntro(false)}
                      className="text-xs font-bold px-4 py-2 border border-[#cbd5e1] rounded-full text-[#475569] hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveIntro}
                      className="text-xs font-bold px-4 py-2 bg-secondary text-white rounded-full hover:bg-opacity-90 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary" style={{ fontFamily: "'Geist', sans-serif" }}>
                      {name}
                    </h1>
                    {isOwnProfile && (
                      <button
                        onClick={() => {
                          setEditName(name);
                          setEditHeadline(headline);
                          setIsEditingIntro(true);
                        }}
                        className="p-1.5 text-[#9ca3af] hover:text-secondary hover:bg-slate-50 rounded-full transition-all"
                        aria-label="Edit Name and Headline"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-base font-medium text-[#475569] leading-relaxed">
                    {headline || (isOwnProfile ? "+ Add a professional headline" : "Creative Contributor")}
                  </p>
                  <p className="text-xs text-[#9ca3af] font-semibold tracking-wide flex items-center gap-1">
                    📍 Remote • <span className="text-secondary font-medium">{email}</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-[#f3f4f6] my-6" />

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="bg-[#f8fafc] rounded-xl p-4 text-center border border-[#f1f5f9]">
              <p className="text-2xl font-bold text-primary">{userPosts.length}</p>
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mt-1">
                Articles Published
              </p>
            </div>
            <div className="bg-[#f8fafc] rounded-xl p-4 text-center border border-[#f1f5f9]">
              <p className="text-2xl font-bold text-primary">{totalReadTime}m</p>
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mt-1">
                Total Read Time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. About Card ─── */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary" style={{ fontFamily: "'Geist', sans-serif" }}>
            About
          </h2>
          {isOwnProfile && !isEditingAbout && (
            <button
              onClick={() => {
                setEditAboutText(about);
                setIsEditingAbout(true);
              }}
              className="p-1.5 text-[#9ca3af] hover:text-secondary hover:bg-slate-50 rounded-full transition-all"
              aria-label="Edit About Bio"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
        </div>

        {isEditingAbout ? (
          <div className="space-y-4">
            <textarea
              value={editAboutText}
              onChange={(e) => setEditAboutText(e.target.value)}
              placeholder="Write a summary about your professional background, achievements, and skills..."
              className="w-full p-4 border border-[#cbd5e1] rounded-xl text-sm min-h-[120px] focus:ring-2 focus:ring-secondary focus:outline-none resize-y"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditingAbout(false)}
                className="text-xs font-bold px-4 py-2 border border-[#cbd5e1] rounded-full text-[#475569] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAbout}
                className="text-xs font-bold px-4 py-2 bg-secondary text-white rounded-full hover:bg-opacity-90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Source Serif 4', serif" }}>
            {about || (isOwnProfile ? "Welcome to your creator profile. Share a short summary of your professional journey!" : "No professional bio provided yet.")}
          </p>
        )}
      </div>

      {/* ─── 3. Experience Card ─── */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary" style={{ fontFamily: "'Geist', sans-serif" }}>
            Experience
          </h2>
          {isOwnProfile && !isAddingExperience && (
            <button
              onClick={() => {
                setEditingExpId(null);
                setExpRole("");
                setExpCompany("");
                setExpDuration("");
                setExpDesc("");
                setIsAddingExperience(true);
              }}
              className="p-1.5 text-secondary hover:bg-slate-50 rounded-full border border-secondary/30 transition-all font-semibold text-xs flex items-center gap-1 px-3"
            >
              ➕ Add Job
            </button>
          )}
        </div>

        {/* Add/Edit Experience Form */}
        {isAddingExperience && (
          <form onSubmit={handleSaveExperience} className="bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-2xl space-y-4 text-left">
            <h3 className="text-sm font-bold text-primary">{editingExpId ? "Edit Experience Entry" : "Add Experience Entry"}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="exp-title" className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Role Title</label>
                <input
                  id="exp-title"
                  type="text"
                  required
                  value={expRole}
                  onChange={(e) => setExpRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="exp-comp" className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Company</label>
                <input
                  id="exp-comp"
                  type="text"
                  required
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="exp-dur" className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Duration</label>
                <input
                  id="exp-dur"
                  type="text"
                  required
                  value={expDuration}
                  onChange={(e) => setExpDuration(e.target.value)}
                  placeholder="e.g. 2021 - Present"
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="exp-desc" className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Description</label>
              <textarea
                id="exp-desc"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder="Detail key projects, responsibilities, and achievements in this role..."
                className="w-full p-3 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:outline-none min-h-[80px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAddingExperience(false);
                  setEditingExpId(null);
                }}
                className="text-xs font-bold px-4 py-2 border border-[#cbd5e1] rounded-full text-[#475569] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-bold px-4 py-2 bg-secondary text-white rounded-full hover:bg-opacity-90 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {experience.length === 0 ? (
          <p className="text-sm text-[#9ca3af] italic">No experiences added yet.</p>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
            {experience.map((exp) => (
              <div key={exp.id} className="relative group space-y-1">
                {/* Node icon */}
                <div className="absolute -left-[31px] top-1 bg-white border-2 border-secondary w-4 h-4 rounded-full" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-primary leading-tight">{exp.role}</h3>
                    <p className="text-xs text-secondary font-medium mt-0.5">{exp.company} • {exp.duration}</p>
                  </div>
                  {isOwnProfile && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingExpId(exp.id);
                          setExpRole(exp.role);
                          setExpCompany(exp.company);
                          setExpDuration(exp.duration);
                          setExpDesc(exp.description || "");
                          setIsAddingExperience(true);
                        }}
                        className="text-xs text-[#9ca3af] hover:text-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                {exp.description && (
                  <p className="text-xs text-[#475569] leading-relaxed pt-1 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. Education Card ─── */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary" style={{ fontFamily: "'Geist', sans-serif" }}>
            Education
          </h2>
          {isOwnProfile && !isAddingEducation && (
            <button
              onClick={() => {
                setEditingEduId(null);
                setEduSchool("");
                setEduDegree("");
                setEduDuration("");
                setIsAddingEducation(true);
              }}
              className="p-1.5 text-secondary hover:bg-slate-50 rounded-full border border-secondary/30 transition-all font-semibold text-xs flex items-center gap-1 px-3"
            >
              ➕ Add School
            </button>
          )}
        </div>

        {/* Add/Edit Education Form */}
        {isAddingEducation && (
          <form onSubmit={handleSaveEducation} className="bg-[#f8fafc] border border-[#e2e8f0] p-5 rounded-2xl space-y-4 text-left">
            <h3 className="text-sm font-bold text-primary">{editingEduId ? "Edit Education Entry" : "Add Education Entry"}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="edu-sch" className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">School / University</label>
                <input
                  id="edu-sch"
                  type="text"
                  required
                  value={eduSchool}
                  onChange={(e) => setEduSchool(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="edu-deg" className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Degree / Field</label>
                <input
                  id="edu-deg"
                  type="text"
                  required
                  value={eduDegree}
                  onChange={(e) => setEduDegree(e.target.value)}
                  placeholder="e.g. BS in Computer Science"
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="edu-dur" className="text-xs font-bold text-[#64748b] uppercase tracking-wider block mb-1">Duration</label>
                <input
                  id="edu-dur"
                  type="text"
                  required
                  value={eduDuration}
                  onChange={(e) => setEduDuration(e.target.value)}
                  placeholder="e.g. 2016 - 2020"
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAddingEducation(false);
                  setEditingEduId(null);
                }}
                className="text-xs font-bold px-4 py-2 border border-[#cbd5e1] rounded-full text-[#475569] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-bold px-4 py-2 bg-secondary text-white rounded-full hover:bg-opacity-90 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {education.length === 0 ? (
          <p className="text-sm text-[#9ca3af] italic">No education added yet.</p>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
            {education.map((edu) => (
              <div key={edu.id} className="relative group space-y-1">
                {/* Node icon */}
                <div className="absolute -left-[31px] top-1 bg-white border-2 border-secondary w-4 h-4 rounded-full" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-primary leading-tight">{edu.school}</h3>
                    <p className="text-xs text-[#475569] font-medium mt-0.5">{edu.degree} • {edu.duration}</p>
                  </div>
                  {isOwnProfile && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingEduId(edu.id);
                          setEduSchool(edu.school);
                          setEduDegree(edu.degree);
                          setEduDuration(edu.duration);
                          setIsAddingEducation(true);
                        }}
                        className="text-xs text-[#9ca3af] hover:text-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 5. Skills Card ─── */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-primary" style={{ fontFamily: "'Geist', sans-serif" }}>
          Skills
        </h2>

        {isOwnProfile && (
          <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm pb-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. TypeScript"
              className="flex-1 px-3 py-1.5 border border-[#cbd5e1] rounded-full text-xs focus:ring-2 focus:ring-secondary focus:outline-none"
            />
            <button
              type="submit"
              className="text-xs font-bold px-4 py-1.5 bg-primary text-white rounded-full hover:bg-opacity-95 transition-all"
            >
              Add Skill
            </button>
          </form>
        )}

        {skills.length === 0 ? (
          <p className="text-sm text-[#9ca3af] italic">No skills listed yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-[#f1f5f9] text-[#334155] text-xs font-semibold px-4 py-2 rounded-full border border-slate-100 flex items-center gap-1.5"
              >
                {skill}
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(skill)}
                    className="text-[#94a3b8] hover:text-red-400 transition-colors font-bold text-[10px]"
                    aria-label={`Remove skill ${skill}`}
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ─── 6. Activity & Articles / Notifications Card ─── */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden shadow-sm">
        {/* Toggle Tab Header */}
        {isOwnProfile ? (
          <div className="border-b border-[#e5e7eb] bg-[#f8fafc] px-6 py-2">
            <div className="flex gap-8 -mb-px">
              <button
                onClick={() => setActiveTab("posts")}
                className={`py-3 text-sm font-bold tracking-wide border-b-2 transition-all duration-200 ${
                  activeTab === "posts"
                    ? "text-secondary border-secondary scale-[1.02]"
                    : "text-[#9ca3af] border-transparent hover:text-primary"
                }`}
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                Published Articles ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`py-3 text-sm font-bold tracking-wide border-b-2 transition-all duration-200 flex items-center gap-2 ${
                  activeTab === "notifications"
                    ? "text-secondary border-secondary scale-[1.02]"
                    : "text-[#9ca3af] border-transparent hover:text-primary"
                }`}
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                Notifications Inbox
                {notifications.some((n) => !n.read) && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-b border-[#e5e7eb] bg-[#f8fafc] px-6 py-4">
            <h2 className="text-xl font-bold text-primary" style={{ fontFamily: "'Geist', sans-serif" }}>
              Published Articles by {name}
            </h2>
          </div>
        )}

        <div className="p-6 md:p-8">
          {activeTab === "posts" || !isOwnProfile ? (
            /* ─── Articles Listing ─── */
            userPosts.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-4xl">✍️</div>
                <div>
                  <p className="text-base font-semibold text-primary">No articles published yet</p>
                  <p className="text-[#6b7280] text-sm max-w-xs mx-auto mt-1">
                    {isOwnProfile
                      ? "Start writing and sharing your expertise with the developer community today!"
                      : "This contributor hasn't published any articles yet."}
                  </p>
                </div>
                {isOwnProfile && (
                  <Link
                    to="/write"
                    className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full
                               hover:-translate-y-0.5 transition-transform duration-200 shadow-md inline-block"
                  >
                    Write Your First Post
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )
          ) : (
            /* ─── Notifications Inbox Panel (Strictly private) ─── */
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Unread Activity
                </span>
                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={() => {
                      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                    }}
                    className="text-xs font-bold text-secondary hover:underline transition-all"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-sm font-semibold text-primary">Your inbox is clean!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => {
                    let icon = "🔔";
                    let iconBg = "bg-blue-50 text-blue-500 border border-blue-100";
                    if (notif.type === "like") {
                      icon = "❤️";
                      iconBg = "bg-rose-50 text-rose-500 border border-rose-100";
                    } else if (notif.type === "comment") {
                      icon = "💬";
                      iconBg = "bg-teal-50 text-teal-500 border border-teal-100";
                    } else if (notif.type === "follow") {
                      icon = "👤";
                      iconBg = "bg-indigo-50 text-indigo-500 border border-indigo-100";
                    } else if (notif.type === "system") {
                      icon = "✨";
                      iconBg = "bg-purple-50 text-purple-500 border border-purple-100";
                    }

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === notif.id ? { ...n, read: !n.read } : n))
                          );
                        }}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                          notif.read
                            ? "bg-white border-[#e5e7eb] hover:bg-[#fafafa]"
                            : "bg-[#f8faff] border-[#dbeafe] hover:bg-[#f0f5ff]"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${iconBg}`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs text-[#374151] leading-relaxed ${!notif.read ? "font-bold text-[#111827]" : ""}`}>
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-[#9ca3af] font-medium block mt-1">{notif.time}</span>
                        </div>
                        <div className="shrink-0">
                          <div
                            className={`w-3 h-3 rounded-full border-2 ${
                              notif.read ? "border-[#d1d5db]" : "bg-secondary border-secondary"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
