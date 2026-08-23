// Renders docs/BUILD_BIBLE.md into a compact, print-quality PDF via Chrome.
//
//   To regenerate after editing BUILD_BIBLE.md:
//     cd backend && npm i -D marked puppeteer-core
//     node ../docs/build-pdf.js
//     npm uninstall marked puppeteer-core     # optional: keep deps lean
//
// Handles: markdown → HTML, LaTeX ($$…$$ and $…$) → styled HTML math,
// "> ### TITLE" blockquotes → callout boxes, and compact A4 print CSS.
const fs = require('fs');
const { marked } = require('marked');
const puppeteer = require('puppeteer-core');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SRC = 'C:/Users/Shreyas/ai-contractkit/docs/BUILD_BIBLE.md';
const OUT = process.env.BIBLE_OUT
  || 'C:/Users/Shreyas/ai-contractkit/docs/AI_CONTRACTKIT_BUILD_BIBLE.pdf';

let md = fs.readFileSync(SRC, 'utf8');

// ── LaTeX → HTML (only the constructs used in this document) ──────────────
const tex = (s) => {
  let t = s;
  // 1. wrappers that don't nest in this document
  t = t.replace(/\\(?:text|mathrm|operatorname)\{([^{}]*)\}/g, '$1');
  t = t.replace(/\\mathbf\{([^{}]*)\}/g, '<b>$1</b>');
  t = t.replace(/\\vec\{([^{}]*)\}/g, '<span class="vec">$1</span>');
  // 2. bare symbols and spacing
  t = t.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')')
       .replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
  t = t.replace(/\\qquad/g, '<span class="gap"></span>')
       .replace(/\\quad/g, '<span class="gap-s"></span>');
  t = t.replace(/\\!|\\,|\\;|\\:/g, '');
  t = t.replace(/\\sum_i/g, '<span class="op">Σ</span>')
       .replace(/\\sum/g, '<span class="op">Σ</span>');
  t = t.replace(/\\cdot/g, '·').replace(/\\times/g, '×').replace(/\\ln/g, 'ln')
       .replace(/\\theta/g, 'θ').replace(/\\cos/g, 'cos').replace(/\\approx/g, '≈')
       .replace(/\\\|/g, '‖').replace(/\\pm/g, '±');
  // 3. sub/superscripts (letters and digits)
  t = t.replace(/\^\{([^{}]*)\}/g, '<sup>$1</sup>').replace(/\^(\w)/g, '<sup>$1</sup>');
  t = t.replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>').replace(/_(\w)/g, '<sub>$1</sub>');
  // 4. innermost-first loop so nested \frac / \sqrt resolve bottom-up
  for (let i = 0; i < 8; i++) {
    const before = t;
    t = t.replace(/\\(?:frac|tfrac|dfrac)\{([^{}]*)\}\{([^{}]*)\}/g,
      '<span class="frac"><span class="n">$1</span><span class="d">$2</span></span>');
    t = t.replace(/\\sqrt\{([^{}]*)\}/g, '<span class="sqrt">$1</span>');
    if (t === before) break;
  }
  t = t.replace(/[{}]/g, '');
  return t;
};

// Block math  $$ … $$  → .formula   (must run before inline $ … $)
md = md.replace(/\$\$([\s\S]*?)\$\$/g, (_, body) => `\n\n<div class="formula">${tex(body.trim())}</div>\n\n`);
// Inline math  $ … $  → styled span (skip $$ and currency like ₹/$1,000)
md = md.replace(/(^|[^$\w])\$([^$\n]{1,120}?)\$(?![\w$])/g,
  (m, pre, body) => `${pre}<span class="imath">${tex(body)}</span>`);

// ── Callout boxes: blockquote whose first line is "### TITLE" ─────────────
const html0 = marked.parse(md, { mangle: false, headerIds: false });
const html = html0.replace(
  /<blockquote>\s*<h3>([\s\S]*?)<\/h3>([\s\S]*?)<\/blockquote>/g,
  (_, title, body) => `<div class="callout"><div class="callout-t">${title}</div>${body}</div>`
);

