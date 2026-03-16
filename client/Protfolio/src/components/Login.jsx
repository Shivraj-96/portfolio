import { useState } from 'react';
import './Login.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  const validate = () => {
    const e = {};
    if (isRegister && !form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim())    e.email    = 'Email is required.';
    if (!form.password.trim()) e.password = 'Password is required.';
    if (form.password.length < 6) e.password = 'Minimum 6 characters.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setStatus('loading'); setErrMsg('');
    try {
      const endpoint = isRegister ? 'register' : 'login';
      const res  = await fetch(`${API}/api/auth/${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      setStatus(null);
      if (onLogin) onLogin(data.user, data.token);
    } catch (err) {
      setErrMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-avatar"><i className="fas fa-user"></i></div>
          <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{isRegister ? 'Sign up to access your portfolio' : 'Sign in to your portfolio'}</p>
        </div>

        {status === 'error' && (
          <div className="login-error">
            <i className="fas fa-exclamation-triangle"></i> {errMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div className="login-field">
              <label>Full Name</label>
              <div className="login-input-wrap">
                <i className="fas fa-user"></i>
                <input type="text" name="name" placeholder="Shivraj Shinde"
                  value={form.name} onChange={handleChange}
                  className={errors.name ? 'err' : ''} />
              </div>
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </div>
          )}

          <div className="login-field">
            <label>Email Address</label>
            <div className="login-input-wrap">
              <i className="fas fa-envelope"></i>
              <input type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                className={errors.email ? 'err' : ''} />
            </div>
            {errors.email && <span className="err-msg">{errors.email}</span>}
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input-wrap">
              <i className="fas fa-lock"></i>
              <input type="password" name="password" placeholder="••••••••"
                value={form.password} onChange={handleChange}
                className={errors.password ? 'err' : ''} />
            </div>
            {errors.password && <span className="err-msg">{errors.password}</span>}
          </div>

          <button type="submit" className="login-btn" disabled={status === 'loading'}>
            {status === 'loading'
              ? <><i className="fas fa-spinner fa-spin"></i> Please wait...</>
              : <><i className={`fas fa-${isRegister ? 'user-plus' : 'sign-in-alt'}`}></i>
                  {isRegister ? 'Create Account' : 'Sign In'}</>
            }
          </button>
        </form>

        <p className="login-toggle">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => { setIsRegister(!isRegister); setErrors({}); setErrMsg(''); }}>
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}