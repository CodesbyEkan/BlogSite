import { useState, useEffect, useRef, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";

const DRAFT_KEY = "blogsite_draft";
const AUTOSAVE_INTERVAL = 30_000; // 30 seconds

const WritePost = () => {
  const { user, isAuthenticated } = useAuth();
  const { getPostById, createPost, updatePost } = usePosts();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load existing post in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const post = getPostById(parseInt(id));
      if (post) {
        // TODO(security): Server-side authorization check must happen here
        if (post.authorId && post.authorId !== user?.id) {
          navigate("/", { replace: true });
          return;
        }
        Promise.resolve().then(() => {
          setTitle(post.title);
          setContent(post.content);
          setTags(post.tags);
          setCoverImageUrl(post.coverImageUrl ?? "");
        });
      } else {
        Promise.resolve().then(() => {
          setError("Post not found.");
        });
      }
    } else {
      // Try to load draft
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          Promise.resolve().then(() => {
            if (parsed.title) setTitle(parsed.title);
            if (parsed.content) setContent(parsed.content);
            if (parsed.tags) setTags(parsed.tags);
            if (parsed.coverImageUrl) setCoverImageUrl(parsed.coverImageUrl);
          });
        }
      } catch {
        // Ignore invalid draft
      }
    }
  }, [isEditMode, id, getPostById, user?.id, navigate]);

  // Autosave draft (only in create mode)
  const saveDraft = useCallback(() => {
    if (isEditMode) return;
    if (!title && !content && tags.length === 0) return;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ title, content, tags, coverImageUrl }),
    );
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaved(true);
    saveTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
  }, [title, content, tags, coverImageUrl, isEditMode]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    autosaveTimerRef.current = setInterval(saveDraft, AUTOSAVE_INTERVAL);
    return () => {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
    };
  }, [saveDraft]);

  // Auto-resize textareas
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => autoResize(titleRef.current), [title]);
  useEffect(() => autoResize(contentRef.current), [content]);

  // Tag input handlers
  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Publish / Update handler
  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please add a title to your post.");
      return;
    }
    if (!content.trim()) {
      setError("Your post needs some content before publishing.");
      return;
    }
    if (content.trim().length < 50) {
      setError("Content should be at least 50 characters.");
      return;
    }
    if (tags.length === 0) {
      setError("Add at least one tag to help readers find your post.");
      return;
    }

    if (!user) return;

    setPublishing(true);

    // Simulate a brief network delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (isEditMode && id) {
      const result = updatePost(parseInt(id), user.id, {
        title: title.trim(),
        content: content.trim(),
        tags,
        coverImageUrl: coverImageUrl.trim() || undefined,
      });
      if (!result.success) {
        setError(result.error ?? "Failed to update post.");
        setPublishing(false);
        return;
      }
      navigate(`/posts/${id}`, { replace: true });
    } else {
      const newPost = createPost({
        title: title.trim(),
        content: content.trim(),
        tags,
        coverImageUrl: coverImageUrl.trim() || undefined,
        author: user.name,
        authorId: user.id,
      });
      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      navigate(`/posts/${newPost.id}`, { replace: true });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="write-page">
      {/* Top bar */}
      <header className="write-header">
        <div className="write-header-inner">
          <Link to="/" className="write-logo">BlogSite</Link>

          <div className="write-header-actions">
            {saved && (
              <span className="write-saved-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Draft saved
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="write-preview-btn"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="write-publish-btn"
              id="publish-post-btn"
            >
              {publishing ? (
                <span className="auth-spinner" />
              ) : isEditMode ? (
                "Update"
              ) : (
                "Publish"
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="write-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="write-error-close" aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {/* Editor */}
      <main className="write-main">
        {showPreview ? (
          /* ── Preview mode ──────────────────────────── */
          <article className="write-preview">
            {coverImageUrl && (
              <div className="write-preview-cover">
                <img src={coverImageUrl} alt="Cover" />
              </div>
            )}
            <h1 className="write-preview-title">
              {title || "Untitled Post"}
            </h1>
            <div className="write-preview-meta">
              <div
                className="write-preview-avatar"
                style={{ backgroundColor: user?.avatarColor ?? "#6366f1" }}
              >
                {user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="write-preview-author">{user?.name}</p>
                <p className="write-preview-date">Draft · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
            {tags.length > 0 && (
              <div className="write-preview-tags">
                {tags.map((tag) => (
                  <span key={tag} className="write-preview-tag">{tag}</span>
                ))}
              </div>
            )}
            <div className="write-preview-body">
              {content.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </article>
        ) : (
          /* ── Edit mode ─────────────────────────────── */
          <div className="write-editor">
            {/* Cover image */}
            <div className="write-cover-section">
              {coverImageUrl ? (
                <div className="write-cover-preview">
                  <img src={coverImageUrl} alt="Cover preview" />
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl("")}
                    className="write-cover-remove"
                    aria-label="Remove cover image"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="write-cover-input-wrapper">
                  <button
                    type="button"
                    className="write-cover-add-btn"
                    onClick={() => {
                      const wrapper = document.getElementById("cover-url-input");
                      if (wrapper) wrapper.classList.toggle("write-cover-expanded");
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Add cover image
                  </button>
                  <div id="cover-url-input" className="write-cover-url-row">
                    <input
                      type="url"
                      placeholder="Paste image URL..."
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className="write-cover-url-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="write-title-input"
              rows={1}
              maxLength={200}
              autoFocus={!isEditMode}
            />

            {/* Tags */}
            <div className="write-tags-section">
              <div className="write-tags-container">
                {tags.map((tag) => (
                  <span key={tag} className="write-tag-chip">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="write-tag-remove"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                    placeholder={tags.length === 0 ? "Add up to 5 tags..." : "Add tag..."}
                    className="write-tag-input"
                  />
                )}
              </div>
            </div>

            {/* Content */}
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story..."
              className="write-content-input"
              rows={12}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default WritePost;
