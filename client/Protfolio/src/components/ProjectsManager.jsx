import { useState, useEffect, useRef } from "react";
import "./ProjectsManager.css";
import { compressImage, getSizeLabel, getBase64SizeKB } from '../utils/imageOptimizer';

const STATUSES = ["completed", "in-progress", "planned"];
const STATUS_META = {
  "completed":   { label: "Completed",   color: "#16a34a", bg: "#dcfce7", icon: "fas fa-check-circle" },
  "in-progress": { label: "In Progress", color: "#ca8a04", bg: "#fef9c3", icon: "fas fa-spinner" },
  "planned":     { label: "Planned",     color: "#0284c7", bg: "#e0f2fe", icon: "fas fa-clock" },
};

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EMPTY_FORM = {
  title: "", description: "", techStack: [],
  githubLink: "", liveLink: "", image: "", status: "completed",
};

function validate(form) {
  const errors = {};
  if (!form.title.trim())          errors.title       = "Project title is required.";
  if (!form.description.trim())    errors.description = "Description is required.";
  if (form.techStack.length === 0) errors.techStack   = "Add at least one technology.";
  return errors;
}

export default function ProjectsManager() {
  const [projects, setProjects]         = useState([]);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [errors, setErrors]             = useState({});
  const [editingId, setEditingId]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [deletingId, setDeletingId]     = useState(null);
  const [feedback, setFeedback]         = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [tagInput, setTagInput]         = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInfo, setImageInfo]       = useState(null); // { original, compressed }
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ]           = useState("");
  const fileRef = useRef(null);

  const token   = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  // ── Fetch projects ───────────────────────────────────────────
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch { showFeedback("error", "Failed to load projects."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  // ── Handle basic fields ──────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  // ── Image upload with compression ────────────────────────────
  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showFeedback("error", "Image too large. Please use an image under 5MB.");
      return;
    }

    setUploadingImage(true);
    setImageInfo(null);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 800, maxHeight: 600, quality: 0.82,
      });

      const originalKB   = Math.round(file.size / 1024);
      const compressedKB = getBase64SizeKB(compressed);

      setImageInfo({
        original:   getSizeLabel(file.size),
        compressed: `${compressedKB} KB`,
        saved:      `${Math.max(0, originalKB - compressedKB)} KB saved`,
      });

      setImagePreview(compressed);
      setForm(p => ({ ...p, image: compressed }));
    } catch (err) {
      showFeedback("error", err.message || "Image compression failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUrl = (e) => {
    const url = e.target.value;
    setForm(p => ({ ...p, image: url }));
    setImagePreview(url);
    setImageInfo(null);
  };

  const clearImage = () => {
    setForm(p => ({ ...p, image: "" }));
    setImagePreview("");
    setImageInfo(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Tech tags ────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (form.techStack.includes(t)) { setTagInput(""); return; }
    setForm(p => ({ ...p, techStack: [...p.techStack, t] }));
    setTagInput("");
    if (errors.techStack) setErrors(p => ({ ...p, techStack: "" }));
  };

  const removeTag = (tag) => {
    setForm(p => ({ ...p, techStack: p.techStack.filter(t => t !== tag) }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
    if (e.key === "Backspace" && !tagInput && form.techStack.length) {
      setForm(p => ({ ...p, techStack: p.techStack.slice(0, -1) }));
    }
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    if (Object.keys(v).length) { setErrors(v); return; }

    setSaving(true);
    try {
      const url    = editingId
        ? `http://localhost:5000/api/projects/${editingId}`
        : "http://localhost:5000/api/projects";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed."); }

      showFeedback("success", editingId ? "Project updated!" : "Project created!");
      setForm(EMPTY_FORM); setEditingId(null);
      setShowForm(false); setImagePreview(""); setTagInput(""); setImageInfo(null);
      fetchProjects();
    } catch (err) { showFeedback("error", err.message); }
    finally { setSaving(false); }
  };

  // ── Edit ─────────────────────────────────────────────────────
  const handleEdit = (p) => {
    setForm({
      title:      p.title       || "",
      description:p.description || "",
      techStack:  Array.isArray(p.techStack) ? p.techStack : [],
      githubLink: p.githubLink  || "",
      liveLink:   p.liveLink    || "",
      image:      p.image       || "",
      status:     p.status      || "completed",
    });
    setImagePreview(p.image || "");
    setImageInfo(null);
    setEditingId(p._id);
    setErrors({}); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Delete failed.");
      showFeedback("success", "Project deleted.");
      setProjects(p => p.filter(x => x._id !== id));
    } catch (err) { showFeedback("error", err.message); }
    finally { setDeletingId(null); }
  };

  // ── Status quick-change ──────────────────────────────────────
  const handleStatusChange = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "PUT", headers, body: JSON.stringify({ status }),
      });
      setProjects(prev => prev.map(p => p._id === id ? { ...p, status } : p));
      showFeedback("success", "Status updated.");
    } catch { showFeedback("error", "Status update failed."); }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM); setEditingId(null); setErrors({});
    setShowForm(false); setImagePreview(""); setTagInput(""); setImageInfo(null);
  };

  // ── Filter + search ──────────────────────────────────────────
  const filtered = projects.filter(p => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchSearch = p.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      (p.techStack || []).some(t => t.toLowerCase().includes(searchQ.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="pm-page">

      {/* ── Header ── */}
      <div className="pm-header">
        <div>
          <h2>Projects Manager</h2>
          <p>
            {projects.length} total ·{" "}
            {projects.filter(p => p.status === "completed").length} completed
          </p>
        </div>
        <button className="pm-add-btn" onClick={() => { handleCancel(); setShowForm(true); }}>
          <i className="fas fa-plus"></i> New Project
        </button>
      </div>

      {/* ── Feedback banner ── */}
      {feedback && (
        <div className={`pm-feedback ${feedback.type}`}>
          <i className={`fas fa-${feedback.type === "success" ? "check-circle" : "exclamation-circle"}`}></i>
          {feedback.msg}
        </div>
      )}

      {/* ── Form ── */}
      {showForm && (
        <div className="pm-form-card">
          <h3>{editingId ? "✏️ Edit Project" : "🚀 New Project"}</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="pm-form-grid">

              {/* Title */}
              <div className="pm-field">
                <label>Project Title *</label>
                <input type="text" name="title" placeholder="e.g. Portfolio Website"
                  value={form.title} onChange={handleChange}
                  className={errors.title ? "err" : ""} />
                {errors.title && <span className="err-msg">{errors.title}</span>}
              </div>

              {/* Status */}
              <div className="pm-field">
                <label>Status *</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="pm-field pm-field-full">
                <label>Description *</label>
                <textarea name="description" rows={4}
                  placeholder="Describe your project..."
                  value={form.description} onChange={handleChange}
                  className={errors.description ? "err" : ""} />
                {errors.description && <span className="err-msg">{errors.description}</span>}
              </div>

              {/* Tech tags */}
              <div className="pm-field pm-field-full">
                <label>Technology Stack *</label>
                <div className={`pm-tags-input ${errors.techStack ? "err" : ""}`}>
                  {form.techStack.map(tag => (
                    <span className="pm-tag" key={tag}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text" placeholder="Type tech and press Enter..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
                {errors.techStack && <span className="err-msg">{errors.techStack}</span>}
                <span className="pm-hint">Press Enter or comma to add a tag</span>
              </div>

              {/* Image upload */}
              <div className="pm-field pm-field-full">
                <label>Project Image</label>
                <div className="pm-image-section">

                  {/* Left: upload options */}
                  <div className="pm-image-inputs">
                    <div className="pm-file-drop" onClick={() => fileRef.current?.click()}>
                      <input ref={fileRef} type="file" accept="image/*"
                        onChange={handleImageFile} style={{ display: "none" }} />
                      {uploadingImage
                        ? <><i className="fas fa-spinner fa-spin"></i> Compressing image...</>
                        : <><i className="fas fa-cloud-upload-alt"></i> Click to upload &amp; compress<br />
                            <small>PNG, JPG up to 5MB · auto-compressed to WebP</small></>
                      }
                    </div>

                    {/* Compression stats badge */}
                    {imageInfo && (
                      <div className="pm-image-stats">
                        <span><i className="fas fa-file-image"></i> {imageInfo.original}</span>
                        <i className="fas fa-arrow-right"></i>
                        <span className="compressed"><i className="fas fa-compress-alt"></i> {imageInfo.compressed}</span>
                        <span className="saved">✅ {imageInfo.saved}</span>
                      </div>
                    )}

                    <div className="pm-or">— or paste image URL —</div>
                    <input
                      type="url" placeholder="https://example.com/image.png"
                      value={form.image.startsWith("data:") ? "" : form.image}
                      onChange={handleImageUrl}
                      className="pm-url-input"
                    />
                  </div>

                  {/* Right: preview */}
                  <div className="pm-image-preview">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="preview" />
                        <button type="button" className="pm-clear-img" onClick={clearImage}>
                          <i className="fas fa-trash"></i> Remove
                        </button>
                      </>
                    ) : (
                      <div className="pm-no-image">
                        <i className="fas fa-image"></i>
                        <span>No image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="pm-field">
                <label><i className="fab fa-github"></i> GitHub URL</label>
                <input type="url" name="githubLink"
                  placeholder="https://github.com/user/repo"
                  value={form.githubLink} onChange={handleChange} />
              </div>
              <div className="pm-field">
                <label><i className="fas fa-external-link-alt"></i> Live Demo URL</label>
                <input type="url" name="liveLink"
                  placeholder="https://yourproject.com"
                  value={form.liveLink} onChange={handleChange} />
              </div>
            </div>

            <div className="pm-form-actions">
              <button type="submit" className="pm-save-btn" disabled={saving}>
                {saving
                  ? <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  : <><i className="fas fa-check"></i> {editingId ? "Update Project" : "Create Project"}</>
                }
              </button>
              <button type="button" className="pm-cancel-btn" onClick={handleCancel}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="pm-filters">
        <div className="pm-search-wrap">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search projects or tech..."
            value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          {searchQ && (
            <button onClick={() => setSearchQ("")}><i className="fas fa-times"></i></button>
          )}
        </div>
        <div className="pm-status-filters">
          {["all", ...STATUSES].map(s => (
            <button key={s}
              className={`pm-filter-btn ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}>
              {s === "all" ? "All" : STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects list ── */}
      {loading ? (
        <div className="pm-loading"><i className="fas fa-spinner fa-spin"></i> Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="pm-empty">
          <i className="fas fa-code-branch"></i>
          <p>
            {searchQ || filterStatus !== "all"
              ? "No projects match your filter."
              : 'No projects yet. Click "New Project" to get started.'}
          </p>
        </div>
      ) : (
        <div className="pm-list">
          {filtered.map((project, idx) => {
            const sm = STATUS_META[project.status] || STATUS_META.completed;
            return (
              <div className="pm-project-row" key={project._id}
                style={{ animationDelay: `${idx * 60}ms` }}>

                {/* Thumbnail */}
                <div className="pm-thumb">
                  {project.image
                    ? <img src={project.image} alt={project.title} />
                    : <div className="pm-thumb-placeholder"><i className="fas fa-code"></i></div>
                  }
                </div>

                {/* Info */}
                <div className="pm-project-info">
                  <div className="pm-project-title-row">
                    <h4>{project.title}</h4>
                    <select
                      className="pm-status-select"
                      value={project.status || "completed"}
                      style={{ background: sm.bg, color: sm.color, borderColor: sm.color }}
                      onChange={e => handleStatusChange(project._id, e.target.value)}>
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                  </div>

                  <p className="pm-project-desc">
                    {project.description?.slice(0, 100)}
                    {project.description?.length > 100 ? "..." : ""}
                  </p>

                  <div className="pm-project-tags">
                    {(project.techStack || []).map(t => (
                      <span className="pm-project-tag" key={t}>{t}</span>
                    ))}
                  </div>

                  <div className="pm-project-links">
                    {project.githubLink && (
                      <a href={project.githubLink} target="_blank" rel="noreferrer" className="pm-link-btn git">
                        <i className="fab fa-github"></i> GitHub
                      </a>
                    )}
                    {project.liveLink && (
                      <a href={project.liveLink} target="_blank" rel="noreferrer" className="pm-link-btn live">
                        <i className="fas fa-external-link-alt"></i> Live
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pm-project-actions">
                  <button className="pm-edit-btn" onClick={() => handleEdit(project)} title="Edit">
                    <i className="fas fa-pen"></i>
                  </button>
                  <button className="pm-del-btn"
                    onClick={() => handleDelete(project._id)}
                    disabled={deletingId === project._id} title="Delete">
                    {deletingId === project._id
                      ? <i className="fas fa-spinner fa-spin"></i>
                      : <i className="fas fa-trash"></i>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}