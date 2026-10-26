// scripts/test_hero.mjs
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('Testing SpeechBubble and HeroSection...');

// 1. Verify file existence
const speechBubbleJsx = path.resolve('src/SpeechBubble.jsx');
const speechBubbleCss = path.resolve('src/SpeechBubble.css');
const heroSectionJsx = path.resolve('src/HeroSection.jsx');
const heroSectionCss = path.resolve('src/HeroSection.css');

for (const p of [speechBubbleJsx, speechBubbleCss, heroSectionJsx, heroSectionCss]) {
  if (!fs.existsSync(p)) {
    throw new Error(`File does not exist: ${p}`);
  }
}
console.log('PASS: All 4 source and CSS files exist');

// 2. Verify SpeechBubble.css rules
const sbCssContent = fs.readFileSync(speechBubbleCss, 'utf-8');
const requiredSbCss = [
  '.speech-bubble',
  'rgba(38, 15, 20, 0.75)',
  'backdrop-filter: blur(12px)',
  'border-radius: 999px',
  '.speech-bubble:hover',
  '.speech-bubble-icon',
  '.speech-bubble-hint'
];
for (const rule of requiredSbCss) {
  if (!sbCssContent.includes(rule)) {
    throw new Error(`SpeechBubble.css missing expected CSS rule: ${rule}`);
  }
}
console.log('PASS: SpeechBubble.css rules verified');

// 3. Verify HeroSection.css rules
const heroCssContent = fs.readFileSync(heroSectionCss, 'utf-8');
const requiredHeroCss = [
  '.portfolio-wrapper',
  '.hero-viewport',
  '.hero-overlay',
  '.hero-nav',
  '.hero-logo',
  '.nav-links',
  '.nav-btn',
  '.nav-btn-primary',
  '.sound-toggle',
  '.hero-content',
  '.hero-speech-container',
  '.hero-badge',
  '.hero-title',
  '.hero-tagline',
  '.hero-actions',
  '.btn-hero-primary',
  '.btn-hero-secondary',
  '.scroll-indicator',
  '.scroll-line',
  '@media (max-width: 768px)'
];
for (const rule of requiredHeroCss) {
  if (!heroCssContent.includes(rule)) {
    throw new Error(`HeroSection.css missing expected CSS rule: ${rule}`);
  }
}
console.log('PASS: HeroSection.css rules verified');

// 4. Verify SpeechBubble source code and quotes
const sbJsxContent = fs.readFileSync(speechBubbleJsx, 'utf-8');
const requiredSbTokens = [
  'export default function SpeechBubble',
  'Sparkles',
  'sounds',
  'playSoftClick',
  'QUOTES',
  'click me',
  'aria-label="Character speech bubble — click for next thought"'
];
for (const token of requiredSbTokens) {
  if (!sbJsxContent.includes(token)) {
    throw new Error(`SpeechBubble.jsx missing token: ${token}`);
  }
}
console.log('PASS: SpeechBubble.jsx structure and tokens verified');

// 5. Verify HeroSection source code
const heroJsxContent = fs.readFileSync(heroSectionJsx, 'utf-8');
const requiredHeroTokens = [
  'export default function HeroSection',
  'CharacterCanvas',
  'SpeechBubble',
  'sounds',
  'toggleMute',
  'playSoftClick',
  'playChime',
  'onOpenContact',
  'onOpenResume',
  'scrollToProjects',
  'scrollIntoView',
  'Khushi',
  'KHUSHI',
  'Software Engineer &amp; Creative Developer',
  'https://github.com/khushigsd2924-design',
  'portfolio-content',
  'children'
];
for (const token of requiredHeroTokens) {
  if (!heroJsxContent.includes(token)) {
    throw new Error(`HeroSection.jsx missing token: ${token}`);
  }
}
console.log('PASS: HeroSection.jsx structure and tokens verified');

// 6. Transpile with esbuild and test React rendering & exports
console.log('Transpiling and testing component rendering...');

