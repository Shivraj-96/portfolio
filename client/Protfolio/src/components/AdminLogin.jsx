import { useState } from "react";
import "./AdminLogin.css";

export default function AdminLogin({ onLogin }) {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = "Email is required.";
    if (!form.password.trim()) e.password = "Password is required.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setStatus("loading");
    setErrMsg("");

    try {
      const res  = await fetch("http://localhost:5000/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");

      // Only allow admin role
      if (data.user.role !== "admin") {
        throw new Error("Access denied. Admins only.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      setStatus(null);
      if (onLogin) onLogin(data.user, data.token);
    } catch (err) {
      setErrMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="admin-login-page">
      {/* Left decorative panel */}
      <div className="admin-login-left">
        <div className="admin-brand">
          <div className="admin-brand-icon"><i className="fas fa-shield-alt"></i></div>
          <h1>Portfolio<span>Admin</span></h1>
        </div>
        <p className="admin-brand-desc">
          Manage your portfolio content, skills, projects, and messages from one place.
        </p>
        <div className="admin-login-dots">
          {[...Array(12)].map((_, i) => <span key={i} className="dot" style={{ animationDelay: `${i * 0.15}s` }} />)}
        </div>
      </div>

      {/* Right form panel */}
      <div className="admin-login-right">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-avatar"><i className="fas fa-user-shield"></i></div>
            <h2>Admin Login</h2>
            <p>Sign in to your dashboard</p>
          </div>

          {status === "error" && (
            <div className="admin-error">
              <i className="fas fa-exclamation-triangle"></i> {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="admin-field">
              <label>Email Address</label>
              <div className="admin-input-wrap">
                <i className="fas fa-envelope"></i>
                <input
                  type="email" name="email"
                  placeholder="admin@portfolio.com"
                  value={form.email} onChange={handleChange}
                  className={errors.email ? "err" : ""}
                />
              </div>
              {errors.email && <span className="err-msg">{errors.email}</span>}
            </div>

            <div className="admin-field">
              <label>Password</label>
              <div className="admin-input-wrap">
                <i className="fas fa-lock"></i>
                <input
                  type="password" name="password"
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  className={errors.password ? "err" : ""}
                />
              </div>
              {errors.password && <span className="err-msg">{errors.password}</span>}
            </div>

            <button type="submit" className="admin-login-btn" disabled={status === "loading"}>
              {status === "loading"
                ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                : <><i className="fas fa-sign-in-alt"></i> Sign In</>
              }
            </button>
          </form>

          <p className="admin-back">
            <a href="/"><i className="fas fa-arrow-left"></i> Back to Portfolio</a>
          </p>
        </div>
      </div>
    </div>
  );
}