// src/ProjectModal.jsx
import React, { useEffect } from 'react';
import { X, Github, ExternalLink, CheckCircle } from 'lucide-react';
import { sounds } from './soundEffects';
import './ProjectModal.css';

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;
  const Icon = project.icon;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close project modal"
        >
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-badge-row">
            <span className="modal-category">{project.category}</span>
          </div>
          <div className="modal-title-row">
            <div className="modal-icon">
              <Icon size={28} />
            </div>
            <div>
              <h2 id="modal-project-title" className="modal-title">{project.title}</h2>
              <p className="modal-subtitle">{project.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <p className="modal-description">{project.description}</p>

          <h3 className="modal-section-title">Key Architecture &amp; Features</h3>
          <ul className="modal-features-list">
            {project.features.map((feat, i) => (
              <li key={i}>
                <CheckCircle size={16} className="feature-icon" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <h3 className="modal-section-title">Technical Toolkit</h3>
          <div className="modal-tech-list">
            {project.tech.map((t) => (
              <span key={t} className="tech-tag">{t}</span>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="btn-modal-primary"
            onClick={() => sounds.playSoftClick()}
          >
            <Github size={16} /> View on GitHub
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="btn-modal-secondary"
              onClick={() => sounds.playSoftClick()}
            >
              <ExternalLink size={16} /> Open Live App
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
