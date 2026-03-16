import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import "./Contact.css";

const INITIAL = { name: "", email: "", subject: "", message: "" };

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── THIS IS THE ONLY PLACE validate() should be ──────────────────
function validate(fields) {
  const errors = {};
  if (!fields.name.trim())                    errors.name    = "Name is required.";
  if (!fields.email.trim())                   errors.email   = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                              errors.email   = "Enter a valid email.";
  if (!fields.subject.trim())                 errors.subject = "Subject is required.";
  if (!fields.message.trim())                 errors.message = "Message is required.";
  else if (fields.message.trim().length < 10) errors.message = "Message too short (min 10 chars).";
  return errors;
}

export default function Contact() {
  const [form, setForm]                     = useState(INITIAL);
  const [errors, setErrors]                 = useState({});
  const [captchaToken, setCaptchaToken]     = useState(null);
  const [status, setStatus]                 = useState(null);
  const captchaRef                          = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!captchaToken) {
      setErrors((prev) => ({ ...prev, captcha: "Please complete the CAPTCHA." }));
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setForm(INITIAL);
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      } else {
        throw new Error(data.error || "Something went wrong.");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-heading">
        <h2>Contact Me</h2>
        <p>Let's work together</p>
        <div className="heading-line" />
      </div>

      <div className="contact-wrapper">
        {/* Info panel */}
        <div className="contact-info">
          <h3>Get In Touch</h3>
          <p>Have a project in mind or just want to say hi? Fill out the form and I'll get back to you as soon as possible.</p>

          <div className="info-item">
            <i className="fas fa-envelope"></i>
            <span>shivraj@example.com</span>
          </div>
          <div className="info-item">
            <i className="fas fa-phone"></i>
            <span>+91-XXXXXXXXXX</span>
          </div>
          <div className="info-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>India</span>
          </div>

          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noreferrer"><i className="fab fa-github"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><i className="fab fa-twitter"></i></a>
          </div>
        </div>

        {/* Form panel */}
        <form className="contact-form" onSubmit={handleSubmit} noValidate>

          {status === "success" && (
            <div className="feedback success">
              <i className="fas fa-check-circle"></i> Message sent! I'll get back to you soon.
            </div>
          )}
          {status === "error" && (
            <div className="feedback error">
              <i className="fas fa-exclamation-circle"></i> Something went wrong. Please try again.
            </div>
          )}

          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" placeholder="Shivraj Shinde"
              value={form.name} onChange={handleChange}
              className={errors.name ? "input-error" : ""} />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="shivraj@example.com"
              value={form.email} onChange={handleChange}
              className={errors.email ? "input-error" : ""} />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input type="text" name="subject" placeholder="Project Inquiry"
              value={form.subject} onChange={handleChange}
              className={errors.subject ? "input-error" : ""} />
            {errors.subject && <span className="error-msg">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea name="message" rows={5} placeholder="Tell me about your project..."
              value={form.message} onChange={handleChange}
              className={errors.message ? "input-error" : ""} />
            {errors.message && <span className="error-msg">{errors.message}</span>}
          </div>

          {/* hCaptcha — ONLY here inside return(), nowhere else */}
          <div className="form-group">
            <HCaptcha
              sitekey="d5ca9320-1e48-4d30-b028-410e6c82f678"
              onVerify={(token) => {
                setCaptchaToken(token);
                setErrors((prev) => ({ ...prev, captcha: "" }));
              }}
              onExpire={() => setCaptchaToken(null)}
              ref={captchaRef}
            />
            {errors.captcha && <span className="error-msg">{errors.captcha}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={status === "loading"}>
            {status === "loading"
              ? <><i className="fas fa-spinner fa-spin"></i> Sending...</>
              : <><i className="fas fa-paper-plane"></i> Send Message</>
            }
          </button>

        </form>
      </div>
    </section>
  );
}