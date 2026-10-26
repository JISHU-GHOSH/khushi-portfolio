import React, { useState } from 'react';
import { Mail, Github, Check, ArrowUpRight, Send } from 'lucide-react';
import { sounds } from './soundEffects';
import './ContactSection.css';

export default function ContactSection({ onOpenContact, onOpenResume }) {
  const [copied, setCopied] = useState(false);
  const email = "khushigsd2924@gmail.com";

  const copyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email);
    }
    sounds.playChime();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer id="contact" className="contact-section">
      <div className="section-container">
        <div className="contact-card">
          <span className="section-badge">Get in Touch</span>
          <h2 className="contact-headline">LET'S BUILD SOMETHING EXTRAORDINARY</h2>
          <p className="contact-sub">
            Whether you have an exciting software project, an engineering role, or just want to say hi — my inbox is always open.
          </p>

          <div className="contact-buttons">
            <button
              onClick={() => {
                sounds.playChime();
                onOpenContact && onOpenContact();
              }}
              className="btn-hero-primary"
            >
              <Send size={16} /> Send a Message
            </button>
            <button onClick={copyEmail} className="btn-hero-secondary">
              {copied ? <Check size={16} /> : <Mail size={16} />}
              {copied ? "Email Copied!" : email}
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-left">
            <span className="footer-logo">Khushi.</span>
            <span className="footer-copy">
              &copy; {new Date().getFullYear()} Khushi. Crafted with 60 FPS Canvas &amp; React.
            </span>
          </div>

          <div className="footer-links">
            <a
              href="https://github.com/khushigsd2924-design"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
              onClick={() => sounds.playSoftClick()}
            >
              <Github size={14} /> GitHub <ArrowUpRight size={12} />
            </a>
            <button
              onClick={() => {
                sounds.playChime();
                onOpenResume && onOpenResume();
              }}
              className="footer-link-btn"
            >
              Curriculum Vitae
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
