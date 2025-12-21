// ROV Cheat Sheets page logic.
// Loads a list of local PDFs from JSON and lets the user switch which one to view.
// This keeps things simple (Tier 3 listing + viewer) while remaining GitHub Pages friendly.
import '../style.css';

type Sheet = {
  id: string;
  label: string;
  pdf: string;
};

type SheetData = {
  sheets: Sheet[];
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

// Use BASE_URL so assets work on GitHub Pages subpaths.
const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataUrl = `${baseWithSlash}data/rov_cheatsheets.json`;
const logoSrc = `${baseWithSlash}assets/images/ROV_REF_Logo_black_on_transparent.png`;

/**
 * Build a safe URL for PDFs, handling both absolute (http) and relative paths.
 * For relative paths we prepend BASE_URL and strip any leading slash to avoid
 * double-slashes when deployed on a sub-path.
 */
function buildPdfUrl(pdfPath: string) {
  if (/^https?:\/\//i.test(pdfPath)) return pdfPath;
  const cleaned = pdfPath.replace(/^\//, '');
  return `${baseWithSlash}${cleaned}`;
}

const topbar = `
  <header class="topbar">
    <div class="topbar-left">
      <button class="icon-btn" id="burger-btn" aria-label="Open menu">
        <span aria-hidden="true">&#9776;</span>
      </button>
      <img class="brand-mark" src="${logoSrc}" alt="ROV Reference App logo" />
    </div>
    <div class="topbar-center">
      <nav class="nav-links" aria-label="Primary">
        <a class="nav-link" href="${baseWithSlash}">Home</a>
        <a class="nav-link" href="${baseWithSlash}apps/rov-cheatsheet.html">Cheatsheets</a>
        <a class="nav-link" href="${baseWithSlash}apps/fitting-finder.html">Fitting Finder</a>
      </nav>
    </div>
    <div class="topbar-right">
      <form class="search-form desktop-search" role="search">
        <label class="sr-only" for="desktop-search-input">Search</label>
        <input id="desktop-search-input" type="search" name="q" placeholder="Search" />
        <button type="submit" class="icon-btn" aria-label="Search">
          <span aria-hidden="true">🔍</span>
        </button>
      </form>
      <button class="icon-btn mobile-search-btn" id="search-toggle" aria-label="Open search" aria-expanded="false" aria-controls="search-panel">
        <span aria-hidden="true">🔍</span>
      </button>
    </div>
  </header>
  <div id="search-panel" class="search-panel" hidden>
    <form class="search-form" role="search">
      <label class="sr-only" for="mobile-search-input">Search</label>
      <input id="mobile-search-input" type="search" name="q" placeholder="Search the app" />
      <button type="submit" class="icon-btn" aria-label="Search">
        <span aria-hidden="true">🔍</span>
      </button>
    </form>
  </div>
`;

// Page structure. We keep markup minimal and wire up behavior below.
app.innerHTML = `
  ${topbar}
  <main class="page narrow-page">
    <p class="back"><a href="../">&larr; Back to dashboard</a></p>

    <header class="page-header">
      <div class="pill">Tier 3</div>
      <h1>ROV Cheat Sheets</h1>
      <p class="lead">Select your ROV and open the matching cheat sheet PDF. Works offline with the bundled files.</p>
    </header>

    <section class="card finder-card">
      <form class="finder-form" id="rov-form">
        <div class="field">
          <label for="rov-select">Select ROV</label>
          <select id="rov-select" name="rov">
            <option value="">Loading...</option>
          </select>
        </div>
        <div class="button-row">
          <a class="btn primary" id="open-btn" href="#" target="_blank" rel="noopener">Open PDF (new tab)</a>
        </div>
        <p class="helper-text">If the embedded viewer is flaky on mobile, use the button to open in a new tab.</p>
      </form>
    </section>

    <section class="card">
      <h2>Embedded viewer</h2>
      <p class="helper-text">Shows the currently selected cheat sheet PDF.</p>
      <iframe title="ROV cheat sheet PDF" id="pdf-frame" class="pdf-frame" src=""></iframe>
      <p class="helper-text">Tip: Mobile browsers sometimes block inline PDFs. The button above is a reliable fallback.</p>
    </section>

    <section class="card">
      <h2>Source material</h2>
      <p class="helper-text" id="source-link-wrap">
        <a id="source-link" href="#" target="_blank" rel="noopener">Open current PDF</a>
      </p>
    </section>
  </main>
`;

const selectEl = document.querySelector<HTMLSelectElement>('#rov-select');
const openBtn = document.querySelector<HTMLAnchorElement>('#open-btn');
const frame = document.querySelector<HTMLIFrameElement>('#pdf-frame');
const sourceLink = document.querySelector<HTMLAnchorElement>('#source-link');

let sheets: Sheet[] = [];

function setSheet(sheet: Sheet) {
  const pdfUrl = buildPdfUrl(sheet.pdf);

  if (selectEl) selectEl.value = sheet.id;
  if (openBtn) openBtn.href = pdfUrl;
  if (frame) frame.src = pdfUrl;
  if (sourceLink) {
    sourceLink.href = pdfUrl;
    sourceLink.textContent = sheet.label;
  }
}

async function loadSheets() {
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as SheetData;
    sheets = Array.isArray(payload?.sheets) ? payload.sheets : [];

    if (!sheets.length) {
      throw new Error('No sheets found in rov_cheatsheets.json');
    }

    // Populate dropdown options.
    if (selectEl) {
      selectEl.innerHTML = sheets
        .map((sheet) => `<option value="${sheet.id}">${sheet.label}</option>`)
        .join('');
    }

    // Default to the first sheet.
    setSheet(sheets[0]);
  } catch (error) {
    console.error('Failed to load cheat sheet data', error);
    if (selectEl) {
      selectEl.innerHTML = `<option value="">Failed to load data</option>`;
    }
    if (frame) frame.src = '';
    if (openBtn) openBtn.removeAttribute('href');
    if (sourceLink) {
      sourceLink.removeAttribute('href');
      sourceLink.textContent = 'Unavailable (data load failed)';
    }
  }
}

selectEl?.addEventListener('change', (event) => {
  const value = (event.target as HTMLSelectElement).value;
  const next = sheets.find((sheet) => sheet.id === value);
  if (next) setSheet(next);
});

// Kick off data load once the script runs.
loadSheets();

// Search toggle behavior matching the dashboard.
const searchToggle = document.querySelector<HTMLButtonElement>('#search-toggle');
const searchPanel = document.querySelector<HTMLDivElement>('#search-panel');
const mobileSearchInput = document.querySelector<HTMLInputElement>('#mobile-search-input');

searchToggle?.addEventListener('click', () => {
  const isOpen = searchPanel?.hasAttribute('hidden') === false;
  if (isOpen) {
    searchPanel?.setAttribute('hidden', '');
    searchToggle.setAttribute('aria-expanded', 'false');
  } else {
    searchPanel?.removeAttribute('hidden');
    searchToggle.setAttribute('aria-expanded', 'true');
    mobileSearchInput?.focus();
  }
});
