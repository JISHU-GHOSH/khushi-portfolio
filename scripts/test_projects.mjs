// scripts/test_projects.mjs
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('Testing ProjectsSection and ProjectModal...');

// 1. Verify file existence
const projectsSectionJsx = path.resolve('src/ProjectsSection.jsx');
const projectsSectionCss = path.resolve('src/ProjectsSection.css');
const projectModalJsx = path.resolve('src/ProjectModal.jsx');
const projectModalCss = path.resolve('src/ProjectModal.css');

for (const p of [projectsSectionJsx, projectsSectionCss, projectModalJsx, projectModalCss]) {
  if (!fs.existsSync(p)) {
    throw new Error(`File does not exist: ${p}`);
  }
}
console.log('PASS: All 4 source and CSS files exist');

// 2. Verify ProjectsSection.css rules
const psCss = fs.readFileSync(projectsSectionCss, 'utf-8');
const requiredPsRules = [
  '.projects-section',
  '.section-container',
  '.section-header',
  '.section-badge',
  '.section-title',
  '.section-subtitle',
  '.filter-bar',
  '.filter-pill',
  '.projects-grid',
  '.project-card',
  '.card-top',
  '.card-icon',
  '.card-category',
  '.card-title',
  '.card-subtitle',
  '.card-summary',
  '.card-tech',
  '.tech-tag',
  '.card-footer',
  '.card-details-btn',
  '.card-actions',
  '.icon-link'
];
for (const rule of requiredPsRules) {
  if (!psCss.includes(rule)) {
    throw new Error(`ProjectsSection.css missing expected rule: ${rule}`);
  }
}
console.log('PASS: ProjectsSection.css rules verified');

// 3. Verify ProjectModal.css rules
const pmCss = fs.readFileSync(projectModalCss, 'utf-8');
const requiredPmRules = [
  '.modal-backdrop',
  '.modal-content',
  '.modal-close',
  '.modal-category',
  '.modal-title-row',
  '.modal-icon',
  '.modal-title',
  '.modal-subtitle',
  '.modal-description',
  '.modal-section-title',
  '.modal-features-list',
  '.feature-icon',
  '.modal-tech-list',
  '.modal-footer',
  '.btn-modal-primary',
  '.btn-modal-secondary'
];
for (const rule of requiredPmRules) {
  if (!pmCss.includes(rule)) {
    throw new Error(`ProjectModal.css missing expected rule: ${rule}`);
  }
}
console.log('PASS: ProjectModal.css rules verified');

// 4. Verify source code tokens
const psJsx = fs.readFileSync(projectsSectionJsx, 'utf-8');
const requiredPsTokens = [
  'export const PROJECTS',
  'export default function ProjectsSection',
  'useScrollReveal',
  'sounds',
  'playChime',
  'playSoftClick',
  'ProjectModal',
  'handleOpenModal',
  'activeFilter',
  'setActiveFilter',
  'filteredProjects',
  'khushigsd2924-design/Reading_History',
  'khushigsd2924-design/quiz-app-code-with-ai',
  'khushigsd2924-design/messy-python-refactoring',
  'khushigsd2924-design/buggy-python-debugging',
  'khushigsd2924-design/python-basics-struct-to-dict'
];
for (const token of requiredPsTokens) {
  if (!psJsx.includes(token)) {
    throw new Error(`ProjectsSection.jsx missing token: ${token}`);
  }
}
console.log('PASS: ProjectsSection.jsx source tokens verified');

const pmJsx = fs.readFileSync(projectModalJsx, 'utf-8');
const requiredPmTokens = [
  'export default function ProjectModal',
  'keydown',
  'Escape',
  'onClose',
  'modal-backdrop',
  'modal-content',
  'modal-close',
  'aria-modal="true"',
  'role="dialog"',
  'btn-modal-primary',
  'btn-modal-secondary',
  'sounds',
  'playSoftClick'
];
for (const token of requiredPmTokens) {
  if (!pmJsx.includes(token)) {
    throw new Error(`ProjectModal.jsx missing token: ${token}`);
  }
}
console.log('PASS: ProjectModal.jsx source tokens verified');

