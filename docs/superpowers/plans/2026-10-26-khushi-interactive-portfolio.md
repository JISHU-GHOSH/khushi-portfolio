# Khushi Interactive Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a luxury, 60 FPS interactive portfolio web application for Khushi (Software Engineer & Creative Developer) featuring real-time cursor gaze-tracking extracted from `C:\khushi_porfolio\Character_tracking_mouse_cursor_1080p_20261026042114.mp4` and project showcases sourced from [khushigsd2924-design](https://github.com/khushigsd2924-design).

**Architecture:** A modern Vite + React 19 application with a zero-ghosting HTML5 canvas gaze-tracking engine powered by 64 circular directional WebP frames + 1 neutral eye-contact frame with Telea watermark inpainting. Surrounding sections (Hero with speech bubble, Projects with interactive detail modal, About with technical toolkit, Contact with interactive inquiry form, and a printable Resume modal) are styled with a dusty rose and deep wine luxury aesthetic matching the video palette.

**Tech Stack:** React 19, Vite 6, HTML5 Canvas 2D API, Web Audio API, Modern CSS3 with CSS variables & glassmorphism, Python 3 with OpenCV (`cv2`) and NumPy.

**Spec:** [docs/superpowers/specs/2026-10-26-khushi-interactive-portfolio-design.md](file:///c:/Users/jishu/Documents/antigravity/charming-planck/docs/superpowers/specs/2026-10-26-khushi-interactive-portfolio-design.md)

## Global Constraints
- Target user profile: `https://github.com/khushigsd2924-design`
- Canvas background color verbatim from spec: `#9c474f`
- Source video path verbatim: `C:\khushi_porfolio\Character_tracking_mouse_cursor_1080p_20261026042114.mp4`
- Exactly 64 circular directional frames (`000.webp`..`063.webp`) plus `center.webp` in `public/frames/`
- Zero external runtime audio assets; use procedural Web Audio API synthesizers

---

### Task 1: Frame Extraction & Kling Watermark Inpainting Pipeline

**Files:**
- Create: `scripts/extract_khushi_frames.py`
- Test: `scripts/test_frames.py`
- Output: `public/frames/000.webp` through `public/frames/063.webp` and `public/frames/center.webp`

**Interfaces:**
- Consumes: `C:\khushi_porfolio\Character_tracking_mouse_cursor_1080p_20261026042114.mp4`
- Produces: 65 optimized WebP files in `public/frames/`

- [ ] **Step 1: Write test script to verify frame extraction output**

```python
# scripts/test_frames.py
import os
import cv2

FRAMES_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "frames")

def test_frame_count_and_dimensions():
    assert os.path.exists(FRAMES_DIR), f"Frames directory does not exist: {FRAMES_DIR}"
    
    # Check center frame
    center_path = os.path.join(FRAMES_DIR, "center.webp")
    assert os.path.exists(center_path), "center.webp is missing"
    center_img = cv2.imread(center_path)
    assert center_img is not None, "center.webp is unreadable"
    assert center_img.shape == (1080, 1920, 3), f"center.webp wrong shape: {center_img.shape}"
    
    # Check 64 directional frames
    for i in range(64):
        f_path = os.path.join(FRAMES_DIR, f"{i:03d}.webp")
        assert os.path.exists(f_path), f"Frame {i:03d}.webp is missing"
        img = cv2.imread(f_path)
        assert img is not None, f"Frame {i:03d}.webp is unreadable"
        assert img.shape == (1080, 1920, 3), f"Frame {i:03d}.webp wrong shape: {img.shape}"

    print("PASS: All 65 WebP frames are verified!")

if __name__ == "__main__":
    test_frame_count_and_dimensions()
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `python scripts/test_frames.py`  
Expected: FAIL (Frames directory does not exist or files missing)

- [ ] **Step 3: Write frame extraction & inpainting script**

```python
# scripts/extract_khushi_frames.py
import cv2
import numpy as np
import os
import sys

VIDEO_PATH = r"C:\khushi_porfolio\Character_tracking_mouse_cursor_1080p_20261026042114.mp4"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "frames")
os.makedirs(OUT_DIR, exist_ok=True)

