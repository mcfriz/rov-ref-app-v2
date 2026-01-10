// Manual & Drawing Finder
// Loads manual/drawing references from manual.json and ranks closest matches.
import '../style.css';

type RawRecord = {
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
  featured?: boolean;
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
  featured?: boolean;
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Root element #app not found');

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataUrl = `${baseWithSlash}data/manual.json`;
const viewerUrl = `${baseWithSlash}apps/manual-viewer.html`;

const queryParams = new URLSearchParams(window.location.search);
const initialQuery = queryParams.get('q') ?? '';

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>Manual & Drawing Finder</h1>
      <p class="lead">Search manuals, drawings and reference files by number, name, or keyword.</p>
    </header>

    <section class="card finder-card">
      <div class="finder-row">
        <form id="finder-form" class="finder-form">
          <div class="field">
            <label for="query">Search</label>
            <input
              id="query"
              type="search"
              name="q"
              placeholder="Document number, name, or keyword..."
              value="${initialQuery}"
              autocomplete="off"
            />
          </div>
          <p class="helper-text">Open a result to view the PDF and related entries.</p>
        </form>
        <div class="finder-action">
          <button type="submit" class="btn primary" form="finder-form">Find</button>
        </div>
      </div>
    </section>

    <section class="card" id="featured-manuals">
      <h2>Featured manuals</h2>
      <p class="helper-text">Three random picks from the reference library.</p>
      <div id="featured-list"></div>
    </section>

    <section class="card" id="results-card">
      <div class="card-header-row">
        <h2>Results</h2>
        <span class="pill subtle" id="result-count"></span>
      </div>
      <div id="results"></div>
    </section>

    <section class="card accordion">
      <details class="accordion-item">
        <summary>Tips for searching</summary>
        <div class="accordion-body">
          <ul>
            <li>Try a document number (e.g., <code>T4</code> or <code>SA-380</code>).</li>
            <li>Use equipment keywords like <em>thruster</em>, <em>elbow</em>, or <em>jaw</em>.</li>
            <li>Partial matches work: typing <code>rig</code> will find Rigmaster items.</li>
          </ul>
        </div>
      </details>
    </section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#finder-form');
const queryInput = document.querySelector<HTMLInputElement>('#query');
const resultsContainer = document.querySelector<HTMLDivElement>('#results');
const resultCount = document.querySelector<HTMLSpanElement>('#result-count');
const featuredList = document.querySelector<HTMLDivElement>('#featured-list');

let manuals: Manual[] = [];

function normalize(text: string) {
  return text.toLowerCase();
}

function normalizeLoose(text: string) {
  return text.toLowerCase().replace(/[\s_\-\/]+/g, '');
}

function tokenScore(queryTokens: string[], hay: string) {
  const hayNorm = hay.toLowerCase();
  return queryTokens.reduce((score, token) => (hayNorm.includes(token) ? score + 8 : score), 0);
}

function editDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function scoreRecord(query: string, record: Manual) {
  const q = query.trim();
  if (!q) return 0;

  const qNorm = normalize(q);
  const qLoose = normalizeLoose(q);
  const tokens = qNorm.split(/\s+/).filter(Boolean);

  const docNo = normalize(record.id || '');
  const docLoose = normalizeLoose(record.id || '');
  const title = normalize(record.title || '');
  const desc = normalize(record.summary || '');
  const category = normalize(record.category || '');
  const manufacturer = normalize(record.manufacturer || '');
  const system = normalize(record.system || '');
  const partNo = normalize(record.partNo || '');
  const fileName = normalize(record.fileName || '');

  let score = 0;

  if (record.id) {
    if (docLoose === qLoose) score += 140;
    else if (docLoose.includes(qLoose)) score += 90;
    else if (docNo.includes(qNorm)) score += 80;
  }

  if (title.includes(qNorm)) score += 70;
  score += tokenScore(tokens, record.title || '');

  if (desc.includes(qNorm)) score += 40;
  score += tokenScore(tokens, record.summary || '');

  if (category.includes(qNorm) || system.includes(qNorm)) score += 25;
  if (manufacturer.includes(qNorm) || partNo.includes(qNorm)) score += 30;
  if (fileName.includes(qNorm)) score += 20;

  const combined = `${record.title} ${record.summary ?? ''} ${record.category ?? ''} ${record.system ?? ''} ${record.manufacturer ?? ''} ${record.partNo ?? ''} ${record.fileName ?? ''}`;
  const combinedLoose = normalizeLoose(combined);
  if (combinedLoose && qLoose) {
    if (combinedLoose.includes(qLoose)) score += 60;
    const dist = editDistance(qLoose, combinedLoose);
    if (dist === 1) score += 30;
    else if (dist === 2) score += 18;
  }

  return score;
}

function renderEmpty(message: string) {
  if (resultsContainer) {
    resultsContainer.innerHTML = `<p class="helper-text">${message}</p>`;
  }
  if (resultCount) resultCount.textContent = '';
}

function asDisplay(value?: string) {
  return value && value.trim() ? value : 'unknown';
}

function helperText(item: Manual) {
  const candidates = [item.summary, item.notes, item.fileName];
  const value = candidates.find((entry) => entry && entry.trim());
  return asDisplay(value);
}

function buildViewerUrl(item: Manual) {
  return `${viewerUrl}?uid=${encodeURIComponent(item.uid)}`;
}

function renderResults(list: Manual[]) {
  if (!resultsContainer || !resultCount) return;
  if (!list.length) {
    renderEmpty('No results. Try another term.');
    return;
  }

  const usingDesktop = window.matchMedia('(min-width: 768px)').matches;
  const limit = usingDesktop ? 20 : 5;
  const top = list.slice(0, limit);
  resultCount.textContent = `${top.length} shown (best match first)`;

  const rows = top
    .map(
      (item, index) => `
        <div class="row-with-action">
          <article class="fit-card manual-card ${index === 0 ? 'highlight' : ''}">
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
            <p class="helper-text">${helperText(item)}</p>
          </article>
          <div class="row-action">
            <a class="btn small" href="${buildViewerUrl(item)}">Open</a>
          </div>
        </div>
      `
    )
    .join('');

  resultsContainer.innerHTML = rows;

}

async function loadData() {
  renderEmpty('Loading manuals...');
  try {
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list: RawRecord[] = Array.isArray(json) ? json : [];
    manuals = list.map((item) => ({
      uid: item.uid || item.id || item.title || 'unknown',
      id: item.id,
      title: item.title || 'Untitled',
      manufacturer: item.manufacturer,
      partNo: item.part_no,
      category: item.category,
      system: item.system,
      fileName: item.file_name,
      summary: item.summary,
      notes: item.notes,
      parentUid: item.parent_uid,
      parentUids: item.parent_uids ?? [],
      pdfUrl: item.pdf_url,
      gdriveUrl: item.gdrive_view_url,
      featured: item.featured === true,
    }));

    if (featuredList && manuals.length) {
      const featuredOnly = manuals.filter((item) => item.featured);
      const picks = [...featuredOnly]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(3, featuredOnly.length));
      featuredList.innerHTML = picks
        .map(
          (item) => `
          <div class="row-with-action">
            <div class="video-row featured-card">
              <div class="video-text">
                <div class="featured-field">
                  <span class="label">Title</span>
                  <strong>${asDisplay(item.title)}</strong>
                </div>
                <div class="featured-field">
                  <span class="label">File Name</span>
                  <span>${asDisplay(item.fileName)}</span>
                </div>
              </div>
            </div>
            <div class="row-action">
              <a class="btn small" href="${buildViewerUrl(item)}">Open</a>
            </div>
          </div>`
        )
        .join('');
    }

    if (!initialQuery) {
      renderEmpty('Enter a term to search manuals and drawings.');
    } else {
      search();
    }
  } catch (error) {
    console.error('Failed to load manuals', error);
    renderEmpty('Could not load data. Please try again later.');
  }
}

function search(event?: Event) {
  event?.preventDefault();
  const query = (queryInput?.value || '').trim();
  if (!query) {
    renderEmpty('Enter a term to search manuals and drawings.');
    return;
  }
  const scored = manuals
    .map((item) => ({ item, score: scoreRecord(query, item) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);

  renderResults(scored);
}

form?.addEventListener('submit', search);
queryInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    search();
  }
});

loadData();
