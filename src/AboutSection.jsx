// src/AboutSection.jsx
import React from 'react';
import { Code, Terminal, Layers, Sparkles, FileText, Send } from 'lucide-react';
import { sounds } from './soundEffects';
import useScrollReveal from './useScrollReveal';
import './AboutSection.css';

export const SKILLS = [
  {
    category: 'Languages',
    icon: Code,
    items: ['TypeScript', 'JavaScript (ES6+)', 'Python 3', 'C++', 'HTML5 / CSS3']
  },
  {
    category: 'Frameworks & Libraries',
    icon: Layers,
    items: ['React 18 / 19', 'Tailwind CSS', 'Vite', 'Lucide React', 'Supabase Client']
  },
  {
    category: 'Engineering & Methodologies',
    icon: Terminal,
    items: ['Test-Driven Development (TDD)', 'Pytest Unit Testing', 'REST APIs', 'Git & GitHub', 'Data Structures']
  }
];

export default function AboutSection({ onOpenResume, onOpenContact }) {
  const sectionRef = useScrollReveal();

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      <div className="section-container">
        <div className="about-grid">
          {/* Left Column: Narrative */}
          <div className="about-story">
            <span className="section-badge">
              <Sparkles size={14} /> Philosophy &amp; Background
            </span>
            <h2 className="about-title">ENGINEERING WITH EMPATHY &amp; PRECISION</h2>
            
            <p className="about-lead">
              I am a Software Engineer and Creative Developer passionate about the intersection of elegant visual interfaces, clean algorithmic code, and human-centric software.
            </p>
            
            <p className="about-body">
              Whether building full-stack applications with TypeScript and Supabase, crafting algorithmic reports in Python, or designing 60 FPS interactive visual physics on the canvas, I strive for clean architecture, rigorous testing, and delightful user experiences.
            </p>

            <div className="about-actions">
              <button
                className="btn-hero-primary"
                onClick={() => {
                  sounds.playChime();
                  onOpenResume && onOpenResume();
                }}
              >
                <FileText size={16} /> View Curriculum Vitae
              </button>
              <button
                className="btn-hero-secondary"
                onClick={() => {
                  sounds.playChime();
                  onOpenContact && onOpenContact();
                }}
              >
                <Send size={16} /> Get in Touch
              </button>
            </div>
          </div>

          {/* Right Column: Technical Toolkit */}
          <div className="about-skills">
            <h3 className="skills-headline">TECHNICAL TOOLKIT</h3>
            <div className="skills-cards">
              {SKILLS.map((grp) => {
                const Icon = grp.icon;
                return (
                  <div key={grp.category} className="skill-card">
                    <div className="skill-header">
                      <Icon size={20} className="skill-icon" />
                      <h4>{grp.category}</h4>
                    </div>
                    <div className="skill-pills">
                      {grp.items.map((item) => (
                        <span key={item} className="skill-pill">{item}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
