// Global search across app JSON sources.
// Aggregates cables, T4 parts, fittings, and T4 videos; ranks by simple relevance with source filtering.
import '../style.css';

type Result = {
  title: string;
  detail: string;
  source: string;
  kind: 'cable' | 'part' | 'fitting' | 'video';
  url?: string;
  score: number;
};

type Cable = { cableNo: string; name: string; link?: string; system?: string; rov?: string[]; tags?: string[]; notes?: string };
type CableData = { cables: Cable[] };

type PartRaw = { 'Part Number': string; Description: string; 'Expanded Description'?: string; link?: string; fileName?: string };
type Part = { partNumber: string; description: string; expanded?: string; link?: string };

type Fitting = { od?: number; id?: number; thread?: string; type?: string; tips?: string | null };

type VideoItem = { label: string; url: string };
type VideoGroup = { name: string; videos: VideoItem[] };

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Root element #app not found');

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;

const endpoints = {
  cables: `${baseWithSlash}data/cable.json`,
  parts: `${baseWithSlash}data/t4_parts_finder.json`,
  fittings: `${baseWithSlash}data/fittings.json`,
  videos: `${baseWithSlash}data/t4_videos.json`,
};

function normalize(text: string) {
  return text.toLowerCase();
}

function normalizeLoose(text: string) {
  return text.toLowerCase().replace(/[\s_\-\/]+/g, '');
}

function tokenScore(queryTokens: string[], hay: string) {
  const hayNorm = hay.toLowerCase();
  return queryTokens.reduce((score, token) => (hayNorm.includes(token) ? score + 6 : score), 0);
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

function scoreText(query: string, text: string) {
  const qNorm = normalize(query);
  const rawTokens = qNorm.split(/\s+/).filter(Boolean);
  const textNorm = text.toLowerCase();
  const qLoose = normalizeLoose(query);
  const textLoose = normalizeLoose(text);
  let score = 0;
  if (!qNorm) return score;
  if (textNorm.includes(qNorm)) score += 30;
  score += tokenScore(rawTokens, text);

  if (qLoose && textLoose) {
    if (textLoose.includes(qLoose)) score += 40;
    const dist = editDistance(qLoose, textLoose);
    if (dist === 1) score += 25;
    else if (dist === 2) score += 15;
  }
  return score;
}

function mapCables(data: any): Result[] {
  const items: Cable[] = Array.isArray(data) ? data : Array.isArray((data as CableData)?.cables) ? (data as CableData).cables : [];
  return items.map((cable) => {
    const detailParts = [cable.name, cable.system, cable.rov?.join(', '), cable.tags?.join(', '), cable.notes].filter(Boolean).join(' • ');
    return {
      title: cable.cableNo,
      detail: detailParts || cable.name || '',
      source: 'Cable',
      kind: 'cable',
      url: cable.link,
      score: 0,
    };
  });
}

function mapParts(data: any): Result[] {
  const list: Part[] = (Array.isArray(data) ? data : data?.cables ?? data ?? []).map((raw: PartRaw) => ({
    partNumber: raw['Part Number'],
    description: raw['Description'],
    expanded: raw['Expanded Description'],
    link: raw.link || (raw.fileName ? `${baseWithSlash}assets/pdfs/${raw.fileName}` : undefined),
  }));

  return list
    .filter((p) => p.partNumber && p.description)
    .map((part) => ({
      title: part.partNumber,
      detail: [part.description, part.expanded].filter(Boolean).join(' • '),
      source: 'T4 Part',
      kind: 'part',
      url: part.link,
      score: 0,
    }));
}

function mapFittings(data: any): Result[] {
  const list: Fitting[] = Array.isArray(data) ? data : [];
  return list.map((f) => {
    const dims = [f.od ? `OD ${f.od}mm` : '', f.id ? `ID ${f.id}mm` : ''].filter(Boolean).join(' / ');
    const detail = [dims, f.thread, f.type, f.tips || undefined].filter(Boolean).join(' • ');
    return {
      title: f.thread || f.type || 'Fitting',
      detail,
      source: 'Fitting',
      kind: 'fitting',
      url: undefined,
      score: 0,
    };
  });
}

function mapVideos(data: any): Result[] {
  const groups: VideoGroup[] = Array.isArray(data) ? data : Array.isArray(data?.groups) ? data.groups : [];
  const results: Result[] = [];
  groups.forEach((group) => {
    group.videos.forEach((video) => {
      results.push({
        title: video.label,
        detail: group.name,
        source: 'T4 Video',
        kind: 'video',
        url: video.url,
        score: 0,
      });
    });
  });
  return results;
}

async function fetchJson(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to load', url, error);
    return null;
  }
}

