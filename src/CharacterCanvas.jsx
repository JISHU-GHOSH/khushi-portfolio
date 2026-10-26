// src/CharacterCanvas.jsx
import { useRef, useEffect } from 'react';
import './CharacterCanvas.css';

const NUM_FRAMES = 64;
const DEADZONE_RADIUS = 0.12;
const BG_COLOR = '#9c474f';
const FACE_CENTER_X = 0.50;
const FACE_CENTER_Y = 0.38;

const FRAME_LERP = 0.15;
const MAX_FRAME_STEP = 1.0;
const ASPECT_RATIO = 1920 / 1080;

export {
  NUM_FRAMES,
  DEADZONE_RADIUS,
  BG_COLOR,
  FACE_CENTER_X,
  FACE_CENTER_Y,
  FRAME_LERP,
  MAX_FRAME_STEP,
  ASPECT_RATIO,
};

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
    targetMouseX: FACE_CENTER_X,
    targetMouseY: FACE_CENTER_Y,
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
        s.targetMouseX = e.clientX / window.innerWidth;
        s.targetMouseY = e.clientY / window.innerHeight;
      }
    };

    const onTouchStart = (e) => {
      if (window.scrollY > window.innerHeight * 0.8) return;
      if (e.touches && e.touches[0] && window.innerWidth > 0 && window.innerHeight > 0) {
        isTouching = true;
        if (touchReturnRaf) cancelAnimationFrame(touchReturnRaf);
        s.targetMouseX = e.touches[0].clientX / window.innerWidth;
        s.targetMouseY = e.touches[0].clientY / window.innerHeight;
      }
    };

    const onTouchMove = (e) => {
      if (window.scrollY > window.innerHeight * 0.8) return;
      if (e.touches && e.touches[0] && window.innerWidth > 0 && window.innerHeight > 0) {
        isTouching = true;
        s.targetMouseX = e.touches[0].clientX / window.innerWidth;
        s.targetMouseY = e.touches[0].clientY / window.innerHeight;
      }
    };

    const onTouchEnd = () => {
      isTouching = false;
      if (window.scrollY > window.innerHeight * 0.8) return;

      function driftToCenter() {
        if (isTouching) return;
        const dx = FACE_CENTER_X - s.targetMouseX;
        const dy = FACE_CENTER_Y - s.targetMouseY;
        if (Math.abs(dx) > 0.005 || Math.abs(dy) > 0.005) {
          s.targetMouseX += dx * 0.12;
          s.targetMouseY += dy * 0.12;
          touchReturnRaf = requestAnimationFrame(driftToCenter);
        } else {
          s.targetMouseX = FACE_CENTER_X;
          s.targetMouseY = FACE_CENTER_Y;
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
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let last = -1;

    function render(ts) {
      if (window.scrollY > window.innerHeight * 1.2) {
        s.rafId = requestAnimationFrame(render);
        return;
      }

      s.rafId = requestAnimationFrame(render);

      if (last < 0) last = ts;
      const dt = Math.min(ts - last, 50) / 16.67;
      last = ts;

      const W = window.innerWidth;
      const H = window.innerHeight;
      if (W <= 0 || H <= 0) return;

      // Exponential smoothing on mouse pointer coordinates to eliminate micro-jitter
      const pointerLerp = 1 - Math.pow(1 - 0.22, dt);
      s.mouseX += (s.targetMouseX - s.mouseX) * pointerLerp;
      s.mouseY += (s.targetMouseY - s.mouseY) * pointerLerp;

      const faceCX = W * FACE_CENTER_X;
      const faceCY = H * FACE_CENTER_Y;

      const cx = s.mouseX * W;
      const cy = s.mouseY * H;
      const dx = cx - faceCX;
      const dy = cy - faceCY;

      const dist = Math.sqrt(dx * dx + dy * dy) / Math.min(W, H);
      // Deadzone smooth dissolve: prevents abrupt snap between eye-contact and directional gaze
      const deadzoneOuter = DEADZONE_RADIUS * 1.35;
      const deadzoneInner = DEADZONE_RADIUS * 0.65;
      let centerAlpha = 0;
      if (dist < deadzoneInner) {
        centerAlpha = 1.0;
        s.isCenter = true;
      } else if (dist < deadzoneOuter) {
        centerAlpha = (deadzoneOuter - dist) / (deadzoneOuter - deadzoneInner);
        s.isCenter = centerAlpha > 0.5;
      } else {
        centerAlpha = 0;
        s.isCenter = false;
      }

      s.targetAngle = Math.atan2(-dy, dx);

      let normTarget = s.targetAngle % (2 * Math.PI);
      if (normTarget < 0) normTarget += 2 * Math.PI;
      const targetFrame = (normTarget / (2 * Math.PI)) * NUM_FRAMES;

      let diff = targetFrame - s.smoothFrame;
      if (diff > NUM_FRAMES / 2) diff -= NUM_FRAMES;
      if (diff < -NUM_FRAMES / 2) diff += NUM_FRAMES;

      const lf = 1 - Math.pow(1 - FRAME_LERP, dt);
      const absDiff = Math.abs(diff);

      // Adaptive speed with smooth deceleration: fast tracking on large cursor leaps, micro-glide at rest
      const maxStep = Math.min(MAX_FRAME_STEP + (absDiff * 0.05), 2.2);
      const step = absDiff > 3
        ? Math.sign(diff) * Math.min(absDiff * lf * 1.5, maxStep)
        : Math.sign(diff) * Math.min(absDiff * lf, maxStep);

      s.smoothFrame = ((s.smoothFrame + step) % NUM_FRAMES + NUM_FRAMES) % NUM_FRAMES;

      // Sub-frame analog interpolation between adjacent frames (eliminates all discrete stepping)
      const fVal = ((s.smoothFrame % NUM_FRAMES) + NUM_FRAMES) % NUM_FRAMES;
      const idxA = Math.floor(fVal);
      const idxB = (idxA + 1) % NUM_FRAMES;
      const blendRatio = fVal - idxA;

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, W, H);

      // Helper function to draw an image covering viewport with aspect-ratio preservation
      function drawCover(image, alpha = 1.0) {
        if (!image || !image.complete || image.naturalWidth <= 0 || alpha <= 0.001) return;
        const iA = (image.naturalWidth && image.naturalHeight)
          ? (image.naturalWidth / image.naturalHeight)
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

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(image, dX, dY, dW, dH);
      }

      try {
        const imgA = s.frames[idxA];
        const imgB = s.frames[idxB];

        if (centerAlpha >= 0.999 && s.centerImg) {
          drawCover(s.centerImg, 1.0);
        } else {
          // Draw base directional frame A
          drawCover(imgA, 1.0);

          // Sub-frame cross-blend into frame B for 100% analog continuous rotation
          if (blendRatio > 0.01) {
            drawCover(imgB, blendRatio);
          }

          // Smoothly dissolve center eye-contact frame near deadzone
          if (centerAlpha > 0.01 && s.centerImg) {
            drawCover(s.centerImg, centerAlpha);
          }
        }
        ctx.globalAlpha = 1.0;
      } catch {
        ctx.globalAlpha = 1.0;
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
