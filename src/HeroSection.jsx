// src/HeroSection.jsx
import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowDown, Send, FileText, Github } from 'lucide-react';
import CharacterCanvas from './CharacterCanvas';
import SpeechBubble from './SpeechBubble';
import { sounds } from './soundEffects';
import './HeroSection.css';

export default function HeroSection({ onOpenContact, onOpenResume, children }) {
  const [muted, setMuted] = useState(() => sounds.muted);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
    if (!isMuted) sounds.playSoftClick();
  };

  const scrollToProjects = () => {
    sounds.playSoftClick();
    const el = document.getElementById('projects');
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { duration: 1.2, offset: 0 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToId = (e, id) => {
    e.preventDefault();
    sounds.playSoftClick();
    const el = document.getElementById(id);
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { duration: 1.2, offset: 0 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="portfolio-wrapper">
      <header className="hero-viewport">
        {/* Full-bleed 60 FPS character canvas */}
        <CharacterCanvas />

        {/* Ambient grain and vignette overlay */}
        <div className="hero-overlay" />

        {/* Navigation */}
        <nav className="hero-nav">
          <a href="#" className="hero-logo" onClick={() => sounds.playSoftClick()}>
            Khushi<span className="dot">.</span>
          </a>

          <div className="nav-links">
            <a href="#projects" onClick={(e) => scrollToId(e, 'projects')}>Projects</a>
            <a href="#about" onClick={(e) => scrollToId(e, 'about')}>About</a>
            <button
              onClick={() => {
                sounds.playChime();
                onOpenResume && onOpenResume();
              }}
              className="nav-btn"
            >
              <FileText size={14} /> Resume
            </button>
            <button
              onClick={() => {
                sounds.playChime();
                onOpenContact && onOpenContact();
              }}
              className="nav-btn nav-btn-primary"
            >
              <Send size={14} /> Contact
            </button>
            <button
              onClick={toggleSound}
              className="sound-toggle"
              aria-label={muted ? 'Unmute procedural audio' : 'Mute procedural audio'}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </nav>

        {/* Hero Content Overlay */}
        <div className="hero-content">
          <div className="hero-speech-container">
            <SpeechBubble />
          </div>

          <div className="hero-titles">
            <span className="hero-badge">Software Engineer &amp; Creative Developer</span>
            <h1 className="hero-title">KHUSHI</h1>
            <p className="hero-tagline">
              Crafting intelligent interfaces, scalable algorithms, and immersive digital experiences.
            </p>
          </div>

          <div className="hero-actions">
            <button onClick={scrollToProjects} className="btn-hero-primary">
              Explore Work <ArrowDown size={16} />
            </button>
            <a
              href="https://github.com/khushigsd2924-design"
              target="_blank"
              rel="noreferrer"
              className="btn-hero-secondary"
              onClick={() => sounds.playSoftClick()}
            >
              <Github size={16} /> GitHub Profile
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator" onClick={scrollToProjects}>
          <span>SCROLL</span>
          <div className="scroll-line" />
        </div>
      </header>

      {/* Child sections rendered seamlessly below hero */}
      <main className="portfolio-content">{children}</main>
    </div>
  );
}
