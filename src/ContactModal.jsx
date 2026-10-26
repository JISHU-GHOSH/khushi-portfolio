import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { sounds } from './soundEffects';
import './ContactModal.css';

export default function ContactModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    sounds.playChime();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>

        {submitted ? (
          <div className="contact-success">
            <CheckCircle size={48} className="success-icon" />
            <h2>Message Sent!</h2>
            <p>Thank you for reaching out. Khushi will get back to you shortly.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <span className="modal-category">Direct Inquiry</span>
              <h2 id="contact-modal-title" className="modal-title">Send a Message</h2>
              <p className="modal-subtitle">Leave your details and I'll respond within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="Tell me about your project, team, or opportunity..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-modal-primary submit-btn">
                <Send size={16} /> Send Message
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