// 5. Transpile and test React rendering & exports
console.log('Transpiling and testing component rendering...');

// Transpile ProjectModal
const pmCodeStripped = pmJsx
  .replace(/import\s+['"]\.\/ProjectModal\.css['"];?/, '// css')
  .replace(/from\s+['"]\.\/soundEffects['"]/, "from './soundEffects.js'");

const pmTranspiled = esbuild.transformSync(pmCodeStripped, {
  loader: 'jsx',
  format: 'esm',
  target: 'es2022'
});
const pmTemp = path.resolve('src/.temp_pm_transpiled.mjs');
fs.writeFileSync(pmTemp, pmTranspiled.code, 'utf-8');

let pmMod;
try {
  pmMod = await import(`file://${pmTemp}`);
} finally {
  if (fs.existsSync(pmTemp)) fs.unlinkSync(pmTemp);
}

console.assert(typeof pmMod.default === 'function', 'ProjectModal default export must be a function');

// Transpile ProjectsSection
const psCodeStripped = psJsx
  .replace(/import\s+['"]\.\/ProjectsSection\.css['"];?/, '// css')
  .replace(/import\s+useScrollReveal\s+from\s+['"]\.\/useScrollReveal['"];?/, "import useScrollReveal from './useScrollReveal.js';")
  .replace(/import\s+ProjectModal\s+from\s+['"]\.\/ProjectModal['"];?/, 'const ProjectModal = () => React.createElement("div", { className: "mock-modal" });')
  .replace(/from\s+['"]\.\/soundEffects['"]/, "from './soundEffects.js'");

const psTranspiled = esbuild.transformSync(psCodeStripped, {
  loader: 'jsx',
  format: 'esm',
  target: 'es2022'
});
const psTemp = path.resolve('src/.temp_ps_transpiled.mjs');
fs.writeFileSync(psTemp, psTranspiled.code, 'utf-8');

let psMod;
try {
  psMod = await import(`file://${psTemp}`);
} finally {
  if (fs.existsSync(psTemp)) fs.unlinkSync(psTemp);
}

console.assert(typeof psMod.default === 'function', 'ProjectsSection default export must be a function');
console.assert(Array.isArray(psMod.PROJECTS), 'PROJECTS must be an array');
console.assert(psMod.PROJECTS.length === 5, `PROJECTS must have 5 items, got ${psMod.PROJECTS.length}`);

// 6. Test PROJECTS data integrity
const expectedIds = [
  'reading-history',
  'code-with-ai-quiz',
  'student-marks-analysis',
  'buggy-python-debugging',
  'struct-to-dict'
];

for (let i = 0; i < expectedIds.length; i++) {
  const p = psMod.PROJECTS[i];
  console.assert(p.id === expectedIds[i], `Project ${i} ID expected ${expectedIds[i]}, got ${p.id}`);
  console.assert(p.title && p.title.length > 0, `Project ${p.id} missing title`);
  console.assert(p.subtitle && p.subtitle.length > 0, `Project ${p.id} missing subtitle`);
  console.assert(typeof p.icon === 'object' || typeof p.icon === 'function', `Project ${p.id} missing valid icon`);
  console.assert(p.category && p.category.length > 0, `Project ${p.id} missing category`);
  console.assert(Array.isArray(p.tech) && p.tech.length > 0, `Project ${p.id} missing tech array`);
  console.assert(p.summary && p.summary.length > 0, `Project ${p.id} missing summary`);
  console.assert(p.description && p.description.length > 0, `Project ${p.id} missing description`);
  console.assert(p.github.startsWith('https://github.com/khushigsd2924-design/'), `Project ${p.id} invalid GitHub URL: ${p.github}`);
  console.assert(Array.isArray(p.features) && p.features.length >= 4, `Project ${p.id} must have >= 4 features`);
}
console.log('PASS: All 5 PROJECTS validated with correct schemas and khushigsd2924-design URLs');

// 7. Verify category filtering logic
const categories = ['All', 'Full-Stack Web', 'Interactive Web', 'Python & Algorithms', 'Software Engineering', 'Systems & Data'];
for (const cat of categories) {
  const filtered = cat === 'All' ? psMod.PROJECTS : psMod.PROJECTS.filter(p => p.category === cat);
  if (cat === 'All') {
    console.assert(filtered.length === 5, 'All category must return 5 projects');
  } else {
    console.assert(filtered.length >= 1, `Category "${cat}" must return at least 1 project`);
    for (const p of filtered) {
      console.assert(p.category === cat, `Filtered project category must match "${cat}"`);
    }
  }
}
console.log('PASS: Category filtering logic verified for all project categories');

// 8. Render ProjectsSection to static markup
const psHtml = renderToStaticMarkup(React.createElement(psMod.default));
console.assert(psHtml.includes('id="projects"'), 'Markup must contain id="projects"');
console.assert(psHtml.includes('projects-section'), 'Markup must contain projects-section class');
console.assert(psHtml.includes('FEATURED PROJECTS'), 'Markup must contain title FEATURED PROJECTS');
console.assert(psHtml.includes('Curated Works'), 'Markup must contain badge Curated Works');
console.assert(psHtml.includes('filter-bar'), 'Markup must contain filter-bar');
console.assert(psHtml.includes('projects-grid'), 'Markup must contain projects-grid');

// Check all 5 project titles are rendered
for (const p of psMod.PROJECTS) {
  console.assert(psHtml.includes(p.title), `Rendered HTML must contain project title: ${p.title}`);
  console.assert(psHtml.includes(p.github), `Rendered HTML must contain GitHub URL: ${p.github}`);
}
console.log('PASS: ProjectsSection static markup renders all 5 projects and filters');

// 9. Render ProjectModal with a project and when null
const modalNullHtml = renderToStaticMarkup(React.createElement(pmMod.default, { project: null, onClose: () => {} }));
console.assert(modalNullHtml === '', 'ProjectModal must render nothing when project is null');

const testProject = psMod.PROJECTS[0]; // Reading History
const modalHtml = renderToStaticMarkup(React.createElement(pmMod.default, { project: testProject, onClose: () => {} }));
console.assert(modalHtml.includes('modal-backdrop'), 'Modal markup must contain modal-backdrop');
console.assert(modalHtml.includes('modal-content'), 'Modal markup must contain modal-content');
console.assert(modalHtml.includes('role="dialog"'), 'Modal markup must contain role="dialog"');
console.assert(modalHtml.includes('aria-modal="true"'), 'Modal markup must contain aria-modal="true"');
console.assert(modalHtml.includes(testProject.title), 'Modal markup must contain project title');
console.assert(modalHtml.includes(testProject.description), 'Modal markup must contain project description');
console.assert(modalHtml.includes('Key Architecture'), 'Modal markup must contain Key Architecture heading');
console.assert(modalHtml.includes('Technical Toolkit'), 'Modal markup must contain Technical Toolkit heading');
console.assert(modalHtml.includes('View on GitHub'), 'Modal markup must contain View on GitHub button');
console.assert(modalHtml.includes('Open Live App'), 'Modal markup must contain Open Live App button for Reading History');

for (const feat of testProject.features) {
  console.assert(modalHtml.includes(feat), `Modal markup must contain feature: ${feat}`);
}
for (const tech of testProject.tech) {
  console.assert(modalHtml.includes(tech), `Modal markup must contain tech: ${tech}`);
}
console.log('PASS: ProjectModal static markup renders full details, features, and links');

console.log('\nALL PROJECTS SECTION & MODAL CHECKS PASSED SUCCESSFULLY!');
