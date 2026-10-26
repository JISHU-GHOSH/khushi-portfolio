import React, { useEffect } from 'react';
import { X, Printer, Github, Mail, Globe } from 'lucide-react';
import { sounds } from './soundEffects';
import './ResumeModal.css';

export default function ResumeModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = typeof document !== 'undefined' ? document.body.style.overflow : '';
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof document !== 'undefined') document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handlePrint = () => {
    sounds.playSoftClick();
    if (typeof window !== 'undefined' && window.print) {
      window.print();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="resume-doc-name">
      <div className="resume-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="resume-toolbar no-print">
          <div className="toolbar-left">
            <button onClick={handlePrint} className="toolbar-btn">
              <Printer size={16} /> Print / Save PDF
            </button>
          </div>
          <button className="modal-close-static" onClick={onClose} aria-label="Close CV">
            <X size={20} />
          </button>
        </div>

        {/* Formatted CV Document */}
        <div className="resume-sheet">
          <header className="resume-header">
            <div>
              <h1 id="resume-doc-name" className="resume-name">KHUSHI</h1>
              <p className="resume-role">Software Engineer &amp; Creative Developer</p>
            </div>
            <div className="resume-contacts">
              <span><Mail size={12} /> khushigsd2924@gmail.com</span>
              <span><Github size={12} /> github.com/khushigsd2924-design</span>
              <span><Globe size={12} /> India</span>
            </div>
          </header>

          <section className="resume-section">
            <h2 className="resume-section-heading">Professional Summary</h2>
            <p>
              Dedicated Software Engineer and Creative Developer with expertise in building responsive web applications, test-driven Python backends, and interactive digital interfaces. Proven background in full-stack architecture with React, TypeScript, and Supabase, complemented by algorithmic problem solving and code auditing rigor.
            </p>
          </section>

          <section className="resume-section">
            <h2 className="resume-section-heading">Technical Skills</h2>
            <div className="resume-skill-row">
              <strong>Languages:</strong> TypeScript, JavaScript (ES6+), Python 3, C++, HTML5, CSS3
            </div>
            <div className="resume-skill-row">
              <strong>Frameworks &amp; Web:</strong> React 18/19, Tailwind CSS, Vite, Supabase, Node.js
            </div>
            <div className="resume-skill-row">
              <strong>Methodologies &amp; Tools:</strong> Test-Driven Development (TDD), Pytest, Git, GitHub, REST APIs
            </div>
          </section>

          <section className="resume-section">
            <h2 className="resume-section-heading">Featured Projects &amp; Repositories</h2>
            <div className="resume-item">
              <div className="item-head">
                <span className="item-title">Reading History</span>
                <span className="item-tech">TypeScript, React, Tailwind, Supabase</span>
              </div>
              <p className="item-desc">
                Architected a cloud-synchronized book tracking application featuring reading velocity metrics, goal analytics, and real-time database state.
              </p>
            </div>

            <div className="resume-item">
              <div className="item-head">
                <span className="item-title">Code With AI Quiz</span>
                <span className="item-tech">JavaScript, CSS3, HTML5</span>
              </div>
              <p className="item-desc">
                Developed an interactive computer science quiz engine delivering real-time scoring logic and instant validation across AI and coding topics.
              </p>
            </div>

            <div className="resume-item">
              <div className="item-head">
                <span className="item-title">Student Marks Analysis Engine</span>
                <span className="item-tech">Python 3, Statistical Algorithms</span>
              </div>
              <p className="item-desc">
                Built an automated academic evaluation script computing grade distributions, class-wide percentiles, and top performer analytics.
              </p>
            </div>

            <div className="resume-item">
              <div className="item-head">
                <span className="item-title">Python Unit Testing &amp; Defect Lifecycle Suite</span>
                <span className="item-tech">Python, Pytest, TDD</span>
              </div>
              <p className="item-desc">
                Constructed a robust test suite demonstrating the Red-Fix-Green lifecycle and auditing software regression resilience.
              </p>
            </div>
          </section>

          <section className="resume-section">
            <h2 className="resume-section-heading">Education</h2>
            <div className="resume-item">
              <div className="item-head">
                <span className="item-title">Bachelor of Technology / Computer Science</span>
                <span className="item-date">India</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