# 64-frame counter-clockwise continuous circular mapping:
# 0..7:   RIGHT (0 deg) -> UP-RIGHT (45 deg)
# 8..15:  UP-RIGHT (45 deg) -> UP (90 deg)
# 16..23: UP (90 deg) -> UP-LEFT (135 deg)
# 24..31: UP-LEFT (135 deg) -> LEFT (180 deg)
# 32..39: LEFT (180 deg) -> DOWN-LEFT (225 deg)
# 40..47: DOWN-LEFT (225 deg) -> DOWN (270 deg)
# 48..55: DOWN (270 deg) -> DOWN-RIGHT (315 deg)
# 56..63: DOWN-RIGHT (315 deg) -> RIGHT (360 deg)
frame_map = [
    # 0..7: 0 deg to 45 deg (RIGHT -> UP-RIGHT)
    10, 13, 16, 19, 22, 25, 28, 31,
    # 8..15: 45 deg to 90 deg (UP-RIGHT -> UP)
    33, 35, 37, 39, 41, 43, 45, 47,
    # 16..23: 90 deg to 135 deg (UP -> UP-LEFT)
    138, 141, 144, 147, 150, 153, 156, 159,
    # 24..31: 135 deg to 180 deg (UP-LEFT -> LEFT)
    162, 166, 170, 174, 178, 183, 188, 193,
    # 32..39: 180 deg to 225 deg (LEFT -> DOWN-LEFT)
    196, 185, 175, 165, 130, 125, 122, 120,
    # 40..47: 225 deg to 270 deg (DOWN-LEFT -> DOWN)
    118, 116, 114, 112, 110, 108, 106, 104,
    # 48..55: 270 deg to 315 deg (DOWN -> DOWN-RIGHT)
    102, 100, 95, 90, 85, 80, 75, 70,
    # 56..63: 315 deg to 360 deg (DOWN-RIGHT -> RIGHT)
    65, 58, 50, 42, 30, 20, 15, 10
]

def inpaint_watermark(img):
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    # Kling AI sparkle watermark region in bottom-right quadrant
    mask[780:1020, 1600:1890] = 255
    return cv2.inpaint(img, mask, 6, cv2.INPAINT_TELEA)

cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    print(f"Error opening video: {VIDEO_PATH}")
    sys.exit(1)

all_frames = {}
frame_idx = 0
needed_indices = set(frame_map)
needed_indices.add(0) # Center direct eye-contact frame

while True:
    ret, frame = cap.read()
    if not ret: break
    if frame_idx in needed_indices:
        all_frames[frame_idx] = frame
    frame_idx += 1
cap.release()

print(f"Loaded {len(all_frames)} needed video frames.")

# Save 64 directional WebP frames
for i, f_num in enumerate(frame_map):
    raw = all_frames[f_num]
    cleaned = inpaint_watermark(raw)
    out_path = os.path.join(OUT_DIR, f"{i:03d}.webp")
    cv2.imwrite(out_path, cleaned, [cv2.IMWRITE_WEBP_QUALITY, 90])

# Save neutral eye-contact frame (Frame 0)
raw_center = all_frames[0]
cleaned_center = inpaint_watermark(raw_center)
cv2.imwrite(os.path.join(OUT_DIR, "center.webp"), cleaned_center, [cv2.IMWRITE_WEBP_QUALITY, 90])

print(f"Successfully saved 64 WebP frames + center.webp into {OUT_DIR}")
```

- [ ] **Step 4: Execute extraction script and run test**

Run: `python scripts/extract_khushi_frames.py && python scripts/test_frames.py`  
Expected: Output prints `PASS: All 65 WebP frames are verified!`

- [ ] **Step 5: Commit frames and extraction scripts**

```bash
git add scripts/ public/frames/
git commit -m "feat: extract and inpaint 64 circular webp frames and center gaze"
```

---

### Task 2: Project Scaffolding & Design System Foundations

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/soundEffects.js`
- Create: `src/useScrollReveal.js`

**Interfaces:**
- Produces: CSS custom properties (`--bg-canvas`, `--bg-dark`, `--accent-blush`), sound triggers (`playClick()`, `playChime()`, `playHover()`), and `useScrollReveal` hook.

- [ ] **Step 1: Create `package.json` with React 19 and Vite 6**

```json
{
  "name": "khushi-portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`  
Expected: Dependencies installed cleanly.

- [ ] **Step 3: Create `vite.config.js` and `index.html`**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Khushi — Software Engineer & Creative Developer</title>
    <meta name="description" content="Portfolio of Khushi: Software Engineer & Creative Developer specializing in intelligent interfaces, algorithms, and immersive web experiences." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Syne:wght@500;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `src/index.css` with luxury dusty rose palette**

```css
/* src/index.css */
:root {
  --canvas-bg: #9c474f;
  --bg-deep: #16070a;
  --bg-card: rgba(38, 15, 20, 0.72);
  --bg-card-hover: rgba(56, 22, 30, 0.88);
  --border-subtle: rgba(227, 181, 190, 0.18);
  --border-focus: rgba(247, 198, 157, 0.6);
  --text-main: #fdf7f8;
  --text-muted: #dfb2b9;
  --accent-blush: #e3b5be;
  --accent-gold: #f8c8a0;
  --accent-glow: rgba(248, 200, 160, 0.25);
  
  --font-display: 'Syne', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --ease-luxury: cubic-bezier(0.16, 1, 0.3, 1);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-deep);
  color: var(--text-main);
  font-family: var(--font-body);
  line-height: 1.6;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}
```