const queryParams = new URLSearchParams(window.location.search);
const initialQuery = queryParams.get('q') ?? '';

app.innerHTML = `
  <header class="topbar">
    <div class="topbar-left">
      <button class="icon-btn" id="burger-btn" aria-label="Open menu">
        <span aria-hidden="true">&#9776;</span>
      </button>
      <img class="brand-mark" src="${baseWithSlash}assets/images/ROV_REF_Logo_black_on_transparent.png" alt="ROV Reference App logo" />
    </div>
    <div class="topbar-center">
      <form class="search-form" role="search" action="${baseWithSlash}apps/search.html">
        <label class="sr-only" for="desktop-search-input">Search</label>
        <input id="desktop-search-input" type="search" name="q" placeholder="Search everything" value="${initialQuery}" />
        <button type="submit" class="icon-btn" aria-label="Search">
          <span aria-hidden="true">&#128269;</span>
        </button>
      </form>
    </div>
    <div class="topbar-right">
      <button class="icon-btn mobile-search-btn" id="search-toggle" aria-label="Open search" aria-expanded="false" aria-controls="search-panel">
        <span aria-hidden="true">&#128269;</span>
      </button>
    </div>
  </header>
  <div id="search-panel" class="search-panel" hidden>
    <form class="search-form" role="search" action="${baseWithSlash}apps/search.html">
      <label class="sr-only" for="mobile-search-input">Search</label>
      <input id="mobile-search-input" type="search" name="q" placeholder="Search everything" value="${initialQuery}" />
      <button type="submit" class="icon-btn" aria-label="Search">
        <span aria-hidden="true">&#128269;</span>
      </button>
    </form>
  </div>
  <main class="page narrow-page">
    <p class="back"><a href="../">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>Search</h1>
      <p class="lead">Search cables, T4 parts, fittings, and videos. Results are ranked by closest match.</p>
    </header>

    <section class="card finder-card">
      <form id="finder-form" class="finder-form">
        <div class="field">
          <label for="query">Search everything</label>
          <input type="search" id="query" name="q" placeholder="e.g., resolver, CBL-1023, O-ring, yaw" value="${initialQuery}" autocomplete="off" />
        </div>
        <div class="field">
          <label for="source-filter">Source</label>
          <select id="source-filter" name="source">
            <option value="all">Global (all sources)</option>
            <option value="cable">Cables only</option>
            <option value="part">T4 parts only</option>
            <option value="fitting">Fittings only</option>
            <option value="video">T4 videos only</option>
          </select>
        </div>
        <div class="button-row">
          <button type="submit" class="btn primary">Find</button>
          <button type="button" class="btn ghost" id="clear-btn">Clear</button>
        </div>
        <p class="helper-text">Pulls from cable.json, t4_parts_finder.json, fittings.json, and t4_videos.json.</p>
      </form>
    </section>

    <section class="card" id="results-card">
      <div class="card-header-row">
        <h2>Results</h2>
        <span class="pill subtle" id="result-count"></span>
      </div>
      <div id="results"></div>
    </section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#finder-form');
const queryInput = document.querySelector<HTMLInputElement>('#query');
const sourceSelect = document.querySelector<HTMLSelectElement>('#source-filter');
const resultsContainer = document.querySelector<HTMLDivElement>('#results');
const resultCount = document.querySelector<HTMLSpanElement>('#result-count');
const clearButton = document.querySelector<HTMLButtonElement>('#clear-btn');

let allResults: Result[] = [];

function renderEmpty(message: string) {
  if (resultsContainer) {
    resultsContainer.innerHTML = `<p class="helper-text">${message}</p>`;
  }
  if (resultCount) resultCount.textContent = '';
}

function render(list: Result[]) {
  if (!resultsContainer || !resultCount) return;
  if (!list.length) {
    renderEmpty('No results. Try another term.');
    return;
  }
  resultCount.textContent = `${list.length} match${list.length === 1 ? '' : 'es'}`;
  const usingDesktop = window.matchMedia('(min-width: 768px)').matches;
  const limit = usingDesktop ? 25 : 10;
  const top = list.slice(0, limit);

  if (usingDesktop) {
    const rows = top
      .map(
        (entry, index) => `
        <tr class="${index === 0 ? 'highlight' : ''}">
          <td>${entry.title}</td>
          <td>${entry.detail}</td>
          <td>${entry.source}</td>
          <td class="actions">
            ${entry.url ? `<a class="btn small" href="${entry.url}" target="_blank" rel="noopener">Open</a>` : ''}
          </td>
        </tr>
      `
      )
      .join('');
    resultsContainer.innerHTML = `
      <div class="table-scroll">
        <table class="result-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Detail</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = top
      .map(
        (entry, index) => `
        <article class="fit-card ${index === 0 ? 'highlight' : ''}">
          <div class="fit-row">
            <span class="label">Title</span>
            <strong>${entry.title}</strong>
          </div>
          <div class="fit-row">
            <span class="label">Detail</span>
            <span>${entry.detail}</span>
          </div>
          <div class="fit-row">
            <span class="label">Source</span>
            <span>${entry.source}</span>
          </div>
          <div class="fit-actions" style="gap:0.5rem; flex-wrap: wrap; justify-content: flex-start;">
            ${entry.url ? `<a class="btn small" href="${entry.url}" target="_blank" rel="noopener">Open</a>` : ''}
          </div>
        </article>
      `
      )
      .join('');
  }
}

