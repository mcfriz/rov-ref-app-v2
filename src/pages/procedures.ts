// Procedures mini-app
// - Home: search or browse categories
// - Category view: list procedures in a category
// - Procedure view: render full procedure content in-app
// To add content:
//   1) Update public/data/procedure_categories.json (ids, names, icons)
//   2) Update public/data/procedures_index.json (lightweight index entries)
//   3) Add full JSON files under public/data/procedures/<id>.json
import '../style.css';

type Category = { id: string; name: string; icon: string; description?: string };
type IndexItem = {
  id: string;
  title: string;
  summary: string;
  categories: string[];
  tags: string[];
  keywords: string[];
  updated: string;
};
type Table = { title?: string; headers: string[]; rows: string[][] };
type Step = {
  title?: string;
  image?: string;
  text: string[];
  notes?: string[];
  table?: Table;
  tables?: Table[];
};
type Troubleshoot = { symptom: string; checks: string[] };
type SourceMaterial = { label: string; url: string };
type Procedure = {
  id: string;
  title: string;
  purpose?: string | string[];
  safety?: string[];
  tools?: string[];
  parts?: string[];
  steps?: Step[];
  troubleshooting?: Troubleshoot[];
  notes?: string[];
  sourceMaterial?: SourceMaterial[];
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}
const appRoot: HTMLDivElement = app;

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataPaths = {
  categories: `${baseWithSlash}data/procedure_categories.json`,
  index: `${baseWithSlash}data/procedures_index.json`,
  procedure: (id: string) => `${baseWithSlash}data/procedures/${id}.json`,
};

let categories: Category[] = [];
let indexItems: IndexItem[] = [];
const procedureCache = new Map<string, Procedure>();

let searchTimeout: number | null = null;
let lastCategoryFrom: string | null = sessionStorage.getItem('procedures:lastCategory') || null;

function debounceSearch(fn: () => void) {
  if (searchTimeout) window.clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(fn, 200);
}

function normalize(text: string) {
  return text.toLowerCase();
}

function scoreItem(query: string, item: IndexItem) {
  const q = normalize(query);
  const inTitle = item.title.toLowerCase().includes(q);
  const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
  const inKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
  const inSummary = item.summary.toLowerCase().includes(q);

  let score = 0;
  if (inTitle) score += 60;
  if (inTags) score += 30;
  if (inKeywords) score += 20;
  if (inSummary) score += 10;

  return score;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    console.error('Failed to fetch', url, e);
    return null;
  }
}

function renderBaseSkeleton() {
  appRoot.innerHTML = `
    <main class="page narrow-page">
      <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
      <header class="page-header">
        <h1>Procedures</h1>
        <p class="lead">Search or browse procedures by category; read them in-app.</p>
      </header>

      <section class="card finder-card">
        <form id="search-form" class="finder-form">
          <div class="field">
            <label for="search-input">Search</label>
            <input id="search-input" type="search" name="q" placeholder="Title, tag, or keyword (e.g., resolver, 001-1888)" autocomplete="off" />
          </div>
        </form>
      </section>

      <section class="card" id="source-material">
        <h2>Source material</h2>
        <p class="helper-text">Links to original documents can be added to each procedure.</p>
      </section>

      <section class="card" id="content-card">
        <div id="content-area"></div>
      </section>
    </main>
  `;
}