- [ ] **Step 5: Create `src/soundEffects.js` (Web Audio API Synthesizer)**

```javascript
// src/soundEffects.js
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSoftClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio fallback
    }
  }

  playChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.03, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch {
      // Audio fallback
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

export const sounds = new SoundEngine();
```

- [ ] **Step 6: Create `src/useScrollReveal.js`**

```javascript
// src/useScrollReveal.js
import { useEffect, useRef } from 'react';

export default function useScrollReveal(options = { threshold: 0.15 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-revealed');
        observer.unobserve(el);
      }
    }, options);

    observer.observe(el);

    return () => observer.disconnect();
  }, [options]);

  return ref;
}
```

- [ ] **Step 7: Commit scaffolding & design foundations**

```bash
git add package.json vite.config.js index.html src/
git commit -m "feat: project scaffolding, sound engine, and design system foundations"
```

---

### Task 3: 60 FPS Character Canvas Engine (`CharacterCanvas.jsx`)

**Files:**
- Create: `src/CharacterCanvas.jsx`
- Create: `src/CharacterCanvas.css`

**Interfaces:**
- Consumes: `public/frames/*.webp`, `center.webp`
- Produces: `<CharacterCanvas className="..." />` component

- [ ] **Step 1: Write `src/CharacterCanvas.jsx`**