function search(event?: Event) {
  event?.preventDefault();
  const query = (queryInput?.value || '').trim();
  const filter = sourceSelect?.value ?? 'all';
  if (!query) {
    renderEmpty('Enter a term to search all data.');
    return;
  }

  const filtered = filter === 'all' ? allResults : allResults.filter((r) => r.kind === filter);

  const results = filtered
    .map((r) => ({ ...r, score: scoreText(query, `${r.title} ${r.detail} ${r.source}`) }))
    .sort((a, b) => b.score - a.score);

  render(results);
}

async function loadAll() {
  renderEmpty('Loading search index...');
  const [cables, parts, fittings, videos] = await Promise.all([
    fetchJson(endpoints.cables),
    fetchJson(endpoints.parts),
    fetchJson(endpoints.fittings),
    fetchJson(endpoints.videos),
  ]);

  allResults = [...mapCables(cables), ...mapParts(parts), ...mapFittings(fittings), ...mapVideos(videos)];
  if (!allResults.length) {
    renderEmpty('No data loaded.');
    return;
  }
  if (initialQuery) {
    search();
  } else {
    renderEmpty('Enter a term to search all data.');
  }
}

form?.addEventListener('submit', search);
clearButton?.addEventListener('click', () => {
  if (queryInput) queryInput.value = '';
  if (sourceSelect) sourceSelect.value = 'all';
  renderEmpty('Enter a term to search all data.');
});

queryInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    search();
  }
});

// Initial load
loadAll();

// Mobile search panel toggle (header).
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
