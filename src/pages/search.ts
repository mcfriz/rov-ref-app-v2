// Global search across app JSON sources.
// Aggregates cables, T4 parts, fittings, videos, and manuals; ranks by simple relevance with source filtering.
import '../style.css';

type Result = {
  title: string;
  detail: string;
  source: string;
  kind: 'cable' | 'part' | 'atlas-part' | 'fitting' | 'video' | 'manual' | 'manual-view' | 'mini-app';
  url?: string;
  docNo?: string;
  img?: string;
  score: number;
};

type Cable = { cableNo: string; name: string; link?: string; system?: string; rov?: string[]; tags?: string[]; notes?: string };
type CableData = { cables: Cable[] };

type PartRaw = { 'Part Number': string; Description: string; 'Expanded Description'?: string; link?: string; fileName?: string };
type Part = { partNumber: string; description: string; expanded?: string; link?: string };

type Fitting = { od?: number; id?: number; thread?: string; type?: string; tips?: string | null };

type VideoItem = { label: string; url: string };
type VideoGroup = { name: string; videos: VideoItem[] };

type ManualRaw = {
  'Document name'?: string;
  'Document number'?: string;
  Description?: string;
  Category?: string;
  Equipment?: string;
  'Date approved'?: string;
  Link?: string;
};

