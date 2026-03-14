import { useState, useEffect } from "react";
import "./SkillsManager.css";

const CATEGORIES = ["Frontend", "Backend", "Database", "Tools", "Other"];
const EMPTY_FORM  = { name: "", icon: "fas fa-code", category: "Frontend", level: 50 };

const ICON_SUGGESTIONS = [
  { label: "JavaScript",  value: "fab fa-js" },
  { label: "React",       value: "fab fa-react" },
  { label: "HTML",        value: "fab fa-html5" },
  { label: "CSS",         value: "fab fa-css3-alt" },
  { label: "Node.js",     value: "fab fa-node" },
  { label: "Python",      value: "fab fa-python" },
  { label: "Git",         value: "fab fa-git-alt" },
  { label: "Docker",      value: "fab fa-docker" },
  { label: "AWS",         value: "fab fa-aws" },
  { label: "Database",    value: "fas fa-database" },
  { label: "Code",        value: "fas fa-code" },
  { label: "Server",      value: "fas fa-server" },
];

const CATEGORY_META = {
  Frontend: { color: "#0284c7", bg: "#e0f2fe", icon: "fas fa-desktop" },
  Backend:  { color: "#16a34a", bg: "#dcfce7", icon: "fas fa-server" },
  Database: { color: "#ca8a04", bg: "#fef9c3", icon: "fas fa-database" },
  Tools:    { color: "#9333ea", bg: "#f3e8ff", icon: "fas fa-tools" },
  Other:    { color: "#64748b", bg: "#f1f5f9", icon: "fas fa-star" },
};

function validate(form) {
  const errors = {};
  if (!form.name.trim())          errors.name  = "Skill name is required.";
  if (!form.icon.trim())          errors.icon  = "Icon class is required.";
  if (!form.category)             errors.category = "Select a category.";
  if (form.level < 1 || form.level > 100)
                                  errors.level = "Level must be between 1 and 100.";
  return errors;
}

