import React, { useState } from 'react';
import HeroSection from './HeroSection';
import ProjectsSection from './ProjectsSection';
import AboutSection from './AboutSection';
import ContactSection from './ContactSection';
import ContactModal from './ContactModal';
import ResumeModal from './ResumeModal';
import useLenis from './useLenis.js';
import './index.css';

export default function App() {
  useLenis();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  return (
    <>
      <HeroSection
        onOpenContact={() => setIsContactOpen(true)}
        onOpenResume={() => setIsResumeOpen(true)}
      >
        <ProjectsSection />
        <AboutSection
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
        />
        <ContactSection
          onOpenContact={() => setIsContactOpen(true)}
          onOpenResume={() => setIsResumeOpen(true)}
        />
      </HeroSection>

      {/* Interactive Modals */}
      {isContactOpen && <ContactModal onClose={() => setIsContactOpen(false)} />}
      {isResumeOpen && <ResumeModal onClose={() => setIsResumeOpen(false)} />}
    </>
  );
}