type Manual = {
  title: string;
  docNo?: string;
  description?: string;
  category?: string;
  equipment?: string;
  date?: string;
  link?: string;
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Root element #app not found');

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const partNumberPattern = /^\d{3}-\d{4}$/;
const buildHref = (slug: string) => `${baseWithSlash}apps/${slug}.html`;
const buildAsset = (path: string) => `${baseWithSlash}${path}`;

const endpoints = {
  cables: `${baseWithSlash}data/cable.json`,
  parts: `${baseWithSlash}data/t4_parts_finder.json`,
  atlasParts: `${baseWithSlash}data/atlas_parts_finder.json`,
  fittings: `${baseWithSlash}data/fittings.json`,
  videos: `${baseWithSlash}data/t4_videos.json`,
  manuals: `${baseWithSlash}data/rov_ref_ref_files.json`,
};

const manualFinderUrl = `${baseWithSlash}apps/manual-finder.html`;
const miniApps = [
  {
    title: 'Fitting Finder',
    subtitle: 'Hydraulic fittings',
    href: buildHref('fitting-finder'),
    img: buildAsset('assets/images/tiles/fitting-finder.png'),
    keywords: ['fitting', 'hydraulic', 'thread', 'od', 'id', 'jic', 'ermeto', 'bsp', 'npt'],
    slug: 'fitting-finder',
  },
  {
    title: 'Cable Finder',
    subtitle: 'Cables & drawings',
    href: buildHref('cable-list'),
    img: buildAsset('assets/images/tiles/cable-list.png'),
    keywords: ['cable', 'drawing', 'cbl', 'wiring', 'connector'],
    slug: 'cable-list',
  },
  {
    title: 'Manual Finder',
    subtitle: 'Manuals & drawings',
    href: buildHref('manual-finder'),
    img: buildAsset('assets/images/tiles/rov_ref_ref_files.png'),
    keywords: ['manual', 'drawing', 'reference', 'rov', 'pdf', 'guide'],
    slug: 'manual-finder',
  },
  {
    title: 'T4 Parts Finder',
    subtitle: 'Titan 4 parts',
    href: buildHref('t4-parts-finder'),
    img: buildAsset('assets/images/tiles/T4-parts.png'),
    keywords: ['t4', 'titan', 'part', 'spare', 'bom', 'assy', '001-1888'],
    slug: 't4-parts-finder',
  },
  {
    title: 'Atlas Parts Finder',
    subtitle: 'Atlas manipulator parts',
    href: buildHref('atlas-parts-finder'),
    img: buildAsset('assets/images/tiles/T4-parts.png'),
    keywords: ['atlas', 'manipulator', 'part', 'spare', 'bom', 'assy', '008-0216', 'gamma'],
    slug: 'atlas-parts-finder',
  },
  {
    title: 'ROV Cheatsheets',
    subtitle: 'PDF quick refs',
    href: buildHref('rov-cheatsheet'),
    img: buildAsset('assets/images/tiles/rov-cheatsheet.png'),
    keywords: ['rov', 'cheatsheet', 'pdf', 'constructor 3', 'constructor 4', 'constructor 5', 'constructor 6', 'ops', 'maintenance'],
    slug: 'rov-cheatsheet',
  },
  {
    title: 'T4 Torque',
    subtitle: 'Torque PDF',
    href: buildHref('t4-torque'),
    img: buildAsset('assets/images/tiles/T4-Torque.png'),
    keywords: ['t4', 'torque', 'cheatsheet', 'bolt'],
    slug: 't4-torque',
  },
  {
    title: 'T4 Slave Arm Drawing',
    subtitle: 'Drawing PDF',
    href: buildHref('t4-slave-arm-drawing'),
    img: buildAsset('assets/images/tiles/t4-slave-arm-drawing.png'),
    keywords: ['t4', 'slave arm', 'drawing', 'pdf'],
    slug: 't4-slave-arm-drawing',
  },
  {
    title: 'T4 Videos',
    subtitle: 'Maintenance videos',
    href: buildHref('t4-videos'),
    img: buildAsset('assets/images/tiles/T4-videos.png'),
    keywords: ['t4', 'video', 'maintenance', 'resolver', 'azimuth', 'elbow', 'wrist'],
    slug: 't4-videos',
  },
  {
    title: 'ROV Pod',
    subtitle: 'Pod details',
    href: buildHref('rov-pod'),
    img: buildAsset('assets/images/tiles/rov-pod.png'),
    keywords: ['rov', 'pod', 'config', 'notes'],
    slug: 'rov-pod',
  },
];

function normalize(text: string) {
  return text.toLowerCase();
}

function normalizeLoose(text: string) {
  return text.toLowerCase().replace(/[\s_\-\/]+/g, '');
}

function tokenScore(queryTokens: string[], hay: string, weight = 6) {
  const hayNorm = hay.toLowerCase();
  return queryTokens.reduce((score, token) => (hayNorm.includes(token) ? score + weight : score), 0);
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

function baseScore(query: string, text: string) {
  const qNorm = normalize(query);
  const tokens = qNorm.split(/\s+/).filter(Boolean);
  const textNorm = text.toLowerCase();
  const qLoose = normalizeLoose(query);
  const textLoose = normalizeLoose(text);
  let score = 0;
  if (!qNorm) return score;
  if (textNorm.includes(qNorm)) score += 30;
  score += tokenScore(tokens, text, 6);

  if (qLoose && textLoose) {
    if (textLoose.includes(qLoose)) score += 40;
    const dist = editDistance(qLoose, textLoose);
    if (dist === 1) score += 25;
    else if (dist === 2) score += 15;
  }
  return score;
}

function manualBonus(query: string, docNo?: string) {
  if (!query || !docNo) return 0;
  const qLoose = normalizeLoose(query);
  const docLoose = normalizeLoose(docNo);
  let score = 0;
  if (docLoose === qLoose) score += 140;
  else if (docLoose.includes(qLoose)) score += 90;
  return score;
}

function miniScore(query: string, app: (typeof miniApps)[number]) {
  const qNorm = normalize(query);
  const qTokens = qNorm.split(/\s+/).filter(Boolean);
  const qLoose = normalizeLoose(query);
  const keywords = app.keywords || [];
  const keywordText = keywords.join(' ');
  const slugText = app.slug ?? '';
  let score = baseScore(query, `${app.title} ${app.subtitle} ${keywordText} ${slugText}`);

  keywords.forEach((kw) => {
    const kwNorm = normalize(kw);
    const kwLoose = normalizeLoose(kw);
    if (qTokens.includes(kwNorm)) score += 80;
    else if (kwNorm.includes(qNorm) && qNorm.length > 2) score += 30;
    if (kwLoose && kwLoose === qLoose) score += 50;
    else if (kwLoose && kwLoose.includes(qLoose) && qLoose.length > 2) score += 20;
  });

  if (slugText && normalizeLoose(slugText).includes(qLoose)) {
    score += 25;
  }

  if (app.slug === 't4-parts-finder' && partNumberPattern.test(query.trim())) {
    score += 140;
  }

  return score;
}

function mapCables(data: any): Result[] {
  const items: Cable[] = Array.isArray(data) ? data : Array.isArray((data as CableData)?.cables) ? (data as CableData).cables : [];
  return items.map((cable) => {
    const detailParts = [cable.name, cable.system, cable.rov?.join(', '), cable.tags?.join(', '), cable.notes].filter(Boolean).join(' | ');
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
      detail: [part.description, part.expanded].filter(Boolean).join(' | '),
      source: 'T4 Part',
      kind: 'part',
      url: part.link,
      score: 0,
    }));
}

function mapAtlasParts(data: any): Result[] {
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
      detail: [part.description, part.expanded].filter(Boolean).join(' | '),
      source: 'Atlas Part',
      kind: 'atlas-part',
      url: part.link,
      score: 0,
    }));
}