function renderHome(query: string) {
  const content = document.querySelector<HTMLDivElement>('#content-area');
  if (!content) return;

  if (!query) {
    const tiles = categories
      .map(
        (cat) => `
      <button class="img-tile" data-cat="${cat.id}" type="button" style="min-height: 140px;">
        <div class="tile-overlay"></div>
        <img class="tile-bg" src="${cat.icon}" alt="" loading="lazy" onerror="this.style.display='none';" />
        <div class="tile-content">
          <h3>${cat.name}</h3>
          <p>${cat.description ?? ''}</p>
        </div>
      </button>`
      )
      .join('');
    content.innerHTML = `
      <h2>Browse by category</h2>
      <div class="tile-grid img-tiles">${tiles}</div>
    `;

    content.querySelectorAll<HTMLButtonElement>('button[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const catId = btn.dataset.cat;
        if (catId) {
          lastCategoryFrom = catId;
          sessionStorage.setItem('procedures:lastCategory', catId);
          window.location.hash = `#category=${catId}`;
        }
      });
    });
    return;
  }

  const scored = indexItems
    .map((item) => ({ item, score: scoreItem(query, item) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => (b.score === a.score ? a.item.title.localeCompare(b.item.title) : b.score - a.score));

  const usingDesktop = window.matchMedia('(min-width: 768px)').matches;

  if (!scored.length) {
    content.innerHTML = `<p class="helper-text">No matches. Try another term.</p>`;
    return;
  }

  if (usingDesktop) {
    const rows = scored
      .map(
        (entry) => `
        <tr>
          <td>${entry.item.title}</td>
          <td>${entry.item.summary}</td>
          <td>${entry.item.updated}</td>
          <td>${entry.item.categories.join(', ')}</td>
          <td class="actions"><button class="btn small" data-proc="${entry.item.id}">Open</button></td>
        </tr>`
      )
      .join('');
    content.innerHTML = `
      <div class="table-scroll">
        <table class="result-table">
          <thead>
            <tr><th>Title</th><th>Summary</th><th>Updated</th><th>Category</th><th></th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } else {
    content.innerHTML = scored
      .map(
        (entry) => `
        <article class="fit-card">
          <div class="fit-row"><strong>${entry.item.title}</strong></div>
          <p class="helper-text">${entry.item.summary}</p>
          <p class="helper-text">Updated: ${entry.item.updated}</p>
          <div class="fit-actions" style="justify-content:flex-start;gap:0.5rem;">
            <button class="btn small" data-proc="${entry.item.id}">Open</button>
          </div>
        </article>`
      )
      .join('');
  }

  content.querySelectorAll<HTMLButtonElement>('button[data-proc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.proc;
      if (pid) {
        lastCategoryFrom = null;
        sessionStorage.removeItem('procedures:lastCategory');
        window.location.hash = `#procedure=${pid}`;
      }
    });
  });
}

function renderCategory(categoryId: string) {
  const content = document.querySelector<HTMLDivElement>('#content-area');
  if (!content) return;
  const cat = categories.find((c) => c.id === categoryId);
  const items = indexItems.filter((item) => item.categories.includes(categoryId));

  if (!cat) {
    content.innerHTML = `<p class="helper-text">Category not found.</p>`;
    return;
  }

  if (!items.length) {
    content.innerHTML = `<p class="helper-text">No procedures in this category yet.</p>`;
    return;
  }

  const list = items
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(
      (item) => `
      <article class="fit-card">
        <div class="fit-row" style="align-items:center; gap:0.5rem;">
          <strong>${item.title}</strong>
          <span class="pill subtle">${item.updated}</span>
        </div>
        <p class="helper-text">${item.summary}</p>
        <div class="fit-actions" style="justify-content:flex-start;gap:0.5rem;">
          <button class="btn small" data-proc="${item.id}">Open</button>
        </div>
      </article>`
    )
    .join('');

  content.innerHTML = `
    <p class="back"><a href="#" id="back-home">&larr; Back to categories</a></p>
    <h2>${cat.name}</h2>
    ${list}
  `;

  content.querySelector<HTMLAnchorElement>('#back-home')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '';
  });

  content.querySelectorAll<HTMLButtonElement>('button[data-proc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.proc;
      if (pid) {
        lastCategoryFrom = categoryId;
        sessionStorage.setItem('procedures:lastCategory', categoryId);
        window.location.hash = `#procedure=${pid}`;
      }
    });
  });
}

function renderList(label: string, items?: string[]) {
  if (!items || !items.length) return '';
  const list = items.map((i) => `<li>${i}</li>`).join('');
  return `<section><h3>${label}</h3><ul>${list}</ul></section>`;
}

function renderTroubleshooting(items?: Troubleshoot[]) {
  if (!items || !items.length) return '';
  const blocks = items
    .map(
      (t) => `
      <article class="fit-card">
        <strong>Symptom:</strong> ${t.symptom}
        <ul>${t.checks.map((c) => `<li>${c}</li>`).join('')}</ul>
      </article>`
    )
    .join('');
  return `<section><h3>Troubleshooting</h3><div class="accordion">${blocks}</div></section>`;
}

