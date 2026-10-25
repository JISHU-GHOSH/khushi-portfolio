# Design Specification: Khushi Interactive Portfolio Website

- **Date**: 2026-10-26
- **Status**: Validated & Approved
- **Subject**: Khushi — Software Engineer & Creative Developer
- **GitHub Profile**: [khushigsd2924-design](https://github.com/khushigsd2924-design)
- **Source Video**: `C:\khushi_porfolio\Character_tracking_mouse_cursor_1080p_20261026042114.mp4`

---

## 1. Executive Summary

This project delivers an award-winning, luxury interactive portfolio website for **Khushi**, a Software Engineer & Creative Developer. It combines an ultra-smooth 60 FPS HTML5 canvas character-tracking hero section (matching the standard established in [JISHU-GHOSH/my-portfolio](https://github.com/JISHU-GHOSH/my-portfolio) and [JISHU-GHOSH/riya-portfolio](https://github.com/JISHU-GHOSH/riya-portfolio)) with a full-suite personal website showcasing her real-world projects from [khushigsd2924-design](https://github.com/khushigsd2924-design).

---

## 2. Character Tracking & Video Pipeline

### 2.1 Video Input Specifications
- **File**: `C:\khushi_porfolio\Character_tracking_mouse_cursor_1080p_20261026042114.mp4`
- **Resolution**: 1920 × 1080 pixels
- **Frame Rate**: 24.0 FPS (240 total frames)
- **Dominant Tone**: Dusty Rose / Mauve Burgundy (`#9c474f` / `#9a464e`)

### 2.2 Automated Frame Extraction & Inpainting
A Python script (`scripts/extract_khushi_frames.py`) using `opencv-python` and `numpy`:
1. **Watermark Inpainting**: Cleans the Kling AI sparkle icon in the bottom-right quadrant (`y: 780..1020, x: 1600..1880`) using `cv2.inpaint(img, mask, inpaintRadius=6, flags=cv2.INPAINT_TELEA)`.
2. **Neutral Center Eye-Contact**: Extracted from Frame 0 and saved as `public/frames/center.webp` at quality 92.
3. **64-Frame Circular Trajectory**: Mapped continuously counter-clockwise ($0^\circ \to 360^\circ$):
   - $0^\circ \to 45^\circ$ (Viewer Right $\to$ Up-Right): Frames 10, 13, 16, 19, 22, 25, 28, 31
   - $45^\circ \to 90^\circ$ (Up-Right $\to$ Up): Frames 33, 35, 37, 39, 41, 43, 45, 47
   - $90^\circ \to 135^\circ$ (Up $\to$ Up-Left): Frames 138, 141, 144, 147, 150, 153, 156, 159
   - $135^\circ \to 180^\circ$ (Up-Left $\to$ Viewer Left): Frames 162, 166, 170, 174, 178, 183, 188, 193
   - $180^\circ \to 225^\circ$ (Viewer Left $\to$ Down-Left): Frames 196, 185, 175, 165, 130, 125, 122, 120
   - $225^\circ \to 270^\circ$ (Down-Left $\to$ Down): Frames 118, 116, 114, 112, 110, 108, 106, 104
   - $270^\circ \to 315^\circ$ (Down $\to$ Down-Right): Frames 102, 100, 95, 90, 85, 80, 75, 70
   - $315^\circ \to 360^\circ/0^\circ$ (Down-Right $\to$ Right): Frames 65, 58, 50, 42, 30, 20, 15, 10
4. Output format: WebP (`000.webp` through `063.webp`) stored in `public/frames/`. Total payload $\le 2.5\text{ MB}$.

### 2.3 HTML5 Canvas 60 FPS Engine (`CharacterCanvas.jsx`)
- Full-bleed `<canvas>` with device pixel ratio scaling (`Math.min(window.devicePixelRatio, 2)`).
- **Face Center Anchor**: $(X = 0.50, Y = 0.38)$.
- **Deadzone Detection**: Cursor Euclidean distance $< 0.12$ of screen viewport locks immediately into `center.webp` for direct eye-to-eye gaze.
- **Shortest-Path Circular Physics**:
  $$\theta = \text{atan2}(-dy, dx)$$
  - Normalizes target angle to $[0, 64)$ frame space.
  - Shortest delta $\Delta \theta = (\theta_{\text{target}} - \theta_{\text{current}})$ clamped to $[-32, 32]$ to eliminate 359° $\to$ 0° long-way spins.
  - Dynamic lerp factor ($0.22$) with dynamic 3-frame settling deceleration (`MAX_FRAME_STEP = 2.8`).
- **Touch Interaction**: Instantaneous touch gaze orientation; on release, smooth lerp drift back to center eye-contact over 350ms.
- **Render Guard**: Zero alpha ghosting by rendering exactly one discrete cached image per tick against `#9c474f` canvas fill.

---

## 3. Design System & Visual Aesthetics

### 3.1 Color Palette
- **Canvas Base & Video Background**: `#9c474f` (warm dusty rose / mauve)
- **Deep Luxury Accents**: `#1a080c` (deep wine noir), `#2d1217` (velvet mahogany)
- **Primary Body Text**: `#fcf7f8` (warm porcelain cream)
- **Muted Elements & Borders**: `#dfb2b9` (muted rose blush)
- **Glow & Badges**: `#f7c69d` (golden champagne warmth)
- **Glassmorphism**: `rgba(45, 18, 23, 0.75)` with `backdrop-filter: blur(16px)`

### 3.2 Typography
- **Headlines / Display**: `Syne`, `Playfair Display`, serif fallback
- **Body & Controls**: `Plus Jakarta Sans`, `Inter`, sans-serif fallback
- **Code & Tech Badges**: `JetBrains Mono`, `Space Mono`, monospace fallback

---

## 4. Application Architecture & Components

```
src/
├── App.jsx                     # Top-level state (contact & resume modals)
├── main.jsx                    # Vite bootstrap entry
├── index.css                   # Global variables, typography, keyframes & reset
├── soundEffects.js             # Web Audio API synthesizers (chime, click, hover)
├── useScrollReveal.js          # IntersectionObserver reveal hooks
├── CharacterCanvas.jsx         # 60 FPS gaze-tracking canvas renderer
│
├── HeroSection.jsx             # Hero display, navigation, title typography, CTA buttons
│   ├── HeroSection.css
│   ├── SpeechBubble.jsx        # Interactive speech quote bubble with status pills
│   └── SpeechBubble.css
│
├── ProjectsSection.jsx         # Project showcase grid & category filters
│   ├── ProjectsSection.css
│   ├── ProjectModal.jsx        # Deep-dive interactive drawer / modal for project details
│   └── ProjectModal.css
│
├── AboutSection.jsx            # Biography, technical toolkit, engineering timeline
│   └── AboutSection.css
│
├── ContactSection.jsx          # Editorial contact footer, copy email button, social pills
│   └── ContactSection.css
│
├── ContactModal.jsx            # "Send a Message to Khushi" interactive inquiry dialog
│   └── ContactModal.css
│
└── ResumeModal.jsx             # Curriculum Vitae interactive modal with print view
    └── ResumeModal.css
```

---

## 5. Featured Projects (From `khushigsd2924-design`)

1. **Reading History**
   - **Role**: Creator & Full-Stack Developer
   - **Tech**: TypeScript, React 18, Tailwind CSS, Supabase, Lucide React, Vite
   - **Description**: Production-ready reading tracking and book analytics web application featuring live reading goals, cloud synchronization, and responsive book management.
   - **Repository**: [khushigsd2924-design/Reading_History](https://github.com/khushigsd2924-design/Reading_History)

2. **Code With AI Quiz**
   - **Role**: Frontend Developer
   - **Tech**: JavaScript (ES6+), Modern CSS3, HTML5 Canvas
   - **Description**: Interactive browser-based assessment platform presenting timed challenges on AI principles, programming algorithms, and computer science fundamentals.
   - **Repository**: [khushigsd2924-design/quiz-app-code-with-ai](https://github.com/khushigsd2924-design/quiz-app-code-with-ai)

3. **Student Marks Analysis Engine**
   - **Role**: Software Developer
   - **Tech**: Python 3, Statistical Algorithms, Report Generation
   - **Description**: Academic metrics processor computing aggregate scores, percentiles, grade band distributions, and automated performance summaries.
   - **Repository**: [khushigsd2924-design/messy-python-refactoring](https://github.com/khushigsd2924-design/messy-python-refactoring)

4. **Python Unit Testing & Defect Lifecycle Harness**
   - **Role**: QA & Software Engineer
   - **Tech**: Python, Pytest, Unit Testing, TDD
   - **Description**: Comprehensive debugging harness demonstrating the Red $\to$ Fix $\to$ Green test-driven cycle, regression tests, and code auditing.
   - **Repository**: [khushigsd2924-design/buggy-python-debugging](https://github.com/khushigsd2924-design/buggy-python-debugging)

5. **C++ Struct to Python Dict Converter**
   - **Role**: Systems & Scripting Developer
   - **Tech**: Python, C++ Concepts, Data Structures
   - **Description**: Memory record mapping utility enabling seamless structured transformation of low-level C++ schemas into verified Python dictionaries.
   - **Repository**: [khushigsd2924-design/python-basics-struct-to-dict](https://github.com/khushigsd2924-design/python-basics-struct-to-dict)

---

## 6. Verification & Quality Gates

1. **Extraction Verification**: Ensure all 64 directional frames (`000.webp`..`063.webp`) and `center.webp` exist, are non-empty, and have the watermark cleanly inpainted.
2. **Build Verification**: Run `npm run build` with Vite to ensure zero compilation or JSX syntax errors.
3. **Canvas Performance**: Verify 60 FPS rendering in the browser without memory leaks or double-frame ghosting.
4. **Responsive Layout**: Test desktop, tablet, and mobile viewport breakpoints.
5. **Interactive Modals**: Verify Contact and Resume modals open, render cleanly, and close smoothly.