function mapFittings(data: any): Result[] {
  const list: Fitting[] = Array.isArray(data) ? data : [];
  return list.map((f) => {
    const dims = [f.od ? `OD ${f.od}mm` : '', f.id ? `ID ${f.id}mm` : ''].filter(Boolean).join(' / ');
    const detail = [dims, f.thread, f.type, f.tips || undefined].filter(Boolean).join(' | ');
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

function mapManuals(data: any): Result[] {
  const list: Manual[] = (Array.isArray(data) ? data : []).map((raw: ManualRaw) => ({
    title: raw['Document name'] || 'Untitled',
    docNo: raw['Document number'],
    description: raw.Description,
    category: raw.Category,
    equipment: raw.Equipment,
    date: raw['Date approved'],
    link: raw.Link,
  }));

  return list.map((item) => ({
    title: item.title,
    detail: [item.docNo, item.category, item.description, item.equipment, item.date].filter(Boolean).join(' | '),
    source: 'Manual',
    kind: 'manual',
    url: item.link,
    docNo: item.docNo,
    score: 0,
  }));
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
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>Search</h1>
      <p class="lead">Search cables, T4 parts, fittings, manuals, and videos. Results are ranked by closest match.</p>
    </header>

    <section class="card finder-card">
      <form id="finder-form" class="finder-form">
        <div class="field">
          <label for="query">Search everything</label>
          <input type="search" id="query" name="q" placeholder="e.g., resolver, CBL-1023, T4, jaw" value="${initialQuery}" autocomplete="off" />
        </div>
        <div class="field">
          <label for="source-filter">Source</label>
          <select id="source-filter" name="source">
            <option value="all">Global (all sources)</option>
            <option value="cable">Cables only</option>
            <option value="part">T4 parts only</option>
            <option value="atlas-part">Atlas parts only</option>
            <option value="fitting">Fittings only</option>
            <option value="video">T4 videos only</option>
            <option value="manual">Manuals & drawings only</option>
          </select>
        </div>
        <div class="button-row">
          <button type="submit" class="btn primary">Find</button>
          <button type="button" class="btn ghost" id="clear-btn">Clear</button>
        </div>
        <p class="helper-text">Pulls from cable.json, t4_parts_finder.json, atlas_parts_finder.json, fittings.json, t4_videos.json, and rov_ref_ref_files.json.</p>
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
              <td>
                ${entry.kind === 'mini-app' && entry.img ? `<img class="mini-thumb" src="${entry.img}" alt="" loading="lazy" onerror="this.style.display='none';">` : ''}
                <div class="mini-text">
                  <div><strong>${entry.title}</strong></div>
                  <div class="muted">${entry.detail}</div>
                </div>
              </td>
              <td>${entry.kind === 'mini-app' ? '' : entry.detail}</td>
              <td>${entry.source}</td>
              <td class="actions">
            ${entry.url ? `<a class="btn small" href="${entry.url}" target="_blank" rel="noopener noreferrer">Open</a>` : ''}
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
          ${entry.kind === 'mini-app' && entry.img ? `<img class="mini-thumb" src="${entry.img}" alt="" loading="lazy" onerror="this.style.display='none';">` : ''}
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
            ${entry.url ? `<a class="btn small" href="${entry.url}" target="_blank" rel="noopener noreferrer">Open</a>` : ''}
          </div>
        </article>
      `
      )
      .join('');
  }
}

function combinedScore(query: string, entry: Result) {
  let score = baseScore(query, `${entry.title} ${entry.detail} ${entry.source}`);
  if (entry.kind === 'manual') {
    score += manualBonus(query, entry.docNo);
  }
  if (entry.kind === 'mini-app') {
    // light boost so mini app card is competitive but still respects normal ordering
    score += 10;
  }
  if (partNumberPattern.test(query.trim()) && (entry.kind === 'part' || entry.kind === 'atlas-part')) {
    score += 120;
  }
  return score;
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

  const scored = filtered
    .map((r) => ({ ...r, score: combinedScore(query, r) }))
    .sort((a, b) => b.score - a.score);

  if (filter === 'all') {
    const miniScored = miniApps
      .map((app) => ({
        title: app.title,
        detail: app.subtitle,
        source: 'Mini app',
        kind: 'mini-app' as const,
        url: app.href,
        img: app.img,
        score: miniScore(query, app),
      }))
      .sort((a, b) => b.score - a.score);
    const bestMini = miniScored[0];
    const insertIndex = Math.min(2, scored.length);

    const miniIsWeak = !bestMini || bestMini.score < 20;
    const contactFallback: Result = {
      title: 'Contact & Feedback',
      detail: 'No app for that? Let us know',
      source: 'Contact',
      kind: 'mini-app',
      url: buildHref('contact'),
      img: buildAsset('assets/images/tiles/contact_form.png'),
      score: bestMini?.score ?? 0,
    };

    scored.splice(insertIndex, 0, miniIsWeak ? contactFallback : bestMini);
  }

  if (filter === 'all' || filter === 'manual') {
    const viewAll: Result = {
      title: 'View all results in Manual Finder',
      detail: `Open Manual Finder for "${query}"`,
      source: 'Manual Finder',
      kind: 'manual-view',
      url: `${manualFinderUrl}?q=${encodeURIComponent(query)}`,
      score: -1,
    };
    scored.push(viewAll);
  }

  render(scored);
}

async function loadAll() {
  renderEmpty('Loading search index...');
  const [cables, parts, atlasParts, fittings, videos, manuals] = await Promise.all([
    fetchJson(endpoints.cables),
    fetchJson(endpoints.parts),
    fetchJson(endpoints.atlasParts),
    fetchJson(endpoints.fittings),
    fetchJson(endpoints.videos),
    fetchJson(endpoints.manuals),
  ]);

  allResults = [
    ...mapCables(cables),
    ...mapParts(parts),
    ...mapAtlasParts(atlasParts),
    ...mapFittings(fittings),
    ...mapVideos(videos),
    ...mapManuals(manuals),
  ];
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
