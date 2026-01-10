// Atlas Parts Finder page logic.
// Uses a single search box to rank closest matches by part number, description, and expanded details.
import '../style.css';
import { initSpecsModal } from '../ui/specs-modal';

type Part = {
  partNumber: string;
  description: string;
  expandedDescription?: string;
  link?: string;
  fileName?: string;
};

type RawPart = {
  'Part Number'?: string;
  Description?: string;
  'Expanded Description'?: string;
  partNumber?: string;
  description?: string;
  expandedDescription?: string;
  link?: string;
  fileName?: string;
};

type RankedPart = {
  part: Part;
  score: number;
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataUrl = `${baseWithSlash}data/atlas_parts_finder.json`;

function normalize(text: string) {
  return text.toLowerCase().replace(/[\s-]+/g, '');
}

function mapPart(raw: RawPart): Part | null {
  const partNumber = raw['Part Number'] ?? raw.partNumber;
  const description = raw.Description ?? raw.description;
  const expandedDescription = raw['Expanded Description'] ?? raw.expandedDescription;
  if (!partNumber || !description) return null;
  return {
    partNumber: String(partNumber).trim(),
    description: String(description).trim(),
    expandedDescription: expandedDescription ? String(expandedDescription).trim() : undefined,
    link: raw.link,
    fileName: raw.fileName,
  };
}

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>Atlas Parts Finder</h1>
      <p class="lead">Search part numbers and keywords, see the closest matches fast.</p>
    </header>

    <section class="card">
      <h2>Atlas Quick Nav</h2>
      <div class="quick-nav">
        <div class="nav-buttons">
          <a class="nav-btn" href="atlas-cheat-sheet.html">Atlas Cheat Sheet</a>
          <a class="nav-btn" href="atlas-hose-list.html">Atlas Valve Package Hose List</a>
          <a class="nav-btn active" href="atlas-parts-finder.html">Atlas Parts Finder</a>
          <button class="nav-btn" type="button" id="atlas-specs-open">Atlas 7F Specs</button>
        </div>
      </div>
    </section>

    <section class="card finder-card">
      <div class="finder-row">
        <form id="finder-form" class="finder-form">
          <div class="field">
            <label for="query">Search</label>
            <input
              type="search"
              id="query"
              name="query"
              placeholder="Part number or keyword (e.g., 008-0216, seal, bearing)"
              autocomplete="off"
            />
          </div>
          <p class="helper-text">Fields marked with * in descriptions mean they are not fully confirmed.</p>
        </form>
        <div class="finder-action">
          <button type="submit" class="btn primary" form="finder-form">Find</button>
        </div>
      </div>
    </section>

    <section class="card" id="results-card">
      <div class="card-header-row">
        <h2>Results</h2>
        <span class="pill subtle" id="result-count"></span>
      </div>
      <div id="results"></div>
    </section>

    <section class="card accordion">
      <details class="accordion-item" open>
        <summary>About this tool</summary>
        <div class="accordion-body">
          <p>Search Atlas manipulator part numbers and descriptions. The best match is listed first.</p>
          <p>Expanded descriptions include helpful context; entries with * may need confirmation.</p>
        </div>
      </details>
      <details class="accordion-item">
        <summary>Tips for searching</summary>
        <div class="accordion-body">
          <ul>
            <li>Try full numbers: <code>008-0216</code></li>
            <li>Use keywords: <code>o-ring</code>, <code>seal</code>, <code>bearing</code></li>
            <li>Partial works too: <code>008</code>, <code>ring</code></li>
          </ul>
          <p>Minor typos are tolerated for part numbers; keywords match descriptions and expanded details.</p>
        </div>
      </details>
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

const form = document.querySelector<HTMLFormElement>('#finder-form');
const queryInput = document.querySelector<HTMLInputElement>('#query');
const resultsContainer = document.querySelector<HTMLDivElement>('#results');
const resultCount = document.querySelector<HTMLSpanElement>('#result-count');

let parts: Part[] = [];

const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

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

function scorePart(query: string, part: Part): number {
  const qNorm = normalize(query);
  const rawTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const partNoNorm = normalize(part.partNumber);
  const descNorm = part.description.toLowerCase();
  const expandedNorm = (part.expandedDescription ?? '').toLowerCase();

  let score = 0;
  if (!qNorm) return score;

  if (qNorm === partNoNorm) score += 120;
  if (partNoNorm.includes(qNorm)) score += 80;

  if (Math.abs(partNoNorm.length - qNorm.length) <= 2) {
    const dist = editDistance(qNorm, partNoNorm);
    if (dist === 1) score += 40;
    else if (dist === 2) score += 20;
  }

  if (descNorm.includes(qNorm)) score += 40;
  score += tokenScore(rawTokens, part.description);
  if (expandedNorm.includes(qNorm)) score += 30;
  score += tokenScore(rawTokens, expandedNorm);

  return score;
}

function renderEmpty(message: string) {
  if (resultsContainer) {
    resultsContainer.innerHTML = `<p class="helper-text">${message}</p>`;
  }
  if (resultCount) resultCount.textContent = '';
}

function buildFileUrl(part: Part) {
  if (part.link) return part.link;
  if (part.fileName) return `${baseWithSlash}assets/pdfs/${part.fileName}`;
  return '';
}

initSpecsModal({
  openButtonId: 'atlas-specs-open',
  modalId: 'atlas-specs-modal',
  titleId: 'atlas-specs-title',
  closeButtonId: 'atlas-specs-close',
  tableBodyId: 'atlas-specs-body',
  dataUrl: `${baseWithSlash}data/atlas_specs.json`,
});

function renderResults(results: RankedPart[]) {
  if (!resultsContainer || !resultCount) return;

  if (!results.length) {
    renderEmpty('No matching parts found. Try another term.');
    return;
  }

  const usingDesktopLayout = isDesktop();
  const limit = usingDesktopLayout ? 15 : 5;
  const top = results.slice(0, limit);
  resultCount.textContent = `${top.length} shown (best match first)`;

  if (usingDesktopLayout) {
    const rows = top
      .map((entry, index) => {
        const url = buildFileUrl(entry.part);
        const linkCell = url ? `<a class="btn small" href="${url}" target="_blank" rel="noopener">Open file</a>` : '';
        return `
        <tr class="${index === 0 ? 'highlight' : ''}">
          <td>${entry.part.partNumber}</td>
          <td>${entry.part.description}</td>
          <td>${entry.part.expandedDescription ?? ''}</td>
          <td class="actions">
            ${linkCell}
          </td>
        </tr>
      `;
      })
      .join('');

    resultsContainer.innerHTML = `
      <div class="table-scroll">
        <table class="result-table">
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Description</th>
              <th>Expanded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = top
      .map((entry, index) => {
        const url = buildFileUrl(entry.part);
        const linkBtn = url ? `<a class="btn small" href="${url}" target="_blank" rel="noopener">Open file</a>` : '';
        return `
        <article class="fit-card ${index === 0 ? 'highlight' : ''}">
          <div class="fit-row">
            <span class="label">Part No</span>
            <strong>${entry.part.partNumber}</strong>
          </div>
          <div class="fit-row">
            <span class="label">Description</span>
            <span>${entry.part.description}</span>
          </div>
          ${entry.part.expandedDescription ? `<div class="fit-row"><span class="label">Expanded</span><span>${entry.part.expandedDescription}</span></div>` : ''}
          <div class="fit-actions" style="gap: 0.5rem; flex-wrap: wrap; justify-content: flex-start;">
            ${linkBtn}
          </div>
        </article>
      `;
      })
      .join('');
  }
}

function search(event?: Event) {
  event?.preventDefault();
  if (!queryInput) return;
  const query = queryInput.value.trim();
  if (!query) {
    renderEmpty('Enter a part number or keyword to begin.');
    return;
  }
  if (!parts.length) {
    renderEmpty('No parts loaded yet.');
    return;
  }

  const rankedAll = parts
    .map((part) => ({ part, score: scorePart(query, part) }))
    .sort((a, b) => (b.score === a.score ? a.part.partNumber.localeCompare(b.part.partNumber) : b.score - a.score));

  const withScore = rankedAll.filter((entry) => entry.score > 0);
  const toShow = withScore.length ? withScore : rankedAll;

  renderResults(toShow);
}

async function loadParts() {
  try {
    renderEmpty('Loading parts...');
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (!text.trim()) {
      renderEmpty('Atlas parts data file is empty. Add entries to public/data/atlas_parts_finder.json.');
      return;
    }

    const payload = JSON.parse(text);
    if (!payload) {
      renderEmpty('Failed to load parts data. Check your JSON file.');
      return;
    }

    const rawList: RawPart[] = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as any)?.parts)
        ? (payload as any).parts
        : Array.isArray((payload as any)?.items)
          ? (payload as any).items
          : Array.isArray((payload as any)?.cables)
            ? (payload as any).cables
            : (payload as any)?.parts ?? (payload as any)?.items ?? (payload as any)?.cables ?? (payload as any) ?? [];

    const mapped = rawList.map(mapPart).filter((p): p is Part => Boolean(p));
    parts = mapped;
    if (!parts.length) {
      renderEmpty('No parts found in data file.');
    } else {
      renderEmpty('Enter a part number or keyword to begin.');
    }
  } catch (error) {
    console.error('Failed to load parts data', error);
    renderEmpty('Failed to load parts data. Check your network or JSON file.');
  }
}

form?.addEventListener('submit', search);
queryInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    search();
  }
});

// Initial data load
loadParts();

