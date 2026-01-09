// Fitting Finder page logic.
// Rebuilds the older fitting-finder.js behavior with cleaner TypeScript and base-aware asset loading.
// Header/footer are injected via src/ui/shell-init; this file only renders the page body.
import '../style.css';

type Measurement = 'od' | 'id';

type Fitting = {
  od: number;
  id: number;
  thread: string;
  type: string;
  tips?: string | null;
};

type RankedResult = {
  fitting: Fitting;
  diff: number;
  value: number;
  measurement: Measurement;
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

// BASE_URL keeps fetch paths working on GitHub Pages sub-paths.
const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const dataUrl = `${baseWithSlash}data/fittings.json`;
const fittingPdfUrl = `${baseWithSlash}assets/pdfs/Hyd_Fitting_Finder.pdf`;
const measureImg = `${baseWithSlash}assets/images/fitting_finder_measure.jpeg`;
const INITIAL_MESSAGE = 'Enter a diameter and pick OD or ID to see matches.';

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>Fitting Finder</h1>
      <p class="lead">Enter a measured diameter to see the closest hydraulic fittings by inner or outer diameter.</p>
    </header>

    <section class="card finder-card">
      <div class="finder-row">
        <form id="finder-form" class="finder-form">
          <div class="field">
            <label for="diameter">Approx. diameter (mm)</label>
            <input type="number" id="diameter" name="diameter" step="0.01" min="0" inputmode="decimal" placeholder="e.g. 12.7" required />
          </div>
          <div class="field">
            <label for="dimension">Measurement type</label>
            <select id="dimension" name="dimension">
              <option value="od">Outer Diameter (OD)</option>
              <option value="id">Inner Diameter (ID)</option>
            </select>
          </div>
          <p class="helper-text">Press Enter or tap "Find" to search.</p>
        </form>
        <div class="finder-action">
          <button type="submit" class="btn primary" form="finder-form">Find closest matches</button>
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

    <section class="card guide-card">
      <div class="card-header-row">
        <h2>Fitting Guide PDF</h2>
        <a class="btn link" href="${fittingPdfUrl}" target="_blank" rel="noopener">Open PDF (new tab)</a>
      </div>
      <p class="helper-text">Need the full reference sheet? Open the Hyd_Fitting_Finder.pdf used by this tool.</p>
    </section>

    <section class="card accordion">
      <details class="accordion-item" open>
        <summary>About this tool</summary>
        <div class="accordion-body">
          <p>This tool compares your caliper measurement against a reference list of fittings. It ranks matches by the closest diameter and highlights the top result.</p>
          <p>Use it on deck or at the bench to avoid trial-and-error when selecting replacements.</p>
        </div>
      </details>
      <details class="accordion-item">
        <summary>How to measure</summary>
        <div class="accordion-body">
          <ol>
            <li><strong>Outer diameter (OD):</strong> Measure across the threads (outside edge to outside edge).</li>
            <li><strong>Inner diameter (ID):</strong> Measure across the opening (inside edge to inside edge).</li>
            <li>Use digital calipers with at least 0.1 mm precision for best results.</li>
          </ol>
          <img class="measure-img" src="${measureImg}" alt="Example caliper measurement for fittings" loading="lazy" onerror="this.style.display='none';" />
        </div>
      </details>
      <details class="accordion-item">
        <summary>Fitting types explained</summary>
        <div class="accordion-body">
          <ul>
            <li><strong>Ermeto / DIN 2353:</strong> 24&deg; cone with cutting ring for tube fittings.</li>
            <li><strong>BSPP / BSPT:</strong> British Standard Pipe (parallel or tapered); often seals with bonded washers or sealant.</li>
            <li><strong>NPT:</strong> Tapered thread that seals with tape or paste; common in North America.</li>
            <li><strong>JIC:</strong> 37&deg; flare, straight UNF threads, suited for high-pressure lines.</li>
            <li><strong>ORFS:</strong> O-ring face seal with straight threads for leak-free connections.</li>
          </ul>
        </div>
      </details>
    </section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#finder-form');
const diameterInput = document.querySelector<HTMLInputElement>('#diameter');
const dimensionSelect = document.querySelector<HTMLSelectElement>('#dimension');
const resultsContainer = document.querySelector<HTMLDivElement>('#results');
const resultCount = document.querySelector<HTMLSpanElement>('#result-count');
let fittings: Fitting[] = [];
let currentResults: RankedResult[] = [];

const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

function formatTips(raw?: string | null) {
  if (!raw || raw === 'NULL') return '';
  return raw;
}

function renderEmpty(message: string) {
  if (resultsContainer) {
    resultsContainer.innerHTML = `<p class="helper-text">${message}</p>`;
  }
  if (resultCount) resultCount.textContent = '';
  currentResults = [];
}

async function loadFittings() {
  try {
    renderEmpty('Loading fitting data...');
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as Fitting[];
    fittings = Array.isArray(data) ? data : [];
    if (!fittings.length) {
      renderEmpty('No fittings found in data file.');
    } else {
      renderEmpty(INITIAL_MESSAGE);
    }
  } catch (error) {
    console.error('Failed to load fittings data', error);
    renderEmpty('Failed to load fitting data. Check your network or JSON file.');
  }
}

function buildCopyText(result: RankedResult) {
  const label = result.measurement === 'od' ? 'OD' : 'ID';
  const tips = formatTips(result.fitting.tips);
  const suffix = tips ? ` - ${tips}` : '';
  return `${result.fitting.type} ${result.fitting.thread} (${label} ${result.value}mm, diff ${result.diff.toFixed(2)}mm)${suffix}`;
}

function renderResults(results: RankedResult[], measurement: Measurement) {
  if (!resultsContainer || !resultCount) return;

  if (!results.length) {
    renderEmpty('No matching fittings found. Try another measurement.');
    return;
  }

  resultCount.textContent = `${results.length} shown (${measurement.toUpperCase()} matches)`;
  currentResults = results;

  const usingDesktopLayout = isDesktop();
  const bestClass = 'highlight';

  if (usingDesktopLayout) {
    const rows = results
      .map(
        (entry, index) => `
        <tr class="${index === 0 ? bestClass : ''}">
          <td>${entry.value.toFixed(2)} mm</td>
          <td>${entry.fitting.type}</td>
          <td>${entry.fitting.thread}</td>
          <td>${formatTips(entry.fitting.tips) || '&mdash;'}</td>
          <td>${entry.diff.toFixed(2)} mm</td>
          <td><button class="btn small copy-btn" data-copy-index="${index}">Copy</button></td>
        </tr>
      `.trim()
      )
      .join('');

    resultsContainer.innerHTML = `
      <div class="table-scroll">
        <table class="result-table">
          <thead>
            <tr>
              <th>${measurement === 'od' ? 'Outer Diameter' : 'Inner Diameter'}</th>
              <th>Type</th>
              <th>Thread</th>
              <th>Tips</th>
              <th>Size diff</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = results
      .map(
        (entry, index) => `
        <article class="fit-card ${index === 0 ? bestClass : ''}">
          <div class="fit-row">
            <span class="label">${measurement.toUpperCase()}:</span>
            <strong>${entry.value.toFixed(2)} mm</strong>
          </div>
          <div class="fit-row">
            <span class="label">Thread:</span>
            <strong>${entry.fitting.thread}</strong>
          </div>
          <div class="fit-row">
            <span class="label">Type:</span>
            <span>${entry.fitting.type}</span>
          </div>
          <div class="fit-row">
            <span class="label">Size diff:</span>
            <span>${entry.diff.toFixed(2)} mm</span>
          </div>
          <div class="fit-row">
            <span class="label">Tips:</span>
            <span>${formatTips(entry.fitting.tips) || '&mdash;'}</span>
          </div>
          <div class="fit-actions">
            <button class="btn small copy-btn" data-copy-index="${index}">Copy</button>
          </div>
        </article>
      `.trim()
      )
      .join('');
  }
}

function findFittings(event?: Event) {
  event?.preventDefault();
  if (!diameterInput || !dimensionSelect) return;

  const diameter = parseFloat(diameterInput.value);
  if (Number.isNaN(diameter) || diameter <= 0) {
    alert('Please enter a valid positive number for diameter.');
    return;
  }

  if (!fittings.length) {
    alert('Fitting data not loaded yet.');
    return;
  }

  const measurement: Measurement = dimensionSelect.value === 'id' ? 'id' : 'od';
  const sorted = fittings
    .filter((fitting) => typeof fitting[measurement] === 'number')
    .map((fitting) => {
      const value = (fitting as Record<Measurement, number>)[measurement];
      return {
        fitting,
        measurement,
        value,
        diff: Math.abs(value - diameter),
      } as RankedResult;
    })
    .sort((a, b) => a.diff - b.diff);

  const top = sorted.slice(0, isDesktop() ? 5 : 3);
  renderResults(top, measurement);
}

async function copyResult(index: number) {
  const result = currentResults[index];
  if (!result) return;
  const text = buildCopyText(result);
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Copy failed', error);
    alert('Copy failed. Please try again.');
  }
}

resultsContainer?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.matches('.copy-btn')) {
    const index = Number(target.getAttribute('data-copy-index') ?? -1);
    if (index >= 0) copyResult(index);
  }
});

form?.addEventListener('submit', findFittings);

// Keep Enter key on the input consistent with the button.
diameterInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    findFittings();
  }
});

// Initial data load
loadFittings();