const css = `
@page { size: A4; margin: 13mm 12mm 14mm 12mm; }
* { box-sizing: border-box; }
body {
  font-family: "Charter","Georgia","Times New Roman",serif;
  font-size: 8.6pt; line-height: 1.38; color: #16141f; margin: 0;
  text-rendering: optimizeLegibility;
}
h1,h2,h3,h4 { font-family: "Segoe UI","Helvetica Neue",Arial,sans-serif; color:#2b1a5e; }
h1 { font-size: 15pt; margin: 16pt 0 7pt; padding-bottom: 4pt;
     border-bottom: 1.6pt solid #7c3aed; letter-spacing:-.2pt; break-after: avoid; }
h2 { font-size: 10.6pt; margin: 12pt 0 4pt; color:#5b21b6; break-after: avoid; }
h3 { font-size: 9.2pt; margin: 9pt 0 3pt; color:#3f3357; break-after: avoid; }
p  { margin: 0 0 5pt; text-align: justify; hyphens: auto; }
ul,ol { margin: 0 0 6pt; padding-left: 15pt; }
li { margin-bottom: 2pt; }
strong { color:#12101a; }
hr { border:0; border-top:.6pt solid #d6d2e2; margin:11pt 0; }
a { color:#6d28d9; text-decoration:none; }

code { font-family:"Cascadia Mono","Consolas",monospace; font-size:7.5pt;
       background:#f3f0fa; padding:.5pt 2pt; border-radius:2pt; color:#4c1d95; }
pre { background:#f7f5fc; border:.5pt solid #e0dbf0; border-left:2pt solid #7c3aed;
      border-radius:3pt; padding:5pt 7pt; margin:0 0 7pt; overflow:hidden;
      break-inside: avoid; }
pre code { background:none; padding:0; font-size:7.1pt; line-height:1.34;
           color:#2a2440; white-space:pre-wrap; word-break:break-word; }

table { width:100%; border-collapse:collapse; margin:0 0 8pt; font-size:7.6pt;
        break-inside:avoid; font-family:"Segoe UI",Arial,sans-serif; }
th { background:#efe9fb; color:#3b1e77; text-align:left; padding:3pt 5pt;
     border:.5pt solid #ddd6ee; font-weight:600; }
td { padding:3pt 5pt; border:.5pt solid #e6e1f2; vertical-align:top; }
tr:nth-child(even) td { background:#faf9fd; }

blockquote { margin:0 0 7pt; padding:4pt 9pt; border-left:2pt solid #c4b5fd;
             background:#faf8ff; color:#332c47; break-inside:avoid; }
blockquote p { margin:0 0 3pt; }
blockquote p:last-child { margin:0; }

.callout { border:.6pt solid #d9cffb; background:#f6f2ff; border-radius:4pt;
           padding:6pt 9pt; margin:0 0 8pt; break-inside:avoid; }
.callout-t { font-family:"Segoe UI",Arial,sans-serif; font-size:7.4pt; font-weight:700;
             letter-spacing:.6pt; color:#6d28d9; margin-bottom:3pt; }
.callout p { margin:0 0 3pt; } .callout p:last-child { margin:0; }

.formula { text-align:center; margin:7pt 0; font-size:9.4pt;
           font-family:"Cambria Math","Georgia",serif; break-inside:avoid; }
.frac { display:inline-flex; flex-direction:column; vertical-align:middle;
        text-align:center; margin:0 3pt; }
.frac .n { border-bottom:.7pt solid #16141f; padding:0 4pt 1pt; }
.frac .d { padding:1pt 4pt 0; }
.sqrt::before { content:"√"; } .sqrt { border-top:.6pt solid #16141f; padding:0 2pt; }
.gap { display:inline-block; width:22pt; }
.gap-s { display:inline-block; width:11pt; }
.imath { font-family:"Cambria Math","Georgia",serif; font-style:italic; white-space:nowrap; }
.formula sub { font-style:normal; } .formula sup { font-style:normal; }
.vec { font-weight:700; font-style:italic; }
.op { font-size:11pt; }

/* Cover */
.cover { height:262mm; display:flex; flex-direction:column; justify-content:center;
         text-align:center; break-after:page; }
.cover .kicker { font-family:"Segoe UI",Arial,sans-serif; font-size:8pt; letter-spacing:3pt;
                 color:#7c3aed; font-weight:700; }
.cover h1 { font-size:31pt; border:0; margin:9pt 0 2pt; color:#1e1240; letter-spacing:-.6pt; }
.cover .sub { font-size:12pt; color:#5b21b6; font-family:"Segoe UI",Arial,sans-serif;
              margin-bottom:16pt; }
.cover .blurb { font-size:9.4pt; max-width:132mm; margin:0 auto 14pt; color:#2f2a40; }
.cover .meta { font-size:7.8pt; color:#5c5470; font-family:"Segoe UI",Arial,sans-serif;
               border-top:.6pt solid #d6d2e2; padding-top:9pt; max-width:132mm;
               margin:0 auto; line-height:1.7; }
.cover .rule { width:52pt; height:2.4pt; background:#7c3aed; margin:0 auto 12pt; }
`;

const cover = `
<div class="cover">
  <div class="kicker">A COMPLETE FROM-ZERO ENGINEERING GUIDE</div>
  <h1>AI ContractKit</h1>
  <div class="sub">The Complete Build Bible</div>
  <div class="rule"></div>
  <div class="blurb">Start knowing nothing. Finish able to build — and <i>explain</i> — a
  production-shaped, measured, verification-first AI product. Every concept defined,
  every design decision justified, every alternative named, with worked examples for the math.</div>
  <div class="meta">
    Verification-first contract intelligence for freelancers · generate, defend and prove agreements<br>
    <b>Reference stack:</b> Node.js 24 · Express · MongoDB · React 19 + Vite · Groq LLaMA 3.3 70B · JWT · PDFKit<br>
    <b>Measured:</b> scope classifier 97.8% accuracy / 0.98 F1 on 45 labeled cases · 58 tests · GitHub Actions CI
  </div>
</div>`;

// strip the markdown title/TOC block (cover + contents replace it)
const body = html.replace(/^[\s\S]*?<hr>/, '');

fs.writeFileSync('C:/Users/Shreyas/ai-contractkit/docs/_bible.html',
  `<!doctype html><meta charset="utf-8"><style>${css}</style>${cover}${body}`);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('file:///C:/Users/Shreyas/ai-contractkit/docs/_bible.html', { waitUntil: 'networkidle0' });
  await page.pdf({
    path: OUT, format: 'A4', printBackground: true,
    margin: { top: '13mm', bottom: '14mm', left: '12mm', right: '12mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-family:Segoe UI,Arial;font-size:6.6pt;color:#8b85a0;
      padding:0 12mm;display:flex;justify-content:space-between;">
      <span>AI ContractKit — The Complete Build Bible</span>
      <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  await browser.close();
  const pages = (fs.readFileSync(OUT).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log('PDF:', OUT);
  console.log('pages:', pages, '| size:', Math.round(fs.statSync(OUT).size / 1024) + 'KB');
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
