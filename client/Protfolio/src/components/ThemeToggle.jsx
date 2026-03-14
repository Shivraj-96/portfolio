import { useEffect, useState } from "react";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    // 2. Fall back to OS preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply theme to <html> element on every change
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Listen for OS preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem("theme")) setDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <button
      className={`theme-toggle ${dark ? "is-dark" : "is-light"}`}
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
        <i className="fa-solid fa-circle-half-stroke" style={{ fontSize: "28px" }}></i>
    </button>
  );
}