// T4 Maintenance Videos page.
// Grouped video directory with search across group names and video labels.
import '../style.css';

type VideoItem = { label: string; url: string };
type VideoGroup = { name: string; videos: VideoItem[] };
type VideoData = { groups: VideoGroup[] } | VideoGroup[];

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataUrl = `${baseWithSlash}data/t4_videos.json`;

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>T4 Maintenance Videos</h1>
      <p class="lead">Grouped videos for Titan 4 servicing. Search by part, assembly, or resolver task.</p>
    </header>

    <section class="card">
      <h2>T4 Quick Nav</h2>
      <div class="quick-nav">
        <div class="nav-buttons">
          <a class="nav-btn" href="t4-torque.html">T4 Torque</a>
          <a class="nav-btn" href="t4-slave-arm-drawing.html">T4 Slave Arm Drawing</a>
          <a class="nav-btn disabled" aria-disabled="true" tabindex="-1">T4 O-Rings (Coming soon)</a>
          <a class="nav-btn active" href="t4-videos.html">T4 Videos</a>
        </div>
      </div>
    </section>

    <section class="card finder-card">
      <form id="video-form" class="finder-form">
        <div class="field">
          <label for="query">Search videos</label>
          <input
            type="search"
            id="query"
            name="query"
            placeholder="Keyword or part (e.g., resolver, elbow, jaw)"
            autocomplete="off"
          />
        </div>
        <div class="button-row">
          <button type="submit" class="btn primary">Find</button>
          <button type="button" class="btn ghost" id="clear-btn">Clear</button>
        </div>
        <p class="helper-text">Filters across group names and video labels. Data comes from <code>public/data/t4_videos.json</code>.</p>
      </form>
    </section>

    <section class="card" id="results-card">
      <div class="card-header-row">
        <h2>Videos</h2>
        <span class="pill subtle" id="result-count"></span>
      </div>
      <div id="results"></div>
    </section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#video-form');
const queryInput = document.querySelector<HTMLInputElement>('#query');
const resultsContainer = document.querySelector<HTMLDivElement>('#results');
const resultCount = document.querySelector<HTMLSpanElement>('#result-count');
const clearButton = document.querySelector<HTMLButtonElement>('#clear-btn');

let groups: VideoGroup[] = [];

function renderEmpty(message: string) {
  if (resultsContainer) {
    resultsContainer.innerHTML = `<p class="helper-text">${message}</p>`;
  }
  if (resultCount) resultCount.textContent = '';
}

function copyLink(url: string) {
  navigator.clipboard.writeText(url).catch((error) => {
    console.error('Copy failed', error);
    alert('Copy failed. Please try again.');
  });
}

function matches(query: string, group: VideoGroup, video: VideoItem): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return group.name.toLowerCase().includes(q) || video.label.toLowerCase().includes(q);
}

function renderGroups(query: string) {
  if (!resultsContainer || !resultCount) return;

  if (!groups.length) {
    renderEmpty('No videos loaded.');
    return;
  }

  const trimmed = query.trim();
  const rows = groups.map((group) => {
    const matchedVideos = group.videos.filter((v) => matches(trimmed, group, v));
    if (!trimmed || matchedVideos.length) {
      const openAttr = trimmed && matchedVideos.length ? ' open' : '';
      const items = matchedVideos
        .map(
          (video) => `
          <div class="video-row">
            <div class="video-text">
              <p class="video-label">${video.label}</p>
            </div>
            <div class="video-actions">
              <a class="btn small" href="${video.url}" target="_blank" rel="noopener">Watch</a>
              <button class="btn small ghost copy-btn" data-url="${video.url}">Copy link</button>
            </div>
          </div>`
        )
        .join('');

      if (matchedVideos.length === 0 && trimmed) {
        return '';
      }

      return `
        <details class="video-group"${openAttr}>
          <summary>${group.name}</summary>
          <div class="video-list">
            ${items || '<p class="helper-text">No matches in this group.</p>'}
          </div>
        </details>
      `;
    }
    return '';
  });

  const rendered = rows.filter(Boolean).join('');
  const matchCount = rendered ? (rendered.match(/class=\"video-row\"/g) || []).length : 0;
  if (!rendered) {
    renderEmpty('No results. Try another term.');
    return;
  }
  resultCount.textContent = `${matchCount} match${matchCount === 1 ? '' : 'es'}`;
  resultsContainer.innerHTML = rendered;
}

async function loadVideos() {
  try {
    renderEmpty('Loading videos...');
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as VideoData | null;
    const list: VideoGroup[] = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as any)?.groups)
        ? (payload as any).groups
        : [];
    groups = list;
    if (!groups.length) {
      renderEmpty('No videos found in data file.');
    } else {
      renderGroups('');
    }
  } catch (error) {
    console.error('Failed to load videos data', error);
    renderEmpty('Failed to load videos. Check your network or JSON file.');
  }
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  renderGroups(queryInput?.value ?? '');
});

clearButton?.addEventListener('click', () => {
  if (queryInput) queryInput.value = '';
  renderGroups('');
});

queryInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    renderGroups(queryInput.value);
  }
});

resultsContainer?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('.copy-btn')) {
    const url = target.getAttribute('data-url');
    if (url) copyLink(url);
  }
});

// Initial load
loadVideos();