```javascript
// src/CharacterCanvas.jsx
import { useRef, useEffect } from 'react';
import './CharacterCanvas.css';

const NUM_FRAMES = 64;
const DEADZONE_RADIUS = 0.12;
const BG_COLOR = '#9c474f';
const FACE_CENTER_X = 0.50;
const FACE_CENTER_Y = 0.38;

const FRAME_LERP = 0.22;
const MAX_FRAME_STEP = 2.8;
const ASPECT_RATIO = 1920 / 1080;

export default function CharacterCanvas({ className = 'character-canvas' }) {
  const canvasRef = useRef(null);

  const state = useRef({
    frames: [],
    centerImg: null,
    loaded: 0,
    totalFrames: NUM_FRAMES + 1,
    smoothFrame: 0,
    targetAngle: 0,
    isCenter: true,
    rafId: null,
    mouseX: FACE_CENTER_X,
    mouseY: FACE_CENTER_Y,
    isReady: false,
  });

  // Preload all 65 WebP frames safely
  useEffect(() => {
    const s = state.current;
    let isMounted = true;
    const framesArray = [];

    const onImageLoaded = () => {
      if (!isMounted) return;
      s.loaded++;
      if (s.loaded >= s.totalFrames) {
        s.isReady = true;
      }
    };

    const baseUrl = import.meta.env.BASE_URL || '/';

    for (let i = 0; i < NUM_FRAMES; i++) {
      const img = new Image();
      img.onload = onImageLoaded;
      img.onerror = onImageLoaded;
      img.src = `${baseUrl}frames/${String(i).padStart(3, '0')}.webp`;
      framesArray.push(img);
    }
    s.frames = framesArray;

    const center = new Image();
    center.onload = onImageLoaded;
    center.onerror = onImageLoaded;
    center.src = `${baseUrl}frames/center.webp`;
    s.centerImg = center;

    return () => {
      isMounted = false;
    };
  }, []);

  // Mouse & Touch Tracking
  useEffect(() => {
    const s = state.current;
    let isTouching = false;
    let touchReturnRaf = null;

    const onMove = (e) => {
      if (window.innerWidth > 0 && window.innerHeight > 0) {
        s.mouseX = e.clientX / window.innerWidth;
        s.mouseY = e.clientY / window.innerHeight;
      }
    };

    const onTouchStart = (e) => {
      if (window.scrollY > window.innerHeight * 0.8) return;
      if (e.touches && e.touches[0] && window.innerWidth > 0 && window.innerHeight > 0) {
        isTouching = true;
        if (touchReturnRaf) cancelAnimationFrame(touchReturnRaf);
        s.mouseX = e.touches[0].clientX / window.innerWidth;
        s.mouseY = e.touches[0].clientY / window.innerHeight;
      }
    };

    const onTouchMove = (e) => {
      if (window.scrollY > window.innerHeight * 0.8) return;
      if (e.touches && e.touches[0] && window.innerWidth > 0 && window.innerHeight > 0) {
        isTouching = true;
        s.mouseX = e.touches[0].clientX / window.innerWidth;
        s.mouseY = e.touches[0].clientY / window.innerHeight;
      }
    };

    const onTouchEnd = () => {
      isTouching = false;
      if (window.scrollY > window.innerHeight * 0.8) return;

      function driftToCenter() {
        if (isTouching) return;
        const dx = FACE_CENTER_X - s.mouseX;
        const dy = FACE_CENTER_Y - s.mouseY;
        if (Math.abs(dx) > 0.005 || Math.abs(dy) > 0.005) {
          s.mouseX += dx * 0.12;
          s.mouseY += dy * 0.12;
          touchReturnRaf = requestAnimationFrame(driftToCenter);
        } else {
          s.mouseX = FACE_CENTER_X;
          s.mouseY = FACE_CENTER_Y;
        }
      }
      if (touchReturnRaf) cancelAnimationFrame(touchReturnRaf);
      touchReturnRaf = requestAnimationFrame(driftToCenter);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (touchReturnRaf) cancelAnimationFrame(touchReturnRaf);
    };
  }, []);

  // 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    const s = state.current;

    function resize() {
      const W = window.innerWidth;
      const H = window.innerHeight;
      if (W <= 0 || H <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let last = -1;

    function render(ts) {
      s.rafId = requestAnimationFrame(render);

      if (last < 0) last = ts;
      const dt = Math.min(ts - last, 50) / 16.67;
      last = ts;

      const W = window.innerWidth;
      const H = window.innerHeight;
      if (W <= 0 || H <= 0) return;

      const faceCX = W * FACE_CENTER_X;
      const faceCY = H * FACE_CENTER_Y;

      const cx = s.mouseX * W;
      const cy = s.mouseY * H;
      const dx = cx - faceCX;
      const dy = cy - faceCY;

      const dist = Math.sqrt(dx * dx + dy * dy) / Math.min(W, H);
      s.isCenter = dist < DEADZONE_RADIUS;

      s.targetAngle = Math.atan2(-dy, dx);

      let normTarget = s.targetAngle % (2 * Math.PI);
      if (normTarget < 0) normTarget += 2 * Math.PI;
      const targetFrame = (normTarget / (2 * Math.PI)) * NUM_FRAMES;

      let diff = targetFrame - s.smoothFrame;
      if (diff > NUM_FRAMES / 2) diff -= NUM_FRAMES;
      if (diff < -NUM_FRAMES / 2) diff += NUM_FRAMES;

      const lf = 1 - Math.pow(1 - FRAME_LERP, dt);
      const absDiff = Math.abs(diff);
      const step = Math.sign(diff) * Math.min(absDiff * Math.max(lf, 0.20), MAX_FRAME_STEP);

      s.smoothFrame = ((s.smoothFrame + step) % NUM_FRAMES + NUM_FRAMES) % NUM_FRAMES;
      const frameIdx = Math.round(s.smoothFrame) % NUM_FRAMES;

      let img = null;
      if (s.isCenter && s.centerImg && s.centerImg.complete && s.centerImg.naturalWidth > 0) {
        img = s.centerImg;
      } else if (s.frames[frameIdx] && s.frames[frameIdx].complete && s.frames[frameIdx].naturalWidth > 0) {
        img = s.frames[frameIdx];
      } else if (s.centerImg && s.centerImg.complete && s.centerImg.naturalWidth > 0) {
        img = s.centerImg;
      }

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, W, H);

      if (img) {
        try {
          const iA = (img.naturalWidth && img.naturalHeight)
            ? (img.naturalWidth / img.naturalHeight)
            : ASPECT_RATIO;
          const cA = W / H;

          let dW, dH, dX, dY;
          if (iA > cA) {
            dH = H;
            dW = dH * iA;
            dX = (W - dW) / 2;
            dY = 0;
          } else {
            dW = W;
            dH = dW / iA;
            dX = 0;
            dY = (H - dH) / 2;
          }

          ctx.drawImage(img, dX, dY, dW, dH);
        } catch {
          // Graceful draw fallback
        }
      }

      // Bottom subtle loading bar while preloading
      if (!s.isReady && s.totalFrames > 0) {
        const p = Math.min(s.loaded / s.totalFrames, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, H - 3, W, 3);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(0, H - 3, W * p, 3);
      }
    }

    s.rafId = requestAnimationFrame(render);

    return () => {
      if (s.rafId) cancelAnimationFrame(s.rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label="Interactive character tracking cursor movement"
      role="img"
    />
  );
}
```

- [ ] **Step 2: Write `src/CharacterCanvas.css`**

```css
/* src/CharacterCanvas.css */
.character-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 1;
  pointer-events: none;
}
```

- [ ] **Step 3: Commit CharacterCanvas**

```bash
git add src/CharacterCanvas.jsx src/CharacterCanvas.css
git commit -m "feat: 60 FPS HTML5 canvas character gaze-tracking engine"
```

---

### Task 4: Hero Section & Interactive Speech Bubble

**Files:**
- Create: `src/HeroSection.jsx`
- Create: `src/HeroSection.css`
- Create: `src/SpeechBubble.jsx`
- Create: `src/SpeechBubble.css`

**Interfaces:**
- Consumes: `<CharacterCanvas />`, `sounds`, props `onOpenContact`, `onOpenResume`, `children`
- Produces: Full hero section with navigation, speech bubble, and child section container.

- [ ] **Step 1: Write `src/SpeechBubble.jsx` and `src/SpeechBubble.css`**

