# Khushi — Software Engineer & Creative Developer

[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Lenis](https://img.shields.io/badge/Lenis-Smooth_Scroll-black?style=flat-square)](https://github.com/darkroomengineering/lenis)
[![Tests](https://img.shields.io/badge/Tests-7%20Suites%20Passing-brightgreen?style=flat-square)](https://github.com/JISHU-GHOSH/khushi-portfolio)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

An award-winning luxury interactive portfolio featuring real-time 60 FPS HTML5 canvas cursor gaze-tracking, inertial momentum smooth scrolling, procedural audio synthesis, and an atmospheric velvet-wine visual aesthetic.

---

## ✨ Features & Engineering Highlights

### 👁️ 60 FPS Cursor-Tracking Character Canvas
- **Pure 1080p WebP Frames**: 64 high-resolution studio frames (`000.webp`–`063.webp`) plus a centered rest pose (`center.webp`) extracted directly from video without synthetic optical flow blurring or ghosting.
- **Fluid Gaze Physics**: Real-time Cartesian-to-polar angle translation with circular radian wrapping (`normTarget = (angle + 2π) % 2π`) and smooth frame interpolation governed by an adaptive velocity step limiter (`MAX_FRAME_STEP + (absDiff * 0.05)`).
- **Sub-Pixel Pointer Lerping**: Mouse coordinates are filtered via exponential damping (`1 - Math.pow(1 - 0.22, dt)`) to eliminate micro-jitter while tracking fast cursor sweeps.
- **High-DPI Retina Rendering**: Automatically scales for device pixel ratios (`dpr = Math.min(window.devicePixelRatio, 2)`) with high-quality bicubic smoothing.

### 🌊 Inertial Momentum Smooth Scrolling (Lenis)
- Integrated [Lenis](https://github.com/darkroomengineering/lenis) for 60/120 FPS momentum-driven scrolling across Windows, macOS, and Linux.
- Custom exponential luxury easing (`cubic-bezier(0.16, 1, 0.3, 1)`) with zero-snap anchor navigation for internal links (`#projects`, `#about`).
- Dynamic viewport observer that pauses smooth scrolling while modals are open to guarantee clean backdrop locking.

### 🎨 Atmospheric Visual Identity & Analog Film Grain
- **Luxury Editorial Color System**: Deep velvet wine (`#16070a`), dusty rose canvas background (`#9c474f`), champagne gold accents (`#f8c8a0`), and blush highlights (`#e3b5be`).
- **Organic Canvas-to-Body Blend**: Hero section exits through a multi-stop vertical gradient dissolving into a 4-point radial ambient mesh in `.portfolio-content`.
- **Analog SVG Film Grain**: Fixed non-blocking procedural SVG fractal noise (`feTurbulence`) overlay eliminating digital color banding with zero GPU or battery overhead.
- **Jitter-Free Scroll Indicator**: Capsule track featuring a continuously gliding champagne gradient pulse.

### 💼 Featured Projects
Showcases production and algorithmic projects sourced from [`khushigsd2924-design`](https://github.com/khushigsd2924-design):
1. **Reading History** — Full-stack book tracker & reading analytics platform (TypeScript, React 18, Tailwind, Supabase).
2. **Code With AI Quiz** — Interactive CS & AI assessment application with live scoring and zero runtime dependencies.
3. **Student Marks Analysis Engine** — Python academic performance analyzer computing distributions, percentiles, and class toppers.
4. **TDD Defect Lifecycle Harness** — Test-driven development verification suite illustrating the Red $\to$ Fix $\to$ Green lifecycle.
5. **Clean Code & Software Engineering Labs** — Architecture and refactoring case studies prioritizing modularity and enterprise testing.

### 🔊 Procedural Web Audio Engine
- Built with the native Web Audio API — zero external `.mp3` or `.wav` dependencies.
- Synthesizes organic high-frequency click transients, harmonic chime chords, and ambient resonant feedback with an intuitive global mute toggle.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Smooth Scrolling**: [Lenis 1.3](https://github.com/darkroomengineering/lenis)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Graphics & Physics**: HTML5 Canvas 2D API + RequestAnimationFrame loop
- **Typography**: Syne (Display), Plus Jakarta Sans (Body), JetBrains Mono (Technical)
- **Styling**: Modern CSS3 (CSS variables, backdrop-filter blur, CSS Grid, clamp)
- **Testing**: Node.js ESM verification suites + Python 3 frame integrity suite

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- `npm` (v9.0.0 or higher)
- Optional: Python 3 with `opencv-python` and `Pillow` (if re-extracting frames from source video)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JISHU-GHOSH/khushi-portfolio.git
   cd khushi-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the entire verification suite (all 7 suites execute in under 10 seconds):

```bash
npm test
```

The test harness verifies:
1. `scripts/test_scaffolding.mjs` — CSS variables, typography, and palette foundations.
2. `scripts/test_canvas.mjs` — Gaze angle mapping, wrapping physics, and step governor math.
3. `scripts/test_hero.mjs` — Hero structure, SpeechBubble cyclic rotation, and sound hooks.
4. `scripts/test_projects.mjs` — Project schemas, GitHub URL validations, modal rendering, and filtering logic.
5. `scripts/test_about.mjs` — Skills taxonomy and responsive grid rendering.
6. `scripts/test_app.mjs` — Contact modal, Resume/CV print layouts, and App root orchestration.
7. `scripts/test_frames.py` — Integrity check of all 65 WebP frames.

---

## 📦 Production Build

Compile the optimized production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 📁 Repository Structure

```text
khushi-portfolio/
├── public/
│   └── frames/                 # 64 pure raw 1080p WebP gaze frames + center.webp
├── scripts/
│   ├── extract_khushi_frames.py # Frame extraction pipeline with watermark inpainting
│   ├── test_scaffolding.mjs    # Foundation tests
│   ├── test_canvas.mjs         # Canvas engine & math tests
│   ├── test_hero.mjs           # Hero & speech bubble tests
│   ├── test_projects.mjs       # Projects section & modal tests
│   ├── test_about.mjs          # About section & skills tests
│   ├── test_app.mjs            # Root app & modal orchestration tests
│   └── test_frames.py          # Frame resolution & integrity verification
├── src/
│   ├── AboutSection.css
│   ├── AboutSection.jsx        # Philosophy & technical skill taxonomy
│   ├── App.jsx                 # Root layout & modal coordinator
│   ├── CharacterCanvas.css
│   ├── CharacterCanvas.jsx     # 60 FPS gaze tracking canvas engine
│   ├── ContactModal.css
│   ├── ContactModal.jsx        # Direct message modal dialog
│   ├── ContactSection.css
│   ├── ContactSection.jsx      # Footer & contact call-to-action
│   ├── HeroSection.css
│   ├── HeroSection.jsx         # Full-viewport hero with speech bubble & nav
│   ├── ProjectModal.css
│   ├── ProjectModal.jsx        # Detailed project modal with features & links
│   ├── ProjectsSection.css
│   ├── ProjectsSection.jsx     # Featured work grid with category filters
│   ├── ResumeModal.css
│   ├── ResumeModal.jsx         # Printable Curriculum Vitae modal
│   ├── soundEffects.js         # Procedural Web Audio API sound generator
│   ├── SpeechBubble.css
│   ├── SpeechBubble.jsx        # Interactive floating thought bubble
│   ├── useLenis.js             # Lenis momentum smooth scroll hook
│   ├── useScrollReveal.js      # IntersectionObserver entrance animator
│   ├── index.css               # Global tokens, luxury film grain & reset
│   └── main.jsx                # React root entrypoint
├── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
