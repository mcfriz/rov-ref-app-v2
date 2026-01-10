/*
  Atlas cheat sheet page logic.
  Renders the PDF viewer for the Atlas cheat sheet and a quick nav to related pages.
  Edit this file for layout/behavior changes.
*/
import '../style.css';
import { initSpecsModal } from '../ui/specs-modal';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const pdfUrl = `${baseWithSlash}assets/pdfs/Atlas_CheatSheet.pdf`;

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>

    <header class="page-header">
      <h1>Atlas Cheat Sheet</h1>
      <p class="lead">Quick reference for hose, bearings and other Atlas parts.</p>
    </header>

    <section class="card">
      <h2>Atlas Quick Nav</h2>
      <div class="quick-nav">
        <div class="nav-buttons">
          <a class="nav-btn active" href="atlas-cheat-sheet.html">Atlas Cheat Sheet</a>
          <a class="nav-btn" href="atlas-hose-list.html">Atlas Valve Package Hose List</a>
          <a class="nav-btn" href="atlas-parts-finder.html">Atlas Parts Finder</a>
          <button class="nav-btn" type="button" id="atlas-specs-open">Atlas 7F Specs</button>
        </div>
      </div>
    </section>

    <section class="row-with-action">
      <div class="card">
        <h2>Source material</h2>
        <p class="helper-text">Source material: <a href="${pdfUrl}" target="_blank" rel="noopener">Atlas Cheat Sheet (PDF)</a></p>
      </div>
      <div class="row-action">
        <a class="btn" href="${pdfUrl}" target="_blank" rel="noopener">Open PDF (new tab)</a>
      </div>
    </section>

    <section class="card">
      <iframe
        title="Atlas Cheat Sheet PDF"
        id="pdf-frame"
        class="pdf-frame"
        src="${pdfUrl}"
      ></iframe>
    </section>
  </main>

  <div class="specs-modal" id="atlas-specs-modal" role="dialog" aria-modal="true" aria-labelledby="atlas-specs-title" hidden>
    <div class="specs-card">
      <header>
        <h3 id="atlas-specs-title">Atlas Specs</h3>
        <button class="btn small" type="button" id="atlas-specs-close">Close</button>
      </header>
      <table class="specs-table">
        <tbody id="atlas-specs-body"></tbody>
      </table>
    </div>
  </div>
`;

initSpecsModal({
  openButtonId: 'atlas-specs-open',
  modalId: 'atlas-specs-modal',
  titleId: 'atlas-specs-title',
  closeButtonId: 'atlas-specs-close',
  tableBodyId: 'atlas-specs-body',
  dataUrl: `${baseWithSlash}data/atlas_specs.json`,
});