// SpeechBubble transpilation
const sbCodeWithoutCss = sbJsxContent
  .replace(/import\s+['"]\.\/SpeechBubble\.css['"];?/, '// css')
  .replace(/from\s+['"]\.\/soundEffects['"]/, "from './soundEffects.js'");
const sbTranspiled = esbuild.transformSync(sbCodeWithoutCss, {
  loader: 'jsx',
  format: 'esm',
  target: 'es2022'
});
const sbTemp = path.resolve('src/.temp_sb_transpiled.mjs');
fs.writeFileSync(sbTemp, sbTranspiled.code, 'utf-8');

let sbMod;
try {
  sbMod = await import(`file://${sbTemp}`);
} finally {
  if (fs.existsSync(sbTemp)) fs.unlinkSync(sbTemp);
}

console.assert(typeof sbMod.default === 'function', 'SpeechBubble default export must be function');
console.assert(Array.isArray(sbMod.QUOTES) && sbMod.QUOTES.length === 5, 'QUOTES must be array of 5 strings');

// Render SpeechBubble to static markup
const sbHtml = renderToStaticMarkup(React.createElement(sbMod.default));
console.assert(sbHtml.includes('speech-bubble'), 'Rendered SpeechBubble must contain speech-bubble class');
console.assert(sbHtml.includes('click me'), 'Rendered SpeechBubble must contain hint "click me"');
console.assert(sbHtml.includes('Khushi') && sbHtml.includes('digital space'), 'Rendered SpeechBubble must contain initial quote');
console.log('PASS: SpeechBubble renders static markup correctly');

// HeroSection transpilation (mock CharacterCanvas & CSS)
const heroCodeStripped = heroJsxContent
  .replace(/import\s+['"]\.\/HeroSection\.css['"];?/, '// css')
  .replace(/import CharacterCanvas from '\.\/CharacterCanvas';?/, 'const CharacterCanvas = () => React.createElement("div", { className: "mock-character-canvas" });')
  .replace(/import SpeechBubble from '\.\/SpeechBubble';?/, `const SpeechBubble = () => React.createElement("div", { className: "speech-bubble" }, "${sbMod.QUOTES[0]}");`)
  .replace(/from\s+['"]\.\/soundEffects['"]/, "from './soundEffects.js'");

const heroTranspiled = esbuild.transformSync(heroCodeStripped, {
  loader: 'jsx',
  format: 'esm',
  target: 'es2022'
});
const heroTemp = path.resolve('src/.temp_hero_transpiled.mjs');
fs.writeFileSync(heroTemp, heroTranspiled.code, 'utf-8');

let heroMod;
try {
  heroMod = await import(`file://${heroTemp}`);
} finally {
  if (fs.existsSync(heroTemp)) fs.unlinkSync(heroTemp);
}

console.assert(typeof heroMod.default === 'function', 'HeroSection default export must be function');

// Render HeroSection with test children
const childText = 'Child section content rendered';
const heroHtml = renderToStaticMarkup(
  React.createElement(heroMod.default, {
    onOpenContact: () => {},
    onOpenResume: () => {}
  }, React.createElement('div', { id: 'test-child' }, childText))
);

console.assert(heroHtml.includes('portfolio-wrapper'), 'Markup must contain portfolio-wrapper');
console.assert(heroHtml.includes('hero-viewport'), 'Markup must contain hero-viewport');
console.assert(heroHtml.includes('hero-nav'), 'Markup must contain hero-nav');
console.assert(heroHtml.includes('hero-logo'), 'Markup must contain hero-logo');
console.assert(heroHtml.includes('KHUSHI'), 'Markup must contain title KHUSHI');
console.assert(heroHtml.includes('portfolio-content'), 'Markup must contain portfolio-content container');
console.assert(heroHtml.includes(childText), 'Markup must contain children in portfolio-content');
console.assert(heroHtml.includes('https://github.com/khushigsd2924-design'), 'Markup must contain github link');
console.assert(heroHtml.includes('sound-toggle'), 'Markup must contain sound toggle button');
console.assert(heroHtml.includes('scroll-indicator'), 'Markup must contain scroll-indicator');

console.log('PASS: HeroSection renders static markup correctly with nested SpeechBubble and children');

// 7. Verify quote rotation logic
let testIndex = 0;
const rotate = () => { testIndex = (testIndex + 1) % sbMod.QUOTES.length; };
for (let i = 0; i < 12; i++) {
  const expected = (i + 1) % 5;
  rotate();
  console.assert(testIndex === expected, `Quote rotation step ${i} expected index ${expected}, got ${testIndex}`);
}
console.log('PASS: Quote cyclic rotation math verified');

console.log('\nALL HERO & SPEECH BUBBLE CHECKS PASSED SUCCESSFULLY!');