```javascript
// src/SpeechBubble.jsx
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { sounds } from './soundEffects';
import './SpeechBubble.css';

const QUOTES = [
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
```

```css
/* src/SpeechBubble.css */
.speech-bubble {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(38, 15, 20, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(227, 181, 190, 0.3);
  padding: 8px 16px;
  border-radius: 999px;
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  transition: all 0.3s var(--ease-luxury);
  cursor: pointer;
}

.speech-bubble:hover {
  transform: translateY(-2px);
  border-color: var(--accent-gold);
  box-shadow: 0 12px 35px var(--accent-glow);
}

.speech-bubble-icon {
  color: var(--accent-gold);
  display: flex;
}

.speech-bubble-hint {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  margin-left: 4px;
}
```

- [ ] **Step 2: Write `src/HeroSection.jsx` and `src/HeroSection.css`**

```javascript
// src/HeroSection.jsx
import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowDown, Send, FileText, Github } from 'lucide-react';
import CharacterCanvas from './CharacterCanvas';
import SpeechBubble from './SpeechBubble';
import { sounds } from './soundEffects';
import './HeroSection.css';

export default function HeroSection({ onOpenContact, onOpenResume, children }) {
  const [muted, setMuted] = useState(false);

  const toggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
    if (!isMuted) sounds.playSoftClick();
  };

  const scrollToProjects = () => {
    sounds.playSoftClick();
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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
            <a href="#projects" onClick={() => sounds.playSoftClick()}>Projects</a>
            <a href="#about" onClick={() => sounds.playSoftClick()}>About</a>
            <button
              onClick={() => {
                sounds.playChime();
                onOpenResume();
              }}
              className="nav-btn"
            >
              <FileText size={14} /> Resume
            </button>
            <button
              onClick={() => {
                sounds.playChime();
                onOpenContact();
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
```

```css
/* src/HeroSection.css */
.portfolio-wrapper {
  position: relative;
  width: 100%;
}

.hero-viewport {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 650px;
  overflow: hidden;
  background-color: var(--canvas-bg);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, transparent 40%, rgba(22, 7, 10, 0.65) 100%);
  pointer-events: none;
  z-index: 2;
}

.hero-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 28px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.hero-logo {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.hero-logo .dot {
  color: var(--accent-gold);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-links a {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: var(--text-main);
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
  border: 1px solid rgba(227, 181, 190, 0.25);
  backdrop-filter: blur(10px);
  transition: all 0.25s var(--ease-luxury);
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: var(--accent-gold);
  transform: translateY(-1px);
}

.nav-btn-primary {
  background: var(--text-main);
  color: var(--bg-deep);
  border: none;
}

.nav-btn-primary:hover {
  background: var(--accent-gold);
  color: var(--bg-deep);
}

.sound-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.25);
  color: var(--text-muted);
  border: 1px solid rgba(227, 181, 190, 0.2);
  transition: all 0.2s ease;
}

.sound-toggle:hover {
  color: var(--text-main);
  border-color: var(--accent-gold);
}

.hero-content {
  position: absolute;
  bottom: 8%;
  left: 6%;
  z-index: 5;
  max-width: 650px;
}

.hero-speech-container {
  margin-bottom: 20px;
}

.hero-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent-gold);
  margin-bottom: 8px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 8vw, 6.5rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: var(--text-main);
  text-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  margin-bottom: 16px;
}

.hero-tagline {
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 520px;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.95rem;
  background: var(--text-main);
  color: var(--bg-deep);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  transition: all 0.3s var(--ease-luxury);
}

.btn-hero-primary:hover {
  background: var(--accent-gold);
  transform: translateY(-2px);
  box-shadow: 0 15px 35px var(--accent-glow);
}

.btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 26px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  background: rgba(38, 15, 20, 0.7);
  border: 1px solid rgba(227, 181, 190, 0.3);
  color: var(--text-main);
  backdrop-filter: blur(12px);
  transition: all 0.3s var(--ease-luxury);
}

.btn-hero-secondary:hover {
  border-color: var(--accent-gold);
  transform: translateY(-2px);
}

.scroll-indicator {
  position: absolute;
  bottom: 32px;
  right: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 5;
  cursor: pointer;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
}

.scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, var(--accent-gold), transparent);
  animation: scrollPulse 2s infinite ease-in-out;
}

@keyframes scrollPulse {
  0% { transform: scaleY(0); transform-origin: top; }
  50% { transform: scaleY(1); transform-origin: top; }
  50.1% { transform: scaleY(1); transform-origin: bottom; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}

@media (max-width: 768px) {
  .hero-nav { padding: 20px 24px; }
  .nav-links a { display: none; }
  .hero-content { left: 5%; bottom: 6%; }
  .hero-title { font-size: 4rem; }
  .scroll-indicator { display: none; }
}
```

- [ ] **Step 3: Commit Hero Section**