export default function SkillsManager() {
  const [skills, setSkills]       = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback]   = useState(null); // {type, msg}
  const [showForm, setShowForm]   = useState(false);
  const [searchQ, setSearchQ]     = useState("");

  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  // ── Fetch all skills ─────────────────────────────────────────
  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/skills");
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch {
      showFeedback("error", "Failed to load skills.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSkills(); }, []);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  // ── Handle form input ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "level" ? Number(value) : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── Submit: Add or Update ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    if (Object.keys(v).length) { setErrors(v); return; }

    setSaving(true);
    try {
      let res;
      if (editingId) {
        // UPDATE
        res = await fetch(`http://localhost:5000/api/skills/${editingId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(form),
        });
      } else {
        // CREATE
        res = await fetch("http://localhost:5000/api/skills", {
          method: "POST",
          headers,
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Save failed.");
      }

      showFeedback("success", editingId ? "Skill updated!" : "Skill added!");
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      fetchSkills();
    } catch (err) {
      showFeedback("error", err.message);
    } finally { setSaving(false); }
  };

  // ── Edit ─────────────────────────────────────────────────────
  const handleEdit = (skill) => {
    setForm({
      name:     skill.name,
      icon:     skill.icon || "fas fa-code",
      category: skill.category,
      level:    skill.level || skill.proficiency || 50,
    });
    setEditingId(skill._id);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/skills/${id}`, {
        method: "DELETE", headers,
      });
      if (!res.ok) throw new Error("Delete failed.");
      showFeedback("success", "Skill deleted.");
      setSkills((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      showFeedback("error", err.message);
    } finally { setDeletingId(null); }
  };

  // ── Cancel edit ──────────────────────────────────────────────
  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  // ── Filter + group by category ───────────────────────────────
  const filtered = skills.filter((s) =>
    s.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQ.toLowerCase())
  );

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter((s) => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  // Other/unknown categories
  const knownCats = new Set(CATEGORIES);
  const others = filtered.filter((s) => !knownCats.has(s.category));
  if (others.length) grouped["Other"] = others;

  return (
    <div className="sm-page">

      {/* ── Page header ── */}
      <div className="sm-header">
        <div>
          <h2>Skills Manager</h2>
          <p>{skills.length} skills across {Object.keys(grouped).length} categories</p>
        </div>
        <button className="sm-add-btn" onClick={() => { handleCancel(); setShowForm(true); }}>
          <i className="fas fa-plus"></i> Add Skill
        </button>
      </div>

      {/* ── Feedback banner ── */}
      {feedback && (
        <div className={`sm-feedback ${feedback.type}`}>
          <i className={`fas fa-${feedback.type === "success" ? "check-circle" : "exclamation-circle"}`}></i>
          {feedback.msg}
        </div>
      )}

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div className="sm-form-card">
          <h3>{editingId ? "✏️ Edit Skill" : "➕ Add New Skill"}</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="sm-form-grid">

              {/* Name */}
              <div className="sm-field">
                <label>Skill Name *</label>
                <input
                  type="text" name="name"
                  placeholder="e.g. React"
                  value={form.name} onChange={handleChange}
                  className={errors.name ? "err" : ""}
                />
                {errors.name && <span className="err-msg">{errors.name}</span>}
              </div>

              {/* Category */}
              <div className="sm-field">
                <label>Category *</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className={errors.category ? "err" : ""}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className="err-msg">{errors.category}</span>}
              </div>

              {/* Icon */}
              <div className="sm-field sm-field-full">
                <label>Font Awesome Icon Class *</label>
                <div className="sm-icon-row">
                  <input
                    type="text" name="icon"
                    placeholder="e.g. fab fa-react"
                    value={form.icon} onChange={handleChange}
                    className={errors.icon ? "err" : ""}
                  />
                  <div className="sm-icon-preview">
                    <i className={form.icon}></i>
                  </div>
                </div>
                {errors.icon && <span className="err-msg">{errors.icon}</span>}
                {/* Quick icon picker */}
                <div className="sm-icon-suggestions">
                  {ICON_SUGGESTIONS.map((s) => (
                    <button type="button" key={s.value}
                      className={`sm-icon-chip ${form.icon === s.value ? "selected" : ""}`}
                      onClick={() => { setForm((p) => ({ ...p, icon: s.value })); }}>
                      <i className={s.value}></i> {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level slider */}
              <div className="sm-field sm-field-full">
                <label>Proficiency Level: <strong>{form.level}%</strong></label>
                <input
                  type="range" name="level"
                  min="1" max="100" step="1"
                  value={form.level} onChange={handleChange}
                  className="sm-slider"
                />
                {/* Visual bar preview */}
                <div className="sm-level-preview">
                  <div className="sm-level-track">
                    <div className="sm-level-fill" style={{ width: `${form.level}%` }} />
                  </div>
                  <div className="sm-level-labels">
                    <span>Beginner</span><span>Intermediate</span><span>Advanced</span><span>Expert</span>
                  </div>
                </div>
                {errors.level && <span className="err-msg">{errors.level}</span>}
              </div>
            </div>

            <div className="sm-form-actions">
              <button type="submit" className="sm-save-btn" disabled={saving}>
                {saving
                  ? <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  : <><i className="fas fa-check"></i> {editingId ? "Update Skill" : "Add Skill"}</>
                }
              </button>
              <button type="button" className="sm-cancel-btn" onClick={handleCancel}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Search ── */}
      <div className="sm-search-wrap">
        <i className="fas fa-search"></i>
        <input
          type="text" placeholder="Search skills or categories..."
          value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
        />
        {searchQ && (
          <button onClick={() => setSearchQ("")}><i className="fas fa-times"></i></button>
        )}
      </div>

      {/* ── Skills grouped by category ── */}
      {loading ? (
        <div className="sm-loading"><i className="fas fa-spinner fa-spin"></i> Loading skills...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="sm-empty">
          <i className="fas fa-bolt"></i>
          <p>{searchQ ? "No skills match your search." : "No skills yet. Click \"Add Skill\" to get started."}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => {
          const meta = CATEGORY_META[cat] || CATEGORY_META.Other;
          return (
            <div className="sm-category-group" key={cat}>
              {/* Category header */}
              <div className="sm-cat-header">
                <div className="sm-cat-icon" style={{ background: meta.bg, color: meta.color }}>
                  <i className={meta.icon}></i>
                </div>
                <h3 style={{ color: meta.color }}>{cat}</h3>
                <span className="sm-cat-count">{items.length} skill{items.length > 1 ? "s" : ""}</span>
              </div>

              {/* Skills list */}
              <div className="sm-skills-list">
                {items.map((skill) => {
                  const lvl = skill.level || skill.proficiency || 0;
                  return (
                    <div className="sm-skill-row" key={skill._id}>
                      {/* Icon + name */}
                      <div className="sm-skill-identity">
                        <div className="sm-skill-icon" style={{ background: meta.bg, color: meta.color }}>
                          <i className={skill.icon || "fas fa-code"}></i>
                        </div>
                        <span className="sm-skill-name">{skill.name}</span>
                      </div>

                      {/* Proficiency bar */}
                      <div className="sm-skill-bar-wrap">
                        <div className="sm-skill-track">
                          <div
                            className="sm-skill-fill"
                            style={{ width: `${lvl}%`, background: meta.color }}
                          />
                        </div>
                        <span className="sm-skill-pct" style={{ color: meta.color }}>{lvl}%</span>
                      </div>

                      {/* Actions */}
                      <div className="sm-skill-actions">
                        <button className="sm-edit-btn" onClick={() => handleEdit(skill)} title="Edit">
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          className="sm-del-btn"
                          onClick={() => handleDelete(skill._id)}
                          disabled={deletingId === skill._id}
                          title="Delete"
                        >
                          {deletingId === skill._id
                            ? <i className="fas fa-spinner fa-spin"></i>
                            : <i className="fas fa-trash"></i>
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}