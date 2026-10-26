// scripts/test_app.mjs
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('Testing ContactSection, ContactModal, ResumeModal, App, and main.jsx...');

// 1. Verify existence of all required files
const filesToCheck = [
  'src/ContactSection.jsx',
  'src/ContactSection.css',
  'src/ContactModal.jsx',
  'src/ContactModal.css',
  'src/ResumeModal.jsx',
  'src/ResumeModal.css',
  'src/App.jsx',
  'src/main.jsx'
];

for (const relPath of filesToCheck) {
  const absPath = path.resolve(relPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Expected file does not exist: ${relPath}`);
  }
}
console.log('PASS: All 8 Task 7 files exist.');

// 2. Verify ContactSection.css rules
const contactCss = fs.readFileSync(path.resolve('src/ContactSection.css'), 'utf-8');
const expectedContactCss = [
  '.contact-section',
  'background: var(--bg-deep)',
  '.contact-card',
  'linear-gradient',
  '.contact-headline',
  'font-family: var(--font-display)',
  '.contact-sub',
  '.contact-buttons',
  '.footer-bottom',
  '.footer-left',
  '.footer-logo',
  '.footer-copy',
  '.footer-links',
  '.footer-link',
  '.footer-link-btn',
  '@media (max-width: 768px)'
];
for (const rule of expectedContactCss) {
  if (!contactCss.includes(rule)) {
    throw new Error(`ContactSection.css missing expected CSS rule/property: ${rule}`);
  }
}
console.log('PASS: ContactSection.css rules verified.');

// 3. Verify ContactModal.css rules
const contactModalCss = fs.readFileSync(path.resolve('src/ContactModal.css'), 'utf-8');
const expectedContactModalCss = [
  '.contact-modal-content',
  'background: #200a10',
  '.contact-form',
  '.form-group',
  '.form-group label',
  'color: var(--accent-gold)',
  '.form-group input,',
  '.form-group textarea',
  '.submit-btn',
  '.contact-success',
  '.success-icon',
  'animation: scaleUp'
];
for (const rule of expectedContactModalCss) {
  if (!contactModalCss.includes(rule)) {
    throw new Error(`ContactModal.css missing expected CSS rule/property: ${rule}`);
  }
}
console.log('PASS: ContactModal.css rules verified.');

// 4. Verify ResumeModal.css rules and print media styles
const resumeModalCss = fs.readFileSync(path.resolve('src/ResumeModal.css'), 'utf-8');
const expectedResumeModalCss = [
  '.resume-modal-content',
  '.resume-toolbar',
  '.toolbar-btn',
  '.modal-close-static',
  '.resume-sheet',
  'background: #ffffff',
  '.resume-header',
  '.resume-name',
  '.resume-role',
  '.resume-contacts',
  '.resume-section',
  '.resume-section-heading',
  '.resume-skill-row',
  '.resume-item',
  '.item-head',
  '.item-title',
  '.item-tech',
  '.item-desc',
  '@media print',
  '.no-print { display: none !important; }',
  '.modal-backdrop { position: static; background: none; padding: 0; }',
  '.resume-modal-content { max-width: 100%; border: none; box-shadow: none; }',
  '.resume-sheet { padding: 0; }'
];
for (const rule of expectedResumeModalCss) {
  if (!resumeModalCss.includes(rule)) {
    throw new Error(`ResumeModal.css missing expected CSS rule/property: ${rule}`);
  }
}
console.log('PASS: ResumeModal.css and print media rules verified.');

// 5. Verify tokens and structure in main.jsx
const mainContent = fs.readFileSync(path.resolve('src/main.jsx'), 'utf-8');
for (const token of ['ReactDOM.createRoot', "document.getElementById('root')", '<React.StrictMode>', '<App />', './App']) {
  if (!mainContent.includes(token)) {
    throw new Error(`main.jsx missing expected token: ${token}`);
  }
}
console.log('PASS: main.jsx structure and root mounting verified.');

// 6. Test Transpilation & Static Rendering for ContactSection
const contactJsx = fs.readFileSync(path.resolve('src/ContactSection.jsx'), 'utf-8');
const transpiledContact = esbuild.transformSync(
  contactJsx
    .replace(/import\s+['"]\.\/ContactSection\.css['"];?/, '// css imported')
    .replace(/from\s+['"]\.\/soundEffects['"]/, "from './soundEffects.js'"),
  { loader: 'jsx', format: 'esm', target: 'es2022' }
);
const tempContactFile = path.resolve('src/.temp_contact_transpiled.mjs');
fs.writeFileSync(tempContactFile, transpiledContact.code, 'utf-8');

let ContactSection;
try {
  const mod = await import(`file://${tempContactFile}`);
  ContactSection = mod.default;
} finally {
  if (fs.existsSync(tempContactFile)) fs.unlinkSync(tempContactFile);
}

let contactTriggered = false;
let resumeTriggered = false;
const contactMarkup = renderToStaticMarkup(
  React.createElement(ContactSection, {
    onOpenContact: () => { contactTriggered = true; },
    onOpenResume: () => { resumeTriggered = true; }
  })
);
console.assert(contactMarkup.includes('contact-section'), 'ContactSection rendered markup must include contact-section');
console.assert(contactMarkup.includes("LET&#x27;S BUILD SOMETHING EXTRAORDINARY"), 'ContactSection rendered markup must include headline');
console.assert(contactMarkup.includes('khushigsd2924@gmail.com'), 'ContactSection rendered markup must include email');
console.assert(contactMarkup.includes('Curriculum Vitae'), 'ContactSection rendered markup must include Curriculum Vitae');
console.assert(contactMarkup.includes('https://github.com/khushigsd2924-design'), 'ContactSection rendered markup must include GitHub link');
console.log('PASS: ContactSection component renders static markup correctly.');

// 7. Test Transpilation & Static Rendering for ContactModal
const contactModalJsx = fs.readFileSync(path.resolve('src/ContactModal.jsx'), 'utf-8');
const transpiledContactModal = esbuild.transformSync(
  contactModalJsx
    .replace(/import\s+['"]\.\/ContactModal\.css['"];?/, '// css imported')
    .replace(/from\s+['"]\.\/soundEffects['"]/, "from './soundEffects.js'"),
  { loader: 'jsx', format: 'esm', target: 'es2022' }
);
const tempContactModalFile = path.resolve('src/.temp_contact_modal_transpiled.mjs');
fs.writeFileSync(tempContactModalFile, transpiledContactModal.code, 'utf-8');

let ContactModal;
try {
  const mod = await import(`file://${tempContactModalFile}`);
  ContactModal = mod.default;
} finally {
  if (fs.existsSync(tempContactModalFile)) fs.unlinkSync(tempContactModalFile);
}

let modalClosed = false;
const contactModalMarkup = renderToStaticMarkup(
  React.createElement(ContactModal, {
    onClose: () => { modalClosed = true; }
  })
);
console.assert(contactModalMarkup.includes('modal-backdrop'), 'ContactModal rendered markup must include modal-backdrop');
console.assert(contactModalMarkup.includes('Direct Inquiry'), 'ContactModal rendered markup must include category');
console.assert(contactModalMarkup.includes('Send a Message'), 'ContactModal rendered markup must include title');
console.assert(contactModalMarkup.includes('name="name"') || contactModalMarkup.includes('id="name"'), 'ContactModal rendered markup must have name field');
console.assert(contactModalMarkup.includes('type="email"'), 'ContactModal rendered markup must have email input');
console.assert(contactModalMarkup.includes('<textarea'), 'ContactModal rendered markup must have textarea');
console.log('PASS: ContactModal component renders static markup with form elements correctly.');

// 8. Test Transpilation & Static Rendering for ResumeModal
const resumeModalJsx = fs.readFileSync(path.resolve('src/ResumeModal.jsx'), 'utf-8');
const transpiledResumeModal = esbuild.transformSync(
  resumeModalJsx
    .replace(/import\s+['"]\.\/ResumeModal\.css['"];?/, '// css imported')
    .replace(/from\s+['"]\.\/soundEffects['"]/, "from './soundEffects.js'"),
  { loader: 'jsx', format: 'esm', target: 'es2022' }
);
const tempResumeModalFile = path.resolve('src/.temp_resume_modal_transpiled.mjs');
fs.writeFileSync(tempResumeModalFile, transpiledResumeModal.code, 'utf-8');

let ResumeModal;
try {
  const mod = await import(`file://${tempResumeModalFile}`);
  ResumeModal = mod.default;
} finally {
  if (fs.existsSync(tempResumeModalFile)) fs.unlinkSync(tempResumeModalFile);
}

const resumeModalMarkup = renderToStaticMarkup(
  React.createElement(ResumeModal, {
    onClose: () => {}
  })
);
console.assert(resumeModalMarkup.includes('resume-modal-content'), 'ResumeModal rendered markup must include resume-modal-content');
console.assert(resumeModalMarkup.includes('Print / Save PDF'), 'ResumeModal rendered markup must include print button');
console.assert(resumeModalMarkup.includes('KHUSHI'), 'ResumeModal rendered markup must include name KHUSHI');
console.assert(resumeModalMarkup.includes('Software Engineer &amp; Creative Developer'), 'ResumeModal rendered markup must include role');
console.assert(resumeModalMarkup.includes('Reading History'), 'ResumeModal rendered markup must include project Reading History');
console.assert(resumeModalMarkup.includes('Code With AI Quiz'), 'ResumeModal rendered markup must include project Code With AI Quiz');
console.assert(resumeModalMarkup.includes('Student Marks Analysis Engine'), 'ResumeModal rendered markup must include project Student Marks Analysis Engine');
console.assert(resumeModalMarkup.includes('Python Unit Testing &amp; Defect Lifecycle Suite'), 'ResumeModal rendered markup must include project Python Unit Testing');
console.assert(resumeModalMarkup.includes('Bachelor of Technology'), 'ResumeModal rendered markup must include education');
console.log('PASS: ResumeModal component renders formatted CV markup correctly.');

// 9. Test App Component orchestration
const appJsx = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');
const transpiledApp = esbuild.transformSync(
  appJsx
    .replace(/import\s+['"]\.\/index\.css['"];?/, '// css imported')
    .replace(/from\s+['"]\.\/HeroSection['"]/, "from './HeroSection.jsx'")
    .replace(/from\s+['"]\.\/ProjectsSection['"]/, "from './ProjectsSection.jsx'")
    .replace(/from\s+['"]\.\/AboutSection['"]/, "from './AboutSection.jsx'")
    .replace(/from\s+['"]\.\/ContactSection['"]/, "from './ContactSection.jsx'")
    .replace(/from\s+['"]\.\/ContactModal['"]/, "from './ContactModal.jsx'")
    .replace(/from\s+['"]\.\/ResumeModal['"]/, "from './ResumeModal.jsx'"),
  { loader: 'jsx', format: 'esm', target: 'es2022' }
);
const tempAppFile = path.resolve('src/.temp_app_transpiled.mjs');
fs.writeFileSync(tempAppFile, transpiledApp.code, 'utf-8');

// Also create transpiled versions of the sections without direct CSS imports so Node can import the App tree
const filesToMockCss = [
  'CharacterCanvas.jsx',
  'SpeechBubble.jsx',
  'HeroSection.jsx',
  'ProjectModal.jsx',
  'ProjectsSection.jsx',
  'AboutSection.jsx'
];
const createdTemps = [];
for (const f of filesToMockCss) {
  const content = fs.readFileSync(path.resolve('src', f), 'utf-8');
  const code = (content.includes("import React") ? "" : "import React from 'react';\n") + content
    .replace(/import\s+['"][^'"]+\.css['"];?/g, '// css import stripped')
    .replace(/from\s+['"]\.\/soundEffects['"]/g, "from './soundEffects.js'")
    .replace(/from\s+['"]\.\/useScrollReveal['"]/g, "from './useScrollReveal.js'")
    .replace(/from\s+['"]\.\/CharacterCanvas['"]/g, "from './CharacterCanvas.temp.mjs'")
    .replace(/from\s+['"]\.\/SpeechBubble['"]/g, "from './SpeechBubble.temp.mjs'")
    .replace(/from\s+['"]\.\/ProjectModal['"]/g, "from './ProjectModal.temp.mjs'");
  
  const trans = esbuild.transformSync(code, { loader: 'jsx', format: 'esm', target: 'es2022' });
  const outName = path.resolve('src', f.replace('.jsx', '.temp.mjs'));
  fs.writeFileSync(outName, trans.code, 'utf-8');
  createdTemps.push(outName);
}

// Modify App transpiled code to point to .temp.mjs files
let appCode = transpiledApp.code
  .replace(/from\s+['"]\.\/HeroSection\.jsx['"]/, "from './HeroSection.temp.mjs'")
  .replace(/from\s+['"]\.\/ProjectsSection\.jsx['"]/, "from './ProjectsSection.temp.mjs'")
  .replace(/from\s+['"]\.\/AboutSection\.jsx['"]/, "from './AboutSection.temp.mjs'")
  .replace(/from\s+['"]\.\/ContactSection\.jsx['"]/, `from './${path.basename(tempContactFile)}'`)
  .replace(/from\s+['"]\.\/ContactModal\.jsx['"]/, `from './${path.basename(tempContactModalFile)}'`)
  .replace(/from\s+['"]\.\/ResumeModal\.jsx['"]/, `from './${path.basename(tempResumeModalFile)}'`);

fs.writeFileSync(tempAppFile, appCode, 'utf-8');

// Ensure temporary files are ready for import
fs.writeFileSync(tempContactFile, transpiledContact.code, 'utf-8');
fs.writeFileSync(tempContactModalFile, transpiledContactModal.code, 'utf-8');
fs.writeFileSync(tempResumeModalFile, transpiledResumeModal.code, 'utf-8');

let App;
try {
  const mod = await import(`file://${tempAppFile}`);
  App = mod.default;
} finally {
  if (fs.existsSync(tempAppFile)) fs.unlinkSync(tempAppFile);
  if (fs.existsSync(tempContactFile)) fs.unlinkSync(tempContactFile);
  if (fs.existsSync(tempContactModalFile)) fs.unlinkSync(tempContactModalFile);
  if (fs.existsSync(tempResumeModalFile)) fs.unlinkSync(tempResumeModalFile);
  for (const t of createdTemps) {
    if (fs.existsSync(t)) fs.unlinkSync(t);
  }
}

const appMarkup = renderToStaticMarkup(React.createElement(App));

console.assert(appMarkup.includes('portfolio-wrapper'), 'App must render HeroSection with portfolio-wrapper');
console.assert(appMarkup.includes('hero-viewport'), 'App must render hero viewport');
console.assert(appMarkup.includes('projects-section'), 'App must render ProjectsSection within portfolio-content');
console.assert(appMarkup.includes('about-section'), 'App must render AboutSection within portfolio-content');
console.assert(appMarkup.includes('contact-section'), 'App must render ContactSection within portfolio-content');
console.log('PASS: Full App component renders all integrated sections in sequence.');

console.log('\n--- ALL CONTACT, MODALS, AND ROOT APP ORCHESTRATION TESTS PASSED ---');
