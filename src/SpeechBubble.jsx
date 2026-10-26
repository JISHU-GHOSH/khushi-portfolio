import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { sounds } from './soundEffects';
import './SpeechBubble.css';

export const QUOTES = [
  "Hi! I'm Khushi — welcome to my digital space! ✨",
  "Looking around? Everything here is interactive!",
  "Hover over the projects below to see what I've built 🚀",
  "Curious about my code? Check out my GitHub repos!",
  "Available for software engineering & creative tech roles."
];

export default function SpeechBubble() {
  const [index, setIndex] = useState(0);

  const handleClick = () => {
    sounds.playSoftClick();
    setIndex((prev) => (prev + 1) % QUOTES.length);
  };

  return (
    <button
      className="speech-bubble"
      onClick={handleClick}
      aria-label="Character speech bubble — click for next thought"
    >
      <span className="speech-bubble-icon">
        <Sparkles size={14} />
      </span>
      <span className="speech-bubble-text">{QUOTES[index]}</span>
      <span className="speech-bubble-hint">click me</span>
    </button>
  );
}
