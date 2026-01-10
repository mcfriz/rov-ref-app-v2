/*
  Manual and Drawing Viewer page logic.
  Loads a manual record by UID and shows the PDF plus related parent/child entries.
  Edit this file to adjust layout or related record logic.
*/
import '../style.css';

type ManualRecord = {
  uid?: string;
  id?: string;
  title?: string;
  manufacturer?: string;
  part_no?: string;
  category?: string;
  system?: string;
  file_name?: string;
  summary?: string;
  notes?: string;
  parent_uid?: string;
  parent_uids?: string[];
  pdf_url?: string;
  gdrive_view_url?: string;
};

type Manual = {
  uid: string;
  id?: string;
  title: string;
  manufacturer?: string;
  partNo?: string;
  category?: string;
  system?: string;
  fileName?: string;
  summary?: string;
  notes?: string;
  parentUid?: string;
  parentUids?: string[];
  pdfUrl?: string;
  gdriveUrl?: string;
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Root element #app not found');

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataUrl = `${baseWithSlash}data/manual.json`;

const params = new URLSearchParams(window.location.search);
const targetUid = params.get('uid') ?? '';

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="manual-finder.html">&larr; Back to Manual Finder</a></p>
    <header class="page-header">
      <h1>Manual and Drawing Viewer</h1>
      <p class="lead">Open manuals, drawings, and related attachments from the reference library.</p>
    </header>

    <section class="card" id="manual-details"></section>

    <section class="row-with-action" id="source-row" hidden>
      <div class="card">
        <h2>Source material</h2>
        <p class="helper-text" id="source-link"></p>
      </div>
      <div class="row-action">
        <a class="btn" id="open-pdf" href="#" target="_blank" rel="noopener">Open PDF (new tab)</a>
      </div>
    </section>

    <section class="card" id="pdf-card" hidden>
      <iframe title="Manual PDF" id="pdf-frame" class="pdf-frame"></iframe>
    </section>

    <section class="card" id="related-card">
      <h2>Related entries</h2>
      <div id="related-content"></div>
    </section>
  </main>
`;

const detailsCard = document.querySelector<HTMLDivElement>('#manual-details');
const sourceRow = document.querySelector<HTMLElement>('#source-row');
const sourceLink = document.querySelector<HTMLParagraphElement>('#source-link');
const openBtn = document.querySelector<HTMLAnchorElement>('#open-pdf');
const pdfCard = document.querySelector<HTMLElement>('#pdf-card');
const pdfFrame = document.querySelector<HTMLIFrameElement>('#pdf-frame');
const relatedContent = document.querySelector<HTMLDivElement>('#related-content');

function asDisplay(value?: string) {
  return value && value.trim() ? value : 'unknown';
}

function mapManual(raw: ManualRecord): Manual | null {
  const uid = raw.uid || raw.id || raw.title;
  if (!uid || !raw.title) return null;
  return {
    uid: String(uid),
    id: raw.id,
    title: raw.title,
    manufacturer: raw.manufacturer,
    partNo: raw.part_no,
    category: raw.category,
    system: raw.system,
    fileName: raw.file_name,
    summary: raw.summary,
    notes: raw.notes,
    parentUid: raw.parent_uid,
    parentUids: raw.parent_uids ?? [],
    pdfUrl: raw.pdf_url,
    gdriveUrl: raw.gdrive_view_url,
  };
}

function buildViewerLink(uid: string) {
  return `${baseWithSlash}apps/manual-viewer.html?uid=${encodeURIComponent(uid)}`;
}

function buildManualCard(item: Manual) {
  return `
    <div class="row-with-action">
      <article class="fit-card manual-card">
        <div class="manual-field">
          <span class="label">ID</span>
          <span>${asDisplay(item.id)}</span>
        </div>
        <div class="manual-field">
          <span class="label">Title</span>
          <strong>${asDisplay(item.title)}</strong>
        </div>
        <div class="manual-field">
          <span class="label">Manufacturer</span>
          <span>${asDisplay(item.manufacturer)}</span>
        </div>
        <div class="manual-field">
          <span class="label">Part No</span>
          <span>${asDisplay(item.partNo)}</span>
        </div>
        <div class="manual-field">
          <span class="label">Category</span>
          <span>${asDisplay(item.category)}</span>
        </div>
        <div class="manual-field">
          <span class="label">System</span>
          <span>${asDisplay(item.system)}</span>
        </div>
        <div class="manual-field">
          <span class="label">File Name</span>
          <span>${asDisplay(item.fileName)}</span>
        </div>
        <p class="helper-text">${asDisplay(item.summary)}</p>
      </article>
      <div class="row-action">
        <a class="btn small" href="${buildViewerLink(item.uid)}">Open</a>
      </div>
    </div>
  `;
}

function renderDetails(item: Manual) {
  if (!detailsCard) return;
  detailsCard.innerHTML = `
    <h2>${asDisplay(item.title)}</h2>
    <div class="manual-field">
      <span class="label">ID</span>
      <span>${asDisplay(item.id)}</span>
    </div>
    <div class="manual-field">
      <span class="label">Manufacturer</span>
      <span>${asDisplay(item.manufacturer)}</span>
    </div>
    <div class="manual-field">
      <span class="label">Part No</span>
      <span>${asDisplay(item.partNo)}</span>
    </div>
    <div class="manual-field">
      <span class="label">Category</span>
      <span>${asDisplay(item.category)}</span>
    </div>
    <div class="manual-field">
      <span class="label">System</span>
      <span>${asDisplay(item.system)}</span>
    </div>
    <div class="manual-field">
      <span class="label">File Name</span>
      <span>${asDisplay(item.fileName)}</span>
    </div>
    <p class="helper-text">${asDisplay(item.summary)}</p>
  `;
}

function renderPdf(item: Manual) {
  const pdfUrl = item.pdfUrl || item.gdriveUrl || '';
  if (!pdfUrl || !sourceRow || !sourceLink || !openBtn || !pdfCard || !pdfFrame) {
    if (sourceRow) sourceRow.hidden = true;
    if (pdfCard) pdfCard.hidden = true;
    if (sourceLink) sourceLink.textContent = 'No PDF available for this entry.';
    return;
  }
  sourceRow.hidden = false;
  pdfCard.hidden = false;
  sourceLink.innerHTML = `Current PDF: <a href="${pdfUrl}" target="_blank" rel="noopener">${asDisplay(item.fileName || item.title)}</a>`;
  openBtn.href = pdfUrl;
  pdfFrame.src = pdfUrl;
}

function renderRelated(item: Manual, all: Manual[]) {
  if (!relatedContent) return;
  const parentUids = [item.parentUid, ...(item.parentUids ?? [])].filter(Boolean) as string[];
  const uniqueParents = Array.from(new Set(parentUids));
  const parents = uniqueParents.map((uid) => all.find((entry) => entry.uid === uid)).filter(Boolean) as Manual[];

  const children = all.filter((entry) => {
    const hasDirectParent = entry.parentUid === item.uid;
    const hasParentList = (entry.parentUids ?? []).includes(item.uid);
    return hasDirectParent || hasParentList;
  });

  relatedContent.innerHTML = `
    <div class="card">
      <h3>Parent entries</h3>
      ${parents.length ? parents.map(buildManualCard).join('') : '<p class="helper-text">No parent entries found.</p>'}
    </div>
    <div class="card">
      <h3>Child entries</h3>
      ${children.length ? children.map(buildManualCard).join('') : '<p class="helper-text">No child entries found.</p>'}
    </div>
  `;
}

async function loadManual() {
  if (!targetUid) {
    if (detailsCard) detailsCard.innerHTML = '<p class="helper-text">Missing manual UID.</p>';
    if (relatedContent) relatedContent.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = (await res.json()) as ManualRecord[];
    const mapped = Array.isArray(payload) ? payload.map(mapManual).filter(Boolean) : [];
    const all = mapped as Manual[];
    const current = all.find((entry) => entry.uid === targetUid);
    if (!current) {
      if (detailsCard) detailsCard.innerHTML = '<p class="helper-text">Manual not found.</p>';
      if (relatedContent) relatedContent.innerHTML = '';
      return;
    }

    renderDetails(current);
    renderPdf(current);
    renderRelated(current, all);
  } catch (error) {
    console.error('Failed to load manual data', error);
    if (detailsCard) detailsCard.innerHTML = '<p class="helper-text">Failed to load manual data.</p>';
  }
}

loadManual();
