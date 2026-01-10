/*
  Atlas hose list page logic.
  Renders the cheatsheet layout and loads hose data from public/data/atlas_valve_package_hoses.json.
  Edit this file for layout/behavior changes; edit the JSON file to update hose entries.
*/
import '../style.css';
import { initSpecsModal } from '../ui/specs-modal';

type Hose = {
  marking: string;
  qty?: number | null;
  lengthCm?: number | null;
  description: string;
  fullDescription?: string | null;
  section?: string | null;
};

type HosePayload = {
  hoses?: Hose[];
  sections?: { name?: string; items?: Hose[] }[];
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataUrl = `${baseWithSlash}data/atlas_valve_package_hoses.json`;
app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>

    <header class="page-header">
      <h1>Atlas Cheat Sheet</h1>
      <p class="lead">Quick reference for hose, bearings and other Atlas parts.</p>
    </header>

    <section class="card">
      <h2>Atlas Quick Nav</h2>
      <div class="quick-nav">
        <div class="nav-buttons">
          <a class="nav-btn" href="atlas-cheat-sheet.html">Atlas Cheat Sheet</a>
          <a class="nav-btn active" href="atlas-hose-list.html">Atlas Valve Package Hose List</a>
          <a class="nav-btn" href="atlas-parts-finder.html">Atlas Parts Finder</a>
          <button class="nav-btn" type="button" id="atlas-specs-open">Atlas 7F Specs</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>Atlas Valve Package Hose List</h2>
        <span class="pill subtle" id="hose-count"></span>
      </div>
      <p class="helper-text">Tap a row to expand for the full description and copy details.</p>
      <div id="hose-results"></div>
    </section>

    <section class="card">
      <h2>Notes</h2>
      <p class="helper-text">Lengths are sleeve-to-sleeve. Always verify routing and bend radius during installation.</p>
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

const resultsContainer = document.querySelector<HTMLDivElement>('#hose-results');
const countEl = document.querySelector<HTMLSpanElement>('#hose-count');
const isDesktop = () => window.matchMedia('(min-width: 840px)').matches;

let hoses: Hose[] = [];
let filtered: Hose[] = [];
const expanded = new Set<string>();

// Stable slug used for aria-controls ids.
function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function coerceNumber(raw: unknown): number | null {
  const num = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(num) ? num : null;
}

function parseHose(raw: Hose, section?: string | null): Hose | null {
  const record = raw as Record<string, unknown>;
  const marking = String(record.marking ?? '').trim();
  const description = String(record.description ?? '').trim();
  const lengthRaw = record.length_cm ?? record.lengthCm ?? record.length;
  if (!marking || !description) return null;
  return {
    marking,
    qty: coerceNumber(record.qty),
    lengthCm: coerceNumber(lengthRaw),
    description,
    fullDescription: record.fullDescription ? String(record.fullDescription).trim() : null,
    section: section ? String(section).trim() : null,
  };
}

function sortKey(marking: string) {
  const raw = marking.trim().toUpperCase();
  const letter = raw.charAt(0);
  const numberMatch = raw.match(/[A-Z](\d+)/);
  const number = numberMatch ? Number(numberMatch[1]) : 999;
  const groupOrder = ['A', 'B', 'C'];
  const group = groupOrder.includes(letter) ? groupOrder.indexOf(letter) : 99;
  return { group, number, raw };
}

function sortHoses(list: Hose[]) {
  return [...list].sort((a, b) => {
    const keyA = sortKey(a.marking);
    const keyB = sortKey(b.marking);
    if (keyA.group !== keyB.group) return keyA.group - keyB.group;
    if (keyA.number !== keyB.number) return keyA.number - keyB.number;
    return keyA.raw.localeCompare(keyB.raw);
  });
}

function formatQty(value: number | null | undefined) {
  return value === null || value === undefined ? '--' : `${value}`;
}

function formatLength(value: number | null | undefined) {
  return value === null || value === undefined ? '--' : `${value}`;
}

function hoseDetailText(hose: Hose) {
  return hose.fullDescription ?? hose.description;
}

function formatLengthWithUnit(value: number | null | undefined) {
  return value === null || value === undefined ? '--' : `${value} cm`;
}

// Central render helper to keep table vs card layouts aligned.
function renderEmpty(message: string) {
  if (resultsContainer) {
    resultsContainer.innerHTML = `<p class="helper-text">${message}</p>`;
  }
  if (countEl) countEl.textContent = '';
}

function renderTable(list: Hose[]) {
  if (!resultsContainer) return;
  const rows = list
    .map((hose) => {
      const detailId = `hose-detail-${toSlug(hose.marking)}`;
      const isOpen = expanded.has(hose.marking);
      return `
        <tr class="hose-row" data-marking="${hose.marking}">
          <td><button class="row-toggle" data-toggle="${hose.marking}" aria-expanded="${isOpen}" aria-controls="${detailId}">${hose.marking}</button></td>
          <td>${formatQty(hose.qty)}</td>
          <td>${formatLength(hose.lengthCm)}</td>
          <td>${hose.description}</td>
        </tr>
        <tr class="hose-detail-row" data-detail="${hose.marking}" id="${detailId}" ${isOpen ? '' : 'hidden'}>
          <td colspan="4">
            <div class="hose-detail">
              <p>${hoseDetailText(hose)}</p>
              <div class="detail-actions">
                <button class="btn small copy-btn" data-copy="${hose.marking}">Copy</button>
              </div>
            </div>
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
            <th>Marking</th>
            <th>Qty</th>
            <th>Length (cm)</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderCards(list: Hose[]) {
  if (!resultsContainer) return;
  resultsContainer.innerHTML = list
    .map((hose) => {
      const isOpen = expanded.has(hose.marking);
      return `
        <article class="fit-card hose-card" data-marking="${hose.marking}">
          <button class="row-toggle" data-toggle="${hose.marking}" aria-expanded="${isOpen}" aria-controls="card-detail-${toSlug(hose.marking)}">
            <strong>${hose.marking}</strong> &mdash; ${hose.description}
          </button>
          <div class="fit-row"><span class="label">Qty</span><span>${formatQty(hose.qty)}</span></div>
          <div class="fit-row"><span class="label">Length (cm)</span><span>${formatLength(hose.lengthCm)}</span></div>
          <div class="hose-detail" data-detail="${hose.marking}" id="card-detail-${toSlug(hose.marking)}" ${isOpen ? '' : 'hidden'}>
            <p>${hoseDetailText(hose)}</p>
            <div class="detail-actions">
              <button class="btn small copy-btn" data-copy="${hose.marking}">Copy</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderList(list: Hose[]) {
  if (!list.length) {
    renderEmpty('No hoses found. Adjust the search or check the JSON file.');
    return;
  }
  if (countEl) countEl.textContent = `${list.length} shown`;
  if (isDesktop()) {
    renderTable(list);
  } else {
    renderCards(list);
  }
}

// Toggle expansion by marking and sync all matching controls.
function toggleRow(marking: string) {
  if (expanded.has(marking)) {
    expanded.delete(marking);
  } else {
    expanded.add(marking);
  }

  if (!resultsContainer) return;
  const isOpen = expanded.has(marking);
  const toggleButtons = resultsContainer.querySelectorAll<HTMLButtonElement>(`[data-toggle="${marking}"]`);
  toggleButtons.forEach((btn) => btn.setAttribute('aria-expanded', String(isOpen)));
  const details = resultsContainer.querySelectorAll<HTMLElement>(`[data-detail="${marking}"]`);
  details.forEach((detail) => {
    detail.hidden = !isOpen;
  });
}

function copyRow(marking: string) {
  const hose = hoses.find((entry) => entry.marking === marking);
  if (!hose) return;
  const section = hose.section ? ` | ${hose.section}` : '';
  const text = `${hose.marking} | Qty ${formatQty(hose.qty)} | Length ${formatLengthWithUnit(hose.lengthCm)} | ${hoseDetailText(hose)}${section}`;
  navigator.clipboard.writeText(text).catch((error) => {
    console.error('Copy failed', error);
    alert('Copy failed. Please try again.');
  });
}

initSpecsModal({
  openButtonId: 'atlas-specs-open',
  modalId: 'atlas-specs-modal',
  titleId: 'atlas-specs-title',
  closeButtonId: 'atlas-specs-close',
  tableBodyId: 'atlas-specs-body',
  dataUrl: `${baseWithSlash}data/atlas_specs.json`,
});

resultsContainer?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const copyBtn = target.closest<HTMLButtonElement>('.copy-btn');
  if (copyBtn) {
    const marking = copyBtn.getAttribute('data-copy');
    if (marking) copyRow(marking);
    return;
  }

  const toggleBtn = target.closest<HTMLButtonElement>('[data-toggle]');
  if (toggleBtn) {
    const marking = toggleBtn.getAttribute('data-toggle');
    if (marking) toggleRow(marking);
    return;
  }

  const row = target.closest<HTMLElement>('[data-marking]');
  if (row) {
    const marking = row.getAttribute('data-marking');
    if (marking) toggleRow(marking);
  }
});

window.addEventListener('resize', () => {
  renderList(filtered);
});

// Load and normalize JSON data.
async function loadHoses() {
  try {
    renderEmpty('Loading hose list...');
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as HosePayload | Hose[];
    const cleaned: Hose[] = [];
    if (Array.isArray(payload)) {
      payload.forEach((item) => {
        const parsed = parseHose(item, null);
        if (parsed) cleaned.push(parsed);
      });
    } else if (Array.isArray(payload?.hoses)) {
      payload.hoses.forEach((item) => {
        const parsed = parseHose(item, null);
        if (parsed) cleaned.push(parsed);
      });
    } else if (Array.isArray(payload?.sections)) {
      payload.sections.forEach((section) => {
        const items = section?.items ?? [];
        items.forEach((item) => {
          const parsed = parseHose(item, section?.name ?? null);
          if (parsed) cleaned.push(parsed);
        });
      });
    }
    hoses = sortHoses(cleaned);
    filtered = [...hoses];
    if (!hoses.length) {
      renderEmpty('No hoses found. Update the JSON data file.');
      return;
    }
    renderList(filtered);
  } catch (error) {
    console.error('Failed to load atlas_valve_package_hoses.json', error);
    renderEmpty('Failed to load hose data. Check the JSON file and try again.');
  }
}

loadHoses();
