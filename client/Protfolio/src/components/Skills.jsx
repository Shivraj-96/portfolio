import { useState, useEffect, useRef } from "react";

const CATEGORIES = ["All", "Frontend", "Backend", "Database"];

export default function Skills({ skills = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef(null);

  // Filter client-side from props passed by App.jsx
  const filtered =
    activeCategory === "All"
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  // Re-trigger bar animation when category changes
  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, [activeCategory]);

  // Animate on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="skills-section" id="skills">

      <div className="skills-heading">
        <h2>My Skills</h2>
        <p>Technologies I work with</p>
        <div className="heading-line" />
      </div>

      {/* Category Filter */}
      <div className="filter-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="skills-grid">
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94a3b8", gridColumn: "1/-1" }}>
            No skills found.
          </p>
        ) : (
          filtered.map((skill, index) => (
            <div
              className="skill-card"
              key={skill._id}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="skill-header">
                <div className="skill-icon">
                  <i className={skill.icon}></i>
                </div>
                <div className="skill-meta">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-category">{skill.category}</span>
                </div>
                <span className="skill-percent">{skill.level}%</span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{
                    width: animated ? `${skill.level}%` : "0%",
                    transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
