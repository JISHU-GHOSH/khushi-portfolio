// src/ProjectsSection.jsx
import React, { useState } from 'react';
import { ExternalLink, Github, Sparkles, BookOpen, Brain, BarChart2, ShieldCheck, Binary } from 'lucide-react';
import { sounds } from './soundEffects';
import useScrollReveal from './useScrollReveal';
import ProjectModal from './ProjectModal';
import './ProjectsSection.css';

export const PROJECTS = [
  {
    id: 'reading-history',
    title: 'Reading History',
    subtitle: 'Full-Stack Book Tracker & Analytics',
    icon: BookOpen,
    category: 'Full-Stack Web',
    tech: ['TypeScript', 'React 18', 'Tailwind CSS', 'Supabase', 'Lucide React'],
    summary: 'A cloud-synchronized personal reading log and goal analytics platform for active readers.',
    description: 'Built with TypeScript and React, Reading History provides readers with real-time reading goal tracking, book status management (want to read, in-progress, completed), and Supabase cloud persistence with instant synchronization.',
    github: 'https://github.com/khushigsd2924-design/Reading_History',
    demo: 'https://bolt.new/~/sb1-ox4e79td',
    features: [
      'Interactive book logging with customizable statuses',
      'Live reading goal progress bars and statistical metrics',
      'Supabase database integration with cloud persistence',
      'Modern responsive UI with Tailwind and fluid transitions'
    ]
  },
  {
    id: 'code-with-ai-quiz',
    title: 'Code With AI Quiz',
    subtitle: 'Interactive Computer Science Assessment',
    icon: Brain,
    category: 'Interactive Web',
    tech: ['JavaScript (ES6+)', 'Modern CSS3', 'HTML5'],
    summary: 'Engaging browser-based quiz application evaluating AI and software engineering skills.',
    description: 'An interactive multiple-choice assessment platform designed to test programming fundamentals, AI principles, and computer science logic with timed evaluation, instantaneous answer verification, and final score reporting.',
    github: 'https://github.com/khushigsd2924-design/quiz-app-code-with-ai',
    features: [
      'Four-option multiple choice randomized question bank',
      'Real-time answer validation and instant scoring algorithm',
      'Responsive, distraction-free quiz interface',
      'Zero external runtime dependencies for maximum speed'
    ]
  },
  {
    id: 'student-marks-analysis',
    title: 'Student Marks Analysis',
    subtitle: 'Academic Data Processing Engine',
    icon: BarChart2,
    category: 'Python & Algorithms',
    tech: ['Python 3', 'Data Processing', 'Statistical Analysis'],
    summary: 'Python performance analyzer computing class averages, grade distributions, and topper rankings.',
    description: 'Processes multi-subject academic scores across classrooms to automatically compute individual totals, grade categorizations, class-wide averages, and identify top-ranking students with automated formatted summaries.',
    github: 'https://github.com/khushigsd2924-design/messy-python-refactoring',
    features: [
      'Multi-subject score aggregation and grade assignment',
      'Class statistical metrics (mean, count above average)',
      'Automated top-performer identification and ranking',
      'Refactored for clean modularity, auditability, and efficiency'
    ]
  },
  {
    id: 'buggy-python-debugging',
    title: 'TDD Defect Lifecycle Harness',
    subtitle: 'Test-Driven Verification Suite',
    icon: ShieldCheck,
    category: 'Software Engineering',
    tech: ['Python 3', 'Pytest', 'Unit Testing', 'TDD'],
    summary: 'Enterprise unit testing suite demonstrating the Red -> Fix -> Green debugging lifecycle.',
    description: 'A comprehensive software testing project demonstrating disciplined Test-Driven Development (TDD). It walks through diagnosing buggy logic, formulating failing assertions (RED), applying precise refactors (FIX), and verifying regression immunity (GREEN).',
    github: 'https://github.com/khushigsd2924-design/buggy-python-debugging',
    features: [
      'Red -> Fix -> Green cycle demonstration with unit tests',
      'Edge case validation for arithmetic and recursive boundaries',
      'Automated regression verification with clear failure traces',
      'Code audit trail documenting every defect resolution'
    ]
  },
  {
    id: 'struct-to-dict',
    title: 'C++ Struct to Python Dict',
    subtitle: 'Memory Record & Schema Mapper',
    icon: Binary,
    category: 'Systems & Data',
    tech: ['Python 3', 'C++ Concepts', 'Data Structures'],
    summary: 'Type-safe memory record mapping utility with data integrity verification.',
    description: 'Bridges low-level structured records with dynamic Python dictionaries, ensuring schema integrity, roll number indexing, and structured key-value extraction with automated audit verification.',
    github: 'https://github.com/khushigsd2924-design/python-basics-struct-to-dict',
    features: [
      'Type-safe memory layout conversion into Python dicts',
      'Validation checks for missing or corrupted field entries',
      'Structured student record serialization',
      'Includes verification audit and assertion tests'
    ]
  }
];

export const CATEGORIES = ['All', 'Full-Stack Web', 'Interactive Web', 'Python & Algorithms', 'Software Engineering', 'Systems & Data'];

export default function ProjectsSection() {
  const sectionRef = useScrollReveal();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = CATEGORIES;

  const filteredProjects = activeFilter === 'All'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeFilter);

  const handleOpenModal = (project) => {
    sounds.playChime();
    setSelectedProject(project);
  };

  return (
    <section id="projects" className="projects-section" ref={sectionRef}>
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">
            <Sparkles size={14} /> Curated Works
          </span>
          <h2 className="section-title">FEATURED PROJECTS</h2>
          <p className="section-subtitle">
            A selection of software architectures, intelligent web applications, and algorithmic engineering tools built with precision.
          </p>
        </div>

        {/* Category Filters */}
        <div className="filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => {
                sounds.playSoftClick();
                setActiveFilter(cat);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const Icon = project.icon;
            return (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleOpenModal(project)}
              >
                <div className="card-top">
                  <div className="card-icon">
                    <Icon size={24} />
                  </div>
                  <span className="card-category">{project.category}</span>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{project.title}</h3>
                  <p className="card-subtitle">{project.subtitle}</p>
                  <p className="card-summary">{project.summary}</p>
                </div>

                <div className="card-tech">
                  {project.tech.map((t) => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </div>

                <div className="card-footer">
                  <span className="card-details-btn">View Details &rarr;</span>
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="icon-link"
                      title="GitHub Repository"
                      onClick={() => sounds.playSoftClick()}
                    >
                      <Github size={16} />
                    </a>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-link"
                        title="Live Demo"
                        onClick={() => sounds.playSoftClick()}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => {
            sounds.playSoftClick();
            setSelectedProject(null);
          }}
        />
      )}
    </section>
  );
}
