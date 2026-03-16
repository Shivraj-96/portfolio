import { useState, useEffect } from "react";
import "./AdminDashboard.css";
import SkillsManager    from "./SkillsManager";
import ProjectsManager  from "./ProjectsManager";

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NAV_ITEMS = [
  { id: "overview",  label: "Overview",  icon: "fas fa-chart-pie" },
  { id: "projects",  label: "Projects",  icon: "fas fa-code-branch" },
  { id: "skills",    label: "Skills",    icon: "fas fa-bolt" },
  { id: "messages",  label: "Messages",  icon: "fas fa-envelope" },
  { id: "profile",   label: "Profile",   icon: "fas fa-user" },
];

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebar] = useState(true);
  const [stats, setStats]         = useState({ projects: 0, skills: 0, messages: 0, users: 1 });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token   = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [projRes, skillRes] = await Promise.all([
          fetch(`${API}/api/projects`, { headers }).then(r => r.json()),
          fetch(`${API}/api/skills`,   { headers }).then(r => r.json()),
        ]);
        const proj  = Array.isArray(projRes)  ? projRes  : [];
        const skill = Array.isArray(skillRes) ? skillRes : [];
        setStats({ projects: proj.length, skills: skill.length, messages: 0, users: 1 });
      } catch (err) { console.error("Dashboard fetch error:", err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const STAT_CARDS = [
    { label: "Total Projects", value: stats.projects, icon: "fas fa-code-branch", color: "#6366f1", bg: "#eef2ff" },
    { label: "Skills Listed",  value: stats.skills,   icon: "fas fa-bolt",        color: "#0284c7", bg: "#e0f2fe" },
    { label: "Messages",       value: stats.messages, icon: "fas fa-envelope",    color: "#16a34a", bg: "#dcfce7" },
    { label: "Admin Users",    value: stats.users,    icon: "fas fa-users",       color: "#9333ea", bg: "#f3e8ff" },
  ];

  return (
    <div className={`admin-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-shield-alt"></i>
            {sidebarOpen && <span>Admin<b>Panel</b></span>}
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              title={!sidebarOpen ? item.label : ""}>
              <i className={item.icon}></i>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-item logout-btn" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="toggle-btn" onClick={() => setSidebar(!sidebarOpen)}>
              <i className={`fas fa-${sidebarOpen ? "times" : "bars"}`}></i>
            </button>
            <h2 className="topbar-title">
              {NAV_ITEMS.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          <div className="topbar-right">
            <div className="admin-user-badge">
              <div className="admin-user-avatar">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{user?.name || "Admin"}</span>
                <span className="admin-user-role">Administrator</span>
              </div>
            </div>
            <button className="topbar-logout" onClick={onLogout} title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>

        <main className="admin-content">
          {loading ? (
            <div className="admin-loading">
              <i className="fas fa-spinner fa-spin"></i> Loading dashboard...
            </div>
          ) : (
            <>
              {/* Overview */}
              {activeTab === "overview" && (
                <div className="tab-content">
                  <p className="welcome-msg">Welcome back, <strong>{user?.name}</strong> 👋</p>
                  <div className="stats-grid">
                    {STAT_CARDS.map((card, i) => (
                      <div className="stat-card" key={card.label} style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                          <i className={card.icon}></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-value">{card.value}</span>
                          <span className="stat-label">{card.label}</span>
                        </div>
                        <div className="stat-bar" style={{ background: card.bg }}>
                          <div className="stat-bar-fill" style={{ background: card.color, width: `${Math.min(card.value * 10, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                      {[
                        { label: "Add Project",   icon: "fas fa-plus",      tab: "projects", color: "#6366f1" },
                        { label: "Add Skill",     icon: "fas fa-bolt",      tab: "skills",   color: "#0284c7" },
                        { label: "View Messages", icon: "fas fa-envelope",  tab: "messages", color: "#16a34a" },
                        { label: "Edit Profile",  icon: "fas fa-user-edit", tab: "profile",  color: "#9333ea" },
                      ].map(a => (
                        <button key={a.label} className="action-card"
                          onClick={() => setActiveTab(a.tab)} style={{ "--ac": a.color }}>
                          <i className={a.icon}></i>
                          <span>{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "projects"  && <ProjectsManager />}
              {activeTab === "skills"    && <SkillsManager />}

              {activeTab === "messages" && (
                <div className="tab-content">
                  <div className="empty-state">
                    <i className="fas fa-envelope-open"></i>
                    <p>No messages yet.</p>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="tab-content">
                  <div className="profile-card">
                    <div className="profile-avatar-lg">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="profile-details">
                      <h3>{user?.name}</h3>
                      <p>{user?.email}</p>
                      <span className="role-badge">{user?.role}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}