```bash
git add src/HeroSection.jsx src/HeroSection.css src/SpeechBubble.jsx src/SpeechBubble.css
git commit -m "feat: luxury hero section with speech bubble, navigation, and sound triggers"
```

---

### Task 5: Featured Projects Section & Project Modal

**Files:**
- Create: `src/ProjectsSection.jsx`
- Create: `src/ProjectsSection.css`
- Create: `src/ProjectModal.jsx`
- Create: `src/ProjectModal.css`

**Interfaces:**
- Consumes: Project data from `khushigsd2924-design`, `sounds`, `useScrollReveal`
- Produces: `<ProjectsSection />` and `<ProjectModal />` components

- [ ] **Step 1: Write `src/ProjectsSection.jsx` with GitHub repository data**

```javascript
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

export default function ProjectsSection() {
  const sectionRef = useScrollReveal();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Full-Stack Web', 'Interactive Web', 'Python & Algorithms', 'Software Engineering'];

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
```

- [ ] **Step 2: Write `src/ProjectsSection.css`**

```css
/* src/ProjectsSection.css */
.projects-section {
  position: relative;
  background: var(--bg-deep);
  padding: 120px 48px;
  z-index: 5;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 56px;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--accent-gold);
  margin-bottom: 12px;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-main);
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 620px;
  margin: 0 auto;
}

.filter-bar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 48px;
}

.filter-pill {
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  background: rgba(38, 15, 20, 0.4);
  border: 1px solid var(--border-subtle);
  transition: all 0.25s var(--ease-luxury);
}

.filter-pill:hover,
.filter-pill.active {
  color: var(--text-main);
  background: rgba(227, 181, 190, 0.15);
  border-color: var(--accent-gold);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
}

.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(16px);
  cursor: pointer;
  transition: all 0.35s var(--ease-luxury);
}

.project-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(248, 200, 160, 0.4);
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 25px var(--accent-glow);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(248, 200, 160, 0.1);
  color: var(--accent-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(248, 200, 160, 0.2);
}

.card-category {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-blush);
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 0.9rem;
  color: var(--accent-gold);
  margin-bottom: 12px;
}

.card-summary {
  font-size: 0.92rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 20px;
}

.card-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  margin-bottom: 24px;
}

.tech-tag {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(227, 181, 190, 0.15);
  color: var(--text-muted);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(227, 181, 190, 0.1);
}

.card-details-btn {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.card-actions {
  display: flex;
  gap: 12px;
}

.icon-link {
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.icon-link:hover {
  color: var(--accent-gold);
}
```

- [ ] **Step 3: Write `src/ProjectModal.jsx` and `src/ProjectModal.css`**

```javascript
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
    <div className="modal-backdrop" onClick={onClose}>
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
              <h2 className="modal-title">{project.title}</h2>
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
```

```css
/* src/ProjectModal.css */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 3, 5, 0.85);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
  animation: fadeIn 0.25s ease-out;
}

.modal-content {
  background: #240c12;
  border: 1px solid rgba(227, 181, 190, 0.25);
  border-radius: 24px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 40px;
  position: relative;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  animation: scaleUp 0.3s var(--ease-luxury);
}

.modal-close {
  position: absolute;
  top: 24px;
  right: 24px;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: var(--text-main);
}

.modal-category {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--accent-gold);
  letter-spacing: 0.1em;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  margin-bottom: 24px;
}

.modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(248, 200, 160, 0.12);
  color: var(--accent-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(248, 200, 160, 0.25);
  flex-shrink: 0;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--text-main);
}

.modal-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.modal-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-main);
  margin-bottom: 28px;
}

.modal-section-title {
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-gold);
  margin-bottom: 14px;
}

.modal-features-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.modal-features-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.92rem;
  color: var(--text-muted);
}

.feature-icon {
  color: var(--accent-gold);
  flex-shrink: 0;
  margin-top: 2px;
}

.modal-tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.modal-footer {
  display: flex;
  gap: 14px;
  padding-top: 20px;
  border-top: 1px solid rgba(227, 181, 190, 0.15);
}

.btn-modal-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 999px;
  background: var(--text-main);
  color: var(--bg-deep);
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.25s var(--ease-luxury);
}

.btn-modal-primary:hover {
  background: var(--accent-gold);
  transform: translateY(-2px);
}

.btn-modal-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(227, 181, 190, 0.25);
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.25s var(--ease-luxury);
}

.btn-modal-secondary:hover {
  border-color: var(--accent-gold);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

- [ ] **Step 4: Commit Projects Section and Modal**

```bash
git add src/ProjectsSection.jsx src/ProjectsSection.css src/ProjectModal.jsx src/ProjectModal.css
git commit -m "feat: projects section with filtering, project modal, and khushigsd2924-design repos"
```

---

### Task 6: About Section & Engineering Toolkit

**Files:**
- Create: `src/AboutSection.jsx`
- Create: `src/AboutSection.css`

**Interfaces:**
- Consumes: props `onOpenResume`, `onOpenContact`, `sounds`, `useScrollReveal`
- Produces: `<AboutSection />` component

- [ ] **Step 1: Write `src/AboutSection.jsx` and `src/AboutSection.css`**

```javascript
// src/AboutSection.jsx
import React from 'react';
import { Code, Terminal, Layers, Heart, Sparkles, FileText, Send } from 'lucide-react';
import { sounds } from './soundEffects';
import useScrollReveal from './useScrollReveal';
import './AboutSection.css';

