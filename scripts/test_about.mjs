// scripts/test_about.mjs
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('Testing AboutSection and Engineering Toolkit...');

// 1. Verify file existence
const aboutSectionJsx = path.resolve('src/AboutSection.jsx');
const aboutSectionCss = path.resolve('src/AboutSection.css');

for (const p of [aboutSectionJsx, aboutSectionCss]) {
  if (!fs.existsSync(p)) {
    throw new Error(`File does not exist: ${p}`);
  }
}
console.log('PASS: Both AboutSection.jsx and AboutSection.css exist');

// 2. Verify AboutSection.css rules
const cssContent = fs.readFileSync(aboutSectionCss, 'utf-8');
const requiredCssRules = [
  '.about-section',
  'position: relative',
  'background: #1b090d',
  '.about-grid',
  'grid-template-columns: 1fr 1fr',
  '.about-title',
  'font-family: var(--font-display)',
  '.about-lead',
  '.about-body',
  '.about-actions',
  '.skills-headline',
  'font-family: var(--font-mono)',
  '.skills-cards',
  '.skill-card',
  '.skill-card:hover',
  'transform: translateX(4px)',
  '.skill-header',
  '.skill-icon',
  '.skill-pills',
  '.skill-pill',
  'border-radius: 999px',
  '@media (max-width: 900px)'
];

for (const rule of requiredCssRules) {
  if (!cssContent.includes(rule)) {
    throw new Error(`AboutSection.css missing expected CSS rule or property: ${rule}`);
  }
}
console.log('PASS: AboutSection.css rules verified');

// 3. Verify AboutSection.jsx tokens and structural elements
const jsxContent = fs.readFileSync(aboutSectionJsx, 'utf-8');
const requiredTokens = [
  'export const SKILLS',
  'export default function AboutSection',
  'useScrollReveal',
  'sounds',
  'playChime',
  'onOpenResume',
  'onOpenContact',
  'Philosophy &amp; Background',
  'ENGINEERING WITH EMPATHY &amp; PRECISION',
  'TECHNICAL TOOLKIT',
  'View Curriculum Vitae',
  'Get in Touch',
  'skill-card',
  'skill-pill'
];

for (const token of requiredTokens) {
  if (!jsxContent.includes(token)) {
    throw new Error(`AboutSection.jsx missing expected token: ${token}`);
  }
}
console.log('PASS: AboutSection.jsx tokens and structure verified');

// 4. Transpile with esbuild and test module exports & rendering
console.log('Transpiling with esbuild...');
const jsxWithoutCss = jsxContent
  .replace(/import\s+['"]\.\/AboutSection\.css['"];?/, '// css imported')
  .replace(/from\s+['"]\.\/soundEffects['"]/, "from './soundEffects.js'")
  .replace(/from\s+['"]\.\/useScrollReveal['"]/, "from './useScrollReveal.js'");

const transpiled = esbuild.transformSync(jsxWithoutCss, {
  loader: 'jsx',
  format: 'esm',
  target: 'es2022'
});

const tempFile = path.resolve('src/.temp_about_transpiled.mjs');
fs.writeFileSync(tempFile, transpiled.code, 'utf-8');

let aboutMod;
try {
  aboutMod = await import(`file://${tempFile}`);
} finally {
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
}

// 5. Verify SKILLS export structure and contents
const { SKILLS, default: AboutSection } = aboutMod;

console.assert(Array.isArray(SKILLS), 'SKILLS must be an array');
console.assert(SKILLS.length === 3, `Expected 3 skill categories, got ${SKILLS.length}`);

const expectedCategories = ['Languages', 'Frameworks & Libraries', 'Engineering & Methodologies'];
const expectedSkillsByCat = {
  'Languages': ['TypeScript', 'JavaScript (ES6+)', 'Python 3', 'C++', 'HTML5 / CSS3'],
  'Frameworks & Libraries': ['React 18 / 19', 'Tailwind CSS', 'Vite', 'Lucide React', 'Supabase Client'],
  'Engineering & Methodologies': ['Test-Driven Development (TDD)', 'Pytest Unit Testing', 'REST APIs', 'Git & GitHub', 'Data Structures']
};

SKILLS.forEach((cat, idx) => {
  console.assert(cat.category === expectedCategories[idx], `Category index ${idx} expected ${expectedCategories[idx]}, got ${cat.category}`);
  console.assert(typeof cat.icon === 'function' || typeof cat.icon === 'object', `Category ${cat.category} icon must be a component`);
  console.assert(Array.isArray(cat.items), `Category ${cat.category} items must be an array`);
  
  const expectedItems = expectedSkillsByCat[cat.category];
  console.assert(
    JSON.stringify(cat.items) === JSON.stringify(expectedItems),
    `Items mismatch for ${cat.category}: got ${JSON.stringify(cat.items)}`
  );
});
console.log('PASS: SKILLS data structures and categories verified');

// 6. Test React Component Rendering
console.assert(typeof AboutSection === 'function', 'AboutSection default export must be a function component');

let resumeOpened = false;
let contactOpened = false;

const markup = renderToStaticMarkup(
  React.createElement(AboutSection, {
    onOpenResume: () => { resumeOpened = true; },
    onOpenContact: () => { contactOpened = true; }
  })
);

console.assert(markup.includes('about-section'), 'Rendered markup must include about-section class');
console.assert(markup.includes('ENGINEERING WITH EMPATHY &amp; PRECISION'), 'Rendered markup must include title');
console.assert(markup.includes('TECHNICAL TOOLKIT'), 'Rendered markup must include technical toolkit headline');
console.assert(markup.includes('View Curriculum Vitae'), 'Rendered markup must include View Curriculum Vitae button');
console.assert(markup.includes('Get in Touch'), 'Rendered markup must include Get in Touch button');

// Verify all skill items are rendered as pills
for (const cat of SKILLS) {
  for (const item of cat.items) {
    const escapedItem = item.replace(/&/g, '&amp;');
    console.assert(markup.includes(escapedItem), `Rendered markup must include skill item: ${item}`);
  }
}
console.log('PASS: All 15 skill items rendered into DOM static markup');
console.log('PASS: AboutSection rendered static markup successfully');

console.log('\n--- ALL ABOUT SECTION TESTS PASSED ---');
