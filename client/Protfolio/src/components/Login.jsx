import { useState } from "react";
import "./Login.css";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm]             = useState({ name: "", email: "", password: "" });
  const [errors, setErrors]         = useState({});
  const [status, setStatus]         = useState(null); // "loading" | "error"
  const [errorMsg, setErrorMsg]     = useState("");

  const validate = () => {
    const e = {};
    if (isRegister && !form.name.trim())  e.name     = "Name is required.";
    if (!form.email.trim())               e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email.";
    if (!form.password)                   e.password = "Password is required.";
    else if (form.password.length < 6)    e.password = "Min 6 characters.";
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
    setErrorMsg("");

    const endpoint = isRegister
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    try {
      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      // Save token to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));

      setStatus(null);
      if (onLogin) onLogin(data.user);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">

        {/* Logo / Title */}
        <div className="auth-header">
          <div className="auth-logo"><i className="fas fa-code"></i></div>
          <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
          <p>{isRegister ? "Register to manage your portfolio" : "Login to your portfolio dashboard"}</p>
        </div>

        {/* Error banner */}
        {status === "error" && (
          <div className="auth-error">
            <i className="fas fa-exclamation-circle"></i> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Name — register only */}
          {isRegister && (
            <div className="auth-group">
              <label>Full Name</label>
              <div className="input-wrap">
                <i className="fas fa-user"></i>
                <input
                  type="text" name="name"
                  placeholder="Shivraj Shinde"
                  value={form.name} onChange={handleChange}
                  className={errors.name ? "err" : ""}
                />
              </div>
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </div>
          )}

          {/* Email */}
          <div className="auth-group">
            <label>Email</label>
            <div className="input-wrap">
              <i className="fas fa-envelope"></i>
              <input
                type="email" name="email"
                placeholder="shivraj@example.com"
                value={form.email} onChange={handleChange}
                className={errors.email ? "err" : ""}
              />
            </div>
            {errors.email && <span className="err-msg">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="auth-group">
            <label>Password</label>
            <div className="input-wrap">
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

          {/* Submit */}
          <button type="submit" className="auth-btn" disabled={status === "loading"}>
            {status === "loading"
              ? <><i className="fas fa-spinner fa-spin"></i> Please wait...</>
              : isRegister ? "Create Account" : "Login"
            }
          </button>
        </form>

        {/* Toggle register / login */}
        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button onClick={() => { setIsRegister(!isRegister); setErrors({}); setErrorMsg(""); }}>
            {isRegister ? " Login" : " Register"}
          </button>
        </p>

      </div>
    </div>
  );
}