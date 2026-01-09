// Cable Finder page logic.
// Mirrors the Fitting Finder experience with a single search box and closest-match ranking.
import '../style.css';

type Cable = {
  cableNo: string;
  name: string;
  link: string;
  system?: string;
  rov?: string[];
  tags?: string[];
  notes?: string;
};

type CableData = {
  cables: Cable[];
};

type RankedCable = {
  cable: Cable;
  score: number;
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

// BASE_URL keeps fetch paths working on GitHub Pages sub-paths.
const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataUrl = `${baseWithSlash}data/cable.json`;

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>Cable Finder</h1>
      <p class="lead">Search cable numbers and keywords, open drawings fast.</p>
    </header>

    <section class="card finder-card">
      <div class="finder-row">
        <form id="finder-form" class="finder-form">
          <div class="field">
            <label for="query">Search</label>
            <input
              type="search"
              id="query"
              name="query"
              placeholder="Cable number or keyword (e.g., CBL-1023, temp sensor)"
              autocomplete="off"
            />
          </div>
          <p class="helper-text">Press Enter or tap "Find" to search.</p>
        </form>
        <div class="finder-action">
          <button type="submit" class="btn primary" form="finder-form">Find</button>
        </div>
      </div>
    </section>

    <section class="card" id="featured-cables">
      <h2>Featured cables</h2>
      <p class="helper-text">Three random picks from the cable library.</p>
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
      <details class="accordion-item" open>
        <summary>About this tool</summary>
        <div class="accordion-body">
          <p>Type a cable number or keyword to see the closest matches. The best match is highlighted at the top.</p>
          <p>Use it to jump straight to drawings and copy numbers for work orders.</p>
        </div>
      </details>
      <details class="accordion-item">
        <summary>Tips for searching</summary>
        <div class="accordion-body">
          <ul>
            <li>Try full numbers: <code>CBL-1023</code></li>
            <li>Use keywords: <code>temp sensor</code>, <code>umbilical</code></li>
            <li>Partial works too: <code>102</code>, <code>umb</code></li>
          </ul>
          <p>Minor typos are tolerated: <code>cbl1023</code> will still match <code>CBL-1023</code>.</p>
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

let cables: Cable[] = [];

const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

function normalize(text: string) {
  return text.toLowerCase().replace(/[\s-]+/g, '');
}

function tokenScore(queryTokens: string[], hay: string) {
  const hayNorm = hay.toLowerCase();
  return queryTokens.reduce((score, token) => (hayNorm.includes(token) ? score + 6 : score), 0);
}

// Lightweight edit distance for cable numbers only (limits typo cost).
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

function scoreCable(query: string, cable: Cable): number {
  const qNorm = normalize(query);
  const rawTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const cableNoNorm = normalize(cable.cableNo);
  const nameNorm = cable.name.toLowerCase();

  let score = 0;
  if (!qNorm) return score;

  if (qNorm === cableNoNorm) score += 120;
  if (cableNoNorm.includes(qNorm)) score += 80;

  // Fuzzy for cable number (short strings).
  if (Math.abs(cableNoNorm.length - qNorm.length) <= 2) {
    const dist = editDistance(qNorm, cableNoNorm);
    if (dist === 1) score += 40;
    else if (dist === 2) score += 20;
  }

  // Name and meta fields (token-based and full-string contains).
  if (nameNorm.includes(qNorm)) score += 40;
  score += tokenScore(rawTokens, cable.name);
  if (cable.system) score += tokenScore(rawTokens, cable.system);
  if (cable.rov) score += tokenScore(rawTokens, cable.rov.join(' '));
  if (cable.tags) score += tokenScore(rawTokens, cable.tags.join(' '));
  if (cable.notes) score += tokenScore(rawTokens, cable.notes);

  return score;
}

function renderEmpty(message: string) {
  if (resultsContainer) {
    resultsContainer.innerHTML = `<p class="helper-text">${message}</p>`;
  }
  if (resultCount) resultCount.textContent = '';
}

function renderResults(results: RankedCable[]) {
  if (!resultsContainer || !resultCount) return;

  if (!results.length) {
    renderEmpty('No matching cables found. Try another term.');
    return;
  }

  const usingDesktopLayout = isDesktop();
  const limit = usingDesktopLayout ? 15 : 5;
  const top = results.slice(0, limit);
  resultCount.textContent = `${top.length} shown (best match first)`;

  if (usingDesktopLayout) {
    resultsContainer.innerHTML = top
      .map(
        (entry, index) => `
        <div class="row-with-action">
          <article class="fit-card cable-card ${index === 0 ? 'highlight' : ''}">
            <div class="cable-field">
              <span class="label">Cable No</span>
              <strong>${entry.cable.cableNo}</strong>
            </div>
            <div class="cable-field">
              <span class="label">Name</span>
              <span>${entry.cable.name}</span>
            </div>
            ${
              entry.cable.system
                ? `<div class="cable-field"><span class="label">System</span><span>${entry.cable.system}</span></div>`
                : ''
            }
            ${
              entry.cable.rov?.length
                ? `<div class="cable-field"><span class="label">ROV</span><span>${entry.cable.rov.join(', ')}</span></div>`
                : ''
            }
            ${
              entry.cable.tags?.length
                ? `<div class="cable-field"><span class="label">Tags</span><span>${entry.cable.tags.join(', ')}</span></div>`
                : ''
            }
            ${
              entry.cable.notes
                ? `<div class="cable-field"><span class="label">Notes</span><span>${entry.cable.notes}</span></div>`
                : ''
            }
          </article>
          <div class="row-action">
            <a class="btn small" href="${entry.cable.link}" target="_blank" rel="noopener noreferrer">Open drawing</a>
          </div>
        </div>
      `
      )
      .join('');
  } else {
    resultsContainer.innerHTML = top
      .map(
        (entry, index) => `
        <div class="row-with-action">
          <article class="fit-card cable-card ${index === 0 ? 'highlight' : ''}">
            <div class="cable-field">
              <span class="label">Cable No</span>
              <strong>${entry.cable.cableNo}</strong>
            </div>
            <div class="cable-field">
              <span class="label">Name</span>
              <span>${entry.cable.name}</span>
            </div>
            ${
              entry.cable.system
                ? `<div class="cable-field"><span class="label">System</span><span>${entry.cable.system}</span></div>`
                : ''
            }
            ${
              entry.cable.rov?.length
                ? `<div class="cable-field"><span class="label">ROV</span><span>${entry.cable.rov.join(', ')}</span></div>`
                : ''
            }
            ${
              entry.cable.tags?.length
                ? `<div class="cable-field"><span class="label">Tags</span><span>${entry.cable.tags.join(', ')}</span></div>`
                : ''
            }
            ${
              entry.cable.notes
                ? `<div class="cable-field"><span class="label">Notes</span><span>${entry.cable.notes}</span></div>`
                : ''
            }
          </article>
          <div class="row-action">
            <a class="btn small" href="${entry.cable.link}" target="_blank" rel="noopener noreferrer">Open drawing</a>
          </div>
        </div>
      `
      )
      .join('');
  }
}

function search(event?: Event) {
  event?.preventDefault();
  if (!queryInput) return;
  const query = queryInput.value.trim();
  if (!query) {
    renderEmpty('Enter a cable number or keyword to begin.');
    return;
  }
  if (!cables.length) {
    renderEmpty('No cable data loaded yet.');
    return;
  }

  const rankedAll = cables
    .map((cable) => ({ cable, score: scoreCable(query, cable) }))
    .sort((a, b) => (b.score === a.score ? a.cable.cableNo.localeCompare(b.cable.cableNo) : b.score - a.score));

  const withScore = rankedAll.filter((entry) => entry.score > 0);
  const toShow = withScore.length ? withScore : rankedAll;

  renderResults(toShow);
}

async function loadCables() {
  try {
    renderEmpty('Loading cables...');
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as CableData | Cable[];
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as CableData)?.cables)
        ? (payload as CableData).cables
        : [];
    cables = list;
    if (!cables.length) {
      renderEmpty('No cables found in data file.');
    } else {
      if (featuredList) {
        const picks = [...cables]
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(3, cables.length));
        featuredList.innerHTML = picks
          .map(
            (entry) => `
            <div class="row-with-action">
              <div class="video-row featured-card">
                <div class="video-text">
                  <div class="featured-field">
                    <span class="label">Cable No</span>
                    <strong>${entry.cableNo}</strong>
                  </div>
                  <div class="featured-field">
                    <span class="label">Name</span>
                    <span>${entry.name}</span>
                  </div>
                </div>
              </div>
              <div class="row-action">
                <a class="btn small" href="${entry.link}" target="_blank" rel="noopener noreferrer">Open drawing</a>
              </div>
            </div>`
          )
          .join('');
      }
      renderEmpty('Enter a cable number or keyword to begin.');
    }
  } catch (error) {
    console.error('Failed to load cables data', error);
    renderEmpty('Failed to load cable data. Check your network or JSON file.');
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
loadCables();