function renderSteps(steps?: Step[]) {
  if (!steps || !steps.length) return '';

  const renderTable = (table: Table) => {
    const headerRow = table.headers.map((h) => `<th>${h}</th>`).join('');
    const rows = table.rows
      .map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
      .join('');
    const caption = table.title ? `<caption>${table.title}</caption>` : '';
    return `
      <div class="table-scroll" style="margin:0.5rem 0;">
        <table class="result-table">
          ${caption}
          <thead><tr>${headerRow}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  };

  const body = steps
    .map(
      (s, idx) => `
      <article class="fit-card">
        <div class="fit-row" style="align-items:center; gap:0.5rem;">
          <strong>Step ${idx + 1}${s.title ? `: ${s.title}` : ''}</strong>
        </div>
        ${
          s.image
            ? `<img src="${s.image}" alt="" loading="lazy" onerror="this.style.display='none';" style="max-width:100%; border-radius:10px; margin:0.5rem 0;">`
            : ''
        }
        ${s.text.map((p) => `<p class="helper-text" style="color:#0b192f;">${p}</p>`).join('')}
        ${
          s.table
            ? renderTable(s.table)
            : s.tables && s.tables.length
              ? s.tables.map((t) => renderTable(t)).join('')
              : ''
        }
        ${s.notes && s.notes.length ? `<ul>${s.notes.map((n) => `<li>${n}</li>`).join('')}</ul>` : ''}
      </article>`
    )
    .join('');
  return `<section><h3>Steps</h3><div class="accordion">${body}</div></section>`;
}

function renderSources(sources?: SourceMaterial[]) {
  if (!sources || !sources.length) return '';
  const links = sources
    .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a></li>`)
    .join('');
  return `<section><h3>Source material</h3><ul>${links}</ul></section>`;
}

function asArray(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function renderProcedure(proc: Procedure) {
  const content = document.querySelector<HTMLDivElement>('#content-area');
  if (!content) return;

  const fromCat = lastCategoryFrom;
  const sections = [
    proc.purpose
      ? `<section><h3>Purpose</h3>${asArray(proc.purpose)
          .map((p) => `<p class="helper-text" style="color:#0b192f;">${p}</p>`)
          .join('')}</section>`
      : '',
    renderList('Safety', proc.safety),
    renderList('Tools', proc.tools),
    renderList('Parts / consumables', proc.parts),
    renderSteps(proc.steps),
    renderTroubleshooting(proc.troubleshooting),
    renderList('Notes', proc.notes),
    renderSources(proc.sourceMaterial),
  ].filter(Boolean);

  content.innerHTML = `
    <p class="back"><a href="${fromCat ? `#category=${fromCat}` : '#'}" id="back-link">&larr; Back</a></p>
    <h2>${proc.title}</h2>
    ${sections.join('')}
  `;

  const backLink = content.querySelector<HTMLAnchorElement>('#back-link');
  backLink?.addEventListener('click', (e) => {
    e.preventDefault();
    if (fromCat) {
      window.location.hash = `#category=${fromCat}`;
    } else {
      window.location.hash = '';
    }
  });
}

async function loadProcedure(id: string) {
  if (procedureCache.has(id)) return procedureCache.get(id)!;
  const data = await fetchJson<Procedure>(dataPaths.procedure(id));
  if (data) procedureCache.set(id, data);
  return data;
}

function parseHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return { view: 'home' as const };
  const [key, value] = hash.split('=');
  if (key === 'category' && value) return { view: 'category' as const, id: value };
  if (key === 'procedure' && value) return { view: 'procedure' as const, id: value };
  return { view: 'home' as const };
}

async function handleRoute() {
  const { view, id } = parseHash();
  const searchInput = document.querySelector<HTMLInputElement>('#search-input');
  if (view === 'home') {
    renderHome(searchInput?.value.trim() || '');
    return;
  }
  if (view === 'category' && id) {
    if (searchInput) searchInput.value = '';
    renderCategory(id);
    return;
  }
  if (view === 'procedure' && id) {
    const proc = await loadProcedure(id);
    if (proc) {
      renderProcedure(proc);
    } else {
      const content = document.querySelector<HTMLDivElement>('#content-area');
      if (content) content.innerHTML = `<p class="helper-text">Procedure not found.</p>`;
    }
  }
}

async function init() {
  renderBaseSkeleton();

  const [cats, idx] = await Promise.all([
    fetchJson<Category[]>(dataPaths.categories),
    fetchJson<IndexItem[]>(dataPaths.index),
  ]);
  categories = cats ?? [];
  indexItems = idx ?? [];

  if (!categories.length || !indexItems.length) {
    const content = document.querySelector<HTMLDivElement>('#content-area');
    if (content) {
      content.innerHTML = `<p class="helper-text">Could not load procedures data. Please check your connection or JSON files.</p>`;
    }
    return;
  }

  const searchInput = document.querySelector<HTMLInputElement>('#search-input');
  searchInput?.addEventListener('input', () => {
    debounceSearch(() => {
      window.location.hash = '';
      renderHome(searchInput.value.trim());
    });
  });

  window.addEventListener('hashchange', handleRoute);
  await handleRoute();
}

init();
