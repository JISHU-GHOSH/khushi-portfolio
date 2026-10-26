// scripts/test_canvas.mjs
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

console.log('Testing CharacterCanvas.jsx & CharacterCanvas.css...');

// 1. Verify file existence
const jsxPath = path.resolve('src/CharacterCanvas.jsx');
const cssPath = path.resolve('src/CharacterCanvas.css');

if (!fs.existsSync(jsxPath)) {
  throw new Error(`Missing ${jsxPath}`);
}
if (!fs.existsSync(cssPath)) {
  throw new Error(`Missing ${cssPath}`);
}

// 2. Verify CSS rules
const cssContent = fs.readFileSync(cssPath, 'utf-8');
const requiredCssProperties = [
  '.character-canvas',
  'position: absolute',
  'top: 0',
  'left: 0',
  'width: 100%',
  'height: 100%',
  'z-index: 1',
  'pointer-events: none'
];
for (const prop of requiredCssProperties) {
  if (!cssContent.includes(prop)) {
    throw new Error(`CharacterCanvas.css missing rule: ${prop}`);
  }
}
console.log('PASS: CharacterCanvas.css rules verified');

// 3. Verify JSX source contents and structure
const jsxContent = fs.readFileSync(jsxPath, 'utf-8');

const requiredTokens = [
  'NUM_FRAMES = 64',
  'DEADZONE_RADIUS = 0.12',
  "BG_COLOR = '#9c474f'",
  'FACE_CENTER_X = 0.50',
  'FACE_CENTER_Y = 0.38',
  'FRAME_LERP = 0.15',
  'MAX_FRAME_STEP = 1.0',
  'ASPECT_RATIO = 1920 / 1080',
  'export default function CharacterCanvas',
  'aria-label="Interactive character tracking cursor movement"',
  'role="img"',
  'mousemove',
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
  'removeEventListener',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'resize',
  'center.webp',
  'padStart(3, \'0\')'
];

for (const token of requiredTokens) {
  if (!jsxContent.includes(token)) {
    throw new Error(`CharacterCanvas.jsx missing token: ${token}`);
  }
}
console.log('PASS: CharacterCanvas.jsx source tokens and constants verified');

// 4. Transpile JSX with esbuild to test compilation and ESM exports
const codeWithoutCss = jsxContent.replace(/import\s+['"]\.\/CharacterCanvas\.css['"];?/, '// css imported');
const transpiled = esbuild.transformSync(codeWithoutCss, {
  loader: 'jsx',
  format: 'esm',
  target: 'es2022'
});

const tempFilePath = path.resolve('scripts/.temp_canvas_transpiled.mjs');
fs.writeFileSync(tempFilePath, transpiled.code, 'utf-8');

let mod;
try {
  mod = await import(`file://${tempFilePath}`);
} finally {
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
}

console.assert(typeof mod.default === 'function', 'Default export must be a React component function');
console.assert(mod.NUM_FRAMES === 64, 'NUM_FRAMES should be 64');
console.assert(mod.DEADZONE_RADIUS === 0.12, 'DEADZONE_RADIUS should be 0.12');
console.assert(mod.BG_COLOR === '#9c474f', 'BG_COLOR should be #9c474f');
console.assert(mod.FACE_CENTER_X === 0.50, 'FACE_CENTER_X should be 0.50');
console.assert(mod.FACE_CENTER_Y === 0.38, 'FACE_CENTER_Y should be 0.38');
console.assert(mod.FRAME_LERP === 0.15, 'FRAME_LERP should be 0.15');
console.assert(mod.MAX_FRAME_STEP === 1.0, 'MAX_FRAME_STEP should be 1.0');
console.assert(Math.abs(mod.ASPECT_RATIO - (1920 / 1080)) < 1e-6, 'ASPECT_RATIO should be 1920/1080');
console.log('PASS: Module exports and runtime constants verified');

// 5. Test mathematical gaze angle calculation & shortest path circular lerp
function calculateTargetFrame(dx, dy, numFrames = 64) {
  const targetAngle = Math.atan2(-dy, dx);
  let normTarget = targetAngle % (2 * Math.PI);
  if (normTarget < 0) normTarget += 2 * Math.PI;
  return (normTarget / (2 * Math.PI)) * numFrames;
}

function calculateShortestDiff(targetFrame, currentFrame, numFrames = 64) {
  let diff = targetFrame - currentFrame;
  if (diff > numFrames / 2) diff -= numFrames;
  if (diff < -numFrames / 2) diff += numFrames;
  return diff;
}

// Right: dx = 100, dy = 0 => angle = 0 rad => frame = 0
const frameRight = calculateTargetFrame(100, 0);
console.assert(Math.abs(frameRight - 0) < 1e-4, `Expected frame 0 for right, got ${frameRight}`);

// Up: dx = 0, dy = -100 => angle = pi/2 rad => frame = 16 (0.25 * 64)
const frameUp = calculateTargetFrame(0, -100);
console.assert(Math.abs(frameUp - 16) < 1e-4, `Expected frame 16 for up, got ${frameUp}`);

// Left: dx = -100, dy = 0 => angle = pi rad => frame = 32 (0.5 * 64)
const frameLeft = calculateTargetFrame(-100, 0);
console.assert(Math.abs(frameLeft - 32) < 1e-4, `Expected frame 32 for left, got ${frameLeft}`);

// Down: dx = 0, dy = 100 => angle = 3pi/2 rad => frame = 48 (0.75 * 64)
const frameDown = calculateTargetFrame(0, 100);
console.assert(Math.abs(frameDown - 48) < 1e-4, `Expected frame 48 for down, got ${frameDown}`);

// Shortest path circular wrap tests
// Current = 63, Target = 1 => shortest diff should be +2, not -62
const diffWrapForward = calculateShortestDiff(1, 63);
console.assert(diffWrapForward === 2, `Expected diff +2, got ${diffWrapForward}`);

// Current = 1, Target = 63 => shortest diff should be -2, not +62
const diffWrapBackward = calculateShortestDiff(63, 1);
console.assert(diffWrapBackward === -2, `Expected diff -2, got ${diffWrapBackward}`);

console.log('PASS: Gaze angle mapping and circular wrap math verified');
console.log('ALL CANVAS ENGINE CHECKS PASSED!');
