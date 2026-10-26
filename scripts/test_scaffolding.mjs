import fs from 'fs';
import { sounds } from '../src/soundEffects.js';
import useScrollReveal from '../src/useScrollReveal.js';

// 1. Verify soundEffects
console.assert(sounds !== undefined, 'sounds should exist');
console.assert(typeof sounds.playSoftClick === 'function', 'playSoftClick should be function');
console.assert(typeof sounds.playChime === 'function', 'playChime should be function');
console.assert(typeof sounds.toggleMute === 'function', 'toggleMute should be function');
sounds.playSoftClick();
sounds.playChime();
console.assert(sounds.toggleMute() === true, 'toggleMute should mute');
console.assert(sounds.toggleMute() === false, 'toggleMute should unmute');

// 2. Verify useScrollReveal
console.assert(typeof useScrollReveal === 'function', 'useScrollReveal should be function');

// 3. Verify CSS variables in src/index.css
const css = fs.readFileSync('src/index.css', 'utf-8');
const requiredVars = [
  '--canvas-bg',
  '--bg-deep',
  '--bg-card',
  '--bg-card-hover',
  '--border-subtle',
  '--border-focus',
  '--text-main',
  '--text-muted',
  '--accent-blush',
  '--accent-gold',
  '--accent-glow',
  '--font-display',
  '--font-body',
  '--font-mono',
  '--ease-luxury'
];
for (const v of requiredVars) {
  if (!css.includes(v)) {
    throw new Error(`Missing CSS variable: ${v}`);
  }
}

// 4. Verify index.html fonts and structure
const html = fs.readFileSync('index.html', 'utf-8');
if (!html.includes('id="root"')) throw new Error('Missing #root');
if (!html.includes('/src/main.jsx')) throw new Error('Missing /src/main.jsx');
if (!html.includes('Cinzel') || !html.includes('Syne') || !html.includes('Plus+Jakarta+Sans')) {
  throw new Error('Missing Google Font linkages');
}

// 5. Verify package.json dependencies
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
if (!pkg.dependencies.react || !pkg.dependencies['react-dom'] || !pkg.dependencies['lucide-react']) {
  throw new Error('Missing dependencies in package.json');
}
if (!pkg.devDependencies.vite || !pkg.devDependencies['@vitejs/plugin-react']) {
  throw new Error('Missing devDependencies in package.json');
}

console.log('PASS: All scaffolding and design foundations verified!');