const SKILLS = [
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
                  onOpenResume();
                }}
              >
                <FileText size={16} /> View Curriculum Vitae
              </button>
              <button
                className="btn-hero-secondary"
                onClick={() => {
                  sounds.playChime();
                  onOpenContact();
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
```

```css
/* src/AboutSection.css */
.about-section {
  position: relative;
  background: #1b090d;
  padding: 120px 48px;
  z-index: 5;
  border-top: 1px solid rgba(227, 181, 190, 0.1);
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}

.about-title {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-main);
  margin-top: 8px;
  margin-bottom: 24px;
}

.about-lead {
  font-size: 1.15rem;
  color: var(--accent-blush);
  line-height: 1.6;
  margin-bottom: 16px;
}

.about-body {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 36px;
}

.about-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.skills-headline {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--accent-gold);
  margin-bottom: 24px;
}

.skills-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  transition: all 0.3s var(--ease-luxury);
}

.skill-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(248, 200, 160, 0.35);
  transform: translateX(4px);
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.skill-icon {
  color: var(--accent-gold);
}

.skill-header h4 {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-main);
}

.skill-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-pill {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(227, 181, 190, 0.2);
  color: var(--text-main);
}

@media (max-width: 900px) {
  .about-grid { grid-template-columns: 1fr; gap: 48px; }
  .about-section { padding: 80px 24px; }
}
```

- [ ] **Step 2: Commit About Section**

```bash
git add src/AboutSection.jsx src/AboutSection.css
git commit -m "feat: about section with biography, engineering philosophy, and toolkit"
```

---

### Task 7: Contact Section, Modals & Root Orchestration

**Files:**
- Create: `src/ContactSection.jsx`
- Create: `src/ContactSection.css`
- Create: `src/ContactModal.jsx`
- Create: `src/ContactModal.css`
- Create: `src/ResumeModal.jsx`
- Create: `src/ResumeModal.css`
- Create: `src/App.jsx`
- Create: `src/main.jsx`

**Interfaces:**
- Consumes: Modal states, `PROJECTS`, `sounds`
- Produces: Full interactive web application wired with root state.

- [ ] **Step 1: Write `src/ContactSection.jsx` and `src/ContactSection.css`**

```javascript
// src/ContactSection.jsx
import React, { useState } from 'react';
import { Mail, Github, Check, ArrowUpRight, Send, Heart } from 'lucide-react';
import { sounds } from './soundEffects';
import './ContactSection.css';

export default function ContactSection({ onOpenContact, onOpenResume }) {
  const [copied, setCopied] = useState(false);
  const email = "khushigsd2924@gmail.com";

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
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
                onOpenContact();
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
                onOpenResume();
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
```

```css
/* src/ContactSection.css */
.contact-section {
  background: var(--bg-deep);
  padding: 100px 48px 48px;
  position: relative;
  z-index: 5;
  border-top: 1px solid rgba(227, 181, 190, 0.1);
}

.contact-card {
  background: linear-gradient(135deg, rgba(45, 18, 23, 0.85), rgba(22, 7, 10, 0.95));
  border: 1px solid rgba(227, 181, 190, 0.3);
  border-radius: 28px;
  padding: 64px 48px;
  text-align: center;
  margin-bottom: 80px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
}

.contact-headline {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-main);
  max-width: 800px;
  margin: 12px auto 16px;
}

.contact-sub {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto 36px;
}

.contact-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32px;
  border-top: 1px solid rgba(227, 181, 190, 0.1);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-logo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.2rem;
  color: var(--text-main);
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-link,
.footer-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.footer-link:hover,
.footer-link-btn:hover {
  color: var(--accent-gold);
}

@media (max-width: 768px) {
  .contact-section { padding: 60px 24px 32px; }
  .contact-card { padding: 40px 24px; }
  .footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
}
```

- [ ] **Step 2: Write `src/ContactModal.jsx` and `src/ContactModal.css`**

```javascript
// src/ContactModal.jsx
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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    <div className="modal-backdrop" onClick={onClose}>
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
              <h2 className="modal-title">Send a Message</h2>
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
```

```css
/* src/ContactModal.css */
.contact-modal-content {
  background: #200a10;
  border: 1px solid rgba(227, 181, 190, 0.25);
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  padding: 36px;
  position: relative;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  animation: scaleUp 0.3s var(--ease-luxury);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.82rem;
  font-family: var(--font-mono);
  text-transform: uppercase;
  color: var(--accent-gold);
  letter-spacing: 0.05em;
}

