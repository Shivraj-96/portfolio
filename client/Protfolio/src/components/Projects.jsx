import { useState, useEffect } from "react";
import "./Projects.css";

export default function Projects({ projects = [] }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  // Build filter tags from actual project data
  const allTechs = ["All", ...new Set(projects.flatMap((p) => p.techStack || []))];

  // Filter projects by selected technology
  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.techStack?.includes(activeFilter));

  // Close modal on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setSelectedProject(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedProject ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedProject]);

  return (
    <section className="projects-section" id="projects">
      <div className="projects-heading">
        <h2>My Projects</h2>
        <p>Things I've built</p>
        <div className="heading-line" />
      </div>

      {/* ── Filter by technology ── */}
      <div className="filter-tabs">
        {allTechs.map((tech) => (
          <button
            key={tech}
            className={`filter-btn ${activeFilter === tech ? "active" : ""}`}
            onClick={() => setActiveFilter(tech)}
          >
            {tech}
          </button>
        ))}
      </div>

      {/* ── Projects Grid ── */}
      <div className="projects-grid">
        {filtered.length === 0 ? (
          <p className="no-projects">No projects found for this technology.</p>
        ) : (
          filtered.map((project, index) => (
            <div
              className="project-card"
              key={project._id}
              style={{ animationDelay: `${index * 80}ms` }}
              onClick={() => setSelectedProject(project)}
            >
              {/* Project Image */}
              <div className="project-image">
                {project.image ? (
                  <img src={project.image} alt={project.title} />
                ) : (
                  <div className="project-placeholder">
                    <i className="fas fa-code"></i>
                  </div>
                )}
                <div className="project-overlay">
                  <span>View Details</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="project-body">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">
                  {project.description?.length > 100
                    ? project.description.slice(0, 100) + "..."
                    : project.description}
                </p>

                {/* Tech Stack badges */}
                <div className="tech-stack">
                  {(project.techStack || []).map((tech) => (
                    <span key={tech} className="tech-badge">{tech}</span>
                  ))}
                </div>

                {/* Links */}
                <div className="project-links" onClick={(e) => e.stopPropagation()}>
                  {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noreferrer" className="btn-live">
                      <i className="fas fa-external-link-alt"></i> Live Demo
                    </a>
                  )}
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn-github">
                      <i className="fab fa-github"></i> GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal ── */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProject(null)}>
              <i className="fas fa-times"></i>
            </button>

            {selectedProject.image && (
              <img src={selectedProject.image} alt={selectedProject.title} className="modal-image" />
            )}

            <div className="modal-content">
              <h2>{selectedProject.title}</h2>
              <p>{selectedProject.description}</p>

              <div className="tech-stack" style={{ marginBottom: "20px" }}>
                {(selectedProject.techStack || []).map((tech) => (
                  <span key={tech} className="tech-badge">{tech}</span>
                ))}
              </div>

              <div className="project-links">
                {selectedProject.liveLink && (
                  <a href={selectedProject.liveLink} target="_blank" rel="noreferrer" className="btn-live">
                    <i className="fas fa-external-link-alt"></i> Live Demo
                  </a>
                )}
                {selectedProject.githubLink && (
                  <a href={selectedProject.githubLink} target="_blank" rel="noreferrer" className="btn-github">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}