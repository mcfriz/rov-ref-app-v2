import '../style.css';

type Sheet = { id: string; label: string; pdf: string };
type SheetData = { sheets: Sheet[] };

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataUrl = `${baseWithSlash}data/rov_cheatsheets.json`;

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>ROV Cheat Sheet</h1>
      <p class="lead">Pick an ROV and open its PDF quick reference.</p>
    </header>

    <section class="card finder-card">
      <form id="sheet-form" class="finder-form">
        <div class="field">
          <label for="rov">Select ROV</label>
          <select id="rov" name="rov"></select>
        </div>
      </form>
    </section>

    <section class="row-with-action">
      <div class="card">
        <h2>Source material</h2>
        <p id="source-link" class="helper-text"></p>
      </div>
      <div class="row-action">
        <a class="btn" id="open-pdf" href="#" target="_blank" rel="noopener">Open PDF (new tab)</a>
      </div>
    </section>

    <section class="card">
      <iframe title="ROV Cheat Sheet" id="pdf-frame" class="pdf-frame"></iframe>
    </section>
  </main>
`;

const select = document.querySelector<HTMLSelectElement>('#rov');
const openBtn = document.querySelector<HTMLAnchorElement>('#open-pdf');
const sourceLink = document.querySelector<HTMLParagraphElement>('#source-link');
const frame = document.querySelector<HTMLIFrameElement>('#pdf-frame');

function setLinks(sheet: Sheet) {
  const pdfUrl = `${baseWithSlash}${sheet.pdf}`;
  if (openBtn) openBtn.href = pdfUrl;
  if (frame) frame.src = pdfUrl;
  if (sourceLink) sourceLink.innerHTML = `Current PDF: <a href="${pdfUrl}" target="_blank" rel="noopener">${sheet.label}</a>`;
}

async function loadSheets() {
  if (!select) return;
  try {
    select.innerHTML = `<option>Loading...</option>`;
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = (await res.json()) as SheetData;
    const sheets = payload?.sheets ?? [];
    if (!sheets.length) {
      select.innerHTML = `<option>No sheets found</option>`;
      return;
    }
    select.innerHTML = sheets.map((sheet, idx) => `<option value="${idx}">${sheet.label}</option>`).join('');
    setLinks(sheets[0]);
    select.addEventListener('change', () => {
      const idx = Number(select.value);
      const sheet = sheets[idx];
      if (sheet) setLinks(sheet);
    });
  } catch (error) {
    console.error('Failed to load rov_cheatsheets.json', error);
    select.innerHTML = `<option>Failed to load data</option>`;
  }
}

loadSheets();