.form-group input,
.form-group textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(227, 181, 190, 0.2);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-gold);
  background: rgba(255, 255, 255, 0.08);
}

.submit-btn {
  margin-top: 10px;
  width: 100%;
  justify-content: center;
}

.contact-success {
  text-align: center;
  padding: 32px 0;
}

.success-icon {
  color: var(--accent-gold);
  margin-bottom: 16px;
}

.contact-success h2 {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--text-main);
  margin-bottom: 8px;
}

.contact-success p {
  color: var(--text-muted);
}
```

- [ ] **Step 3: Write `src/ResumeModal.jsx` and `src/ResumeModal.css`**

```javascript
// src/ResumeModal.jsx
import React, { useEffect } from 'react';
import { X, Printer, Download, Github, Mail, Globe } from 'lucide-react';
import { sounds } from './soundEffects';
import './ResumeModal.css';

export default function ResumeModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    sounds.playSoftClick();
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
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
              <h1 className="resume-name">KHUSHI</h1>
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
```

```css
/* src/ResumeModal.css */
.resume-modal-content {
  background: #1a080c;
  border: 1px solid rgba(227, 181, 190, 0.25);
  border-radius: 20px;
  width: 100%;
  max-width: 820px;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
  animation: scaleUp 0.3s var(--ease-luxury);
}

.resume-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background: #250d13;
  border-bottom: 1px solid rgba(227, 181, 190, 0.15);
  position: sticky;
  top: 0;
  z-index: 10;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--text-main);
  color: var(--bg-deep);
  font-weight: 600;
  font-size: 0.85rem;
}

.modal-close-static {
  color: var(--text-muted);
}

.modal-close-static:hover {
  color: var(--text-main);
}

.resume-sheet {
  padding: 48px;
  color: #222;
  background: #ffffff;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #9c474f;
  padding-bottom: 20px;
  margin-bottom: 24px;
}

.resume-name {
  font-family: 'Syne', sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  color: #1a080c;
  line-height: 1;
}

.resume-role {
  font-size: 1rem;
  color: #9c474f;
  font-weight: 600;
  margin-top: 4px;
}

.resume-contacts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  color: #555;
}

.resume-contacts span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.resume-section {
  margin-bottom: 24px;
}

.resume-section-heading {
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9c474f;
  border-bottom: 1px solid #ddd;
  padding-bottom: 4px;
  margin-bottom: 12px;
}

.resume-section p {
  font-size: 0.92rem;
  line-height: 1.6;
  color: #333;
}

.resume-skill-row {
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: #333;
}

.resume-item {
  margin-bottom: 14px;
}

.item-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
}

.item-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #111;
}

.item-tech,
.item-date {
  font-size: 0.82rem;
  color: #777;
  font-family: monospace;
}

.item-desc {
  font-size: 0.88rem;
  color: #444;
  line-height: 1.5;
}

@media print {
  .no-print { display: none !important; }
  .modal-backdrop { position: static; background: none; padding: 0; }
  .resume-modal-content { max-width: 100%; border: none; box-shadow: none; }
  .resume-sheet { padding: 0; }
}
```

- [ ] **Step 4: Create `src/App.jsx` and `src/main.jsx`**

```javascript
// src/App.jsx
import React, { useState } from 'react';
import HeroSection from './HeroSection';
import ProjectsSection from './ProjectsSection';
import AboutSection from './AboutSection';
import ContactSection from './ContactSection';
import ContactModal from './ContactModal';
import ResumeModal from './ResumeModal';
import './index.css';

export default function App() {
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
```

```javascript
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 5: Commit Contact Section, Modals, and App Wiring**

```bash
git add src/ContactSection.jsx src/ContactSection.css src/ContactModal.jsx src/ContactModal.css src/ResumeModal.jsx src/ResumeModal.css src/App.jsx src/main.jsx
git commit -m "feat: complete application wiring with contact section, inquiry modal, and printable resume"
```

---

### Task 8: Verification, Vite Build & Test Audit

**Files:**
- Test: `npm run build`
- Verify: Canvas frame loading, layout responsiveness, and modal interactivity

- [ ] **Step 1: Execute Vite production build**

Run: `npm run build`  
Expected: Output prints `dist/index.html`, `dist/assets/...`, zero compilation errors, exit code 0.

- [ ] **Step 2: Run verification script to confirm all assets and deliverables exist**

Run: `python scripts/test_frames.py`  
Expected: `PASS: All 65 WebP frames are verified!`

- [ ] **Step 3: Commit final build artifacts & push clean state**

```bash
git add -A
git commit -m "chore: verify production build and complete portfolio implementation"
```
