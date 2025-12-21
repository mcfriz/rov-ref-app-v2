// pages/fitting-finder.js
export function loadFittingFinderPage() {
  const app = document.getElementById('app');
  if (!app) return console.error("Element #app not found.");

  app.innerHTML = `
    <h2>Hydraulic Fitting Finder</h2>
    <div class="container">
      <div class="input-section">
        <label for="diameter">Enter Approx. Diameter (mm):</label>
        <input type="number" id="diameter" step="0.01" placeholder="e.g. 12.7" />
        
        <label for="type">Measurement Type:</label>
        <select id="type">
          <option value="outer">Outer Diameter</option>
          <option value="inner">Inner Diameter</option>
        </select>
        
        <button id="findBtn">Find Closest Matches</button>
      </div>
      <div id="result" class="result-section"></div>
    </div>
  `;

  const resultDiv = document.getElementById('result');
  const findBtn = document.getElementById('findBtn');
  let fittings = [];

  async function loadFittings() {
    try {
      const res = await fetch('fitting-finder-data.json');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      fittings = await res.json();
      console.log('✅ Fittings loaded:', fittings.length);
    } catch (err) {
      console.error('❌ Failed to load fittings:', err);
      resultDiv.innerHTML = `<p class="error">Failed to load fitting data. Please try again later.</p>`;
    }
  }

  async function findFitting() {
    const diameterInput = document.getElementById('diameter');
    const typeSelect = document.getElementById('type');

    const diameter = parseFloat(diameterInput.value);
    const type = typeSelect.value;

    if (isNaN(diameter) || diameter <= 0) {
      alert('Please enter a valid positive number for diameter.');
      return;
    }

    if (!fittings.length) {
      alert('Fitting data not loaded yet.');
      return;
    }

    const isOuter = type === 'outer';
    const prop = isOuter ? 'od' : 'id';

    const sorted = fittings
      .filter(f => f[prop] !== undefined)
      .map(f => ({
        fitting: f,
        diff: Math.abs(f[prop] - diameter)
      }))
      .sort((a, b) => a.diff - b.diff);

    if (sorted.length === 0) {
      resultDiv.innerHTML = `<p>No matching fittings found.</p>`;
      return;
    }

    const isMobile = window.innerWidth < 768;
    const results = sorted.slice(0, isMobile ? 3 : 5);

    if (isMobile) {
      // Render as cards
      resultDiv.innerHTML = results.map((entry, i) => {
        const f = entry.fitting;
        const dim = isOuter ? f.od : f.id;
        return `
          <div class="fit-card ${i === 0 ? 'highlight-card' : ''}">
<div><strong>📏 ${isOuter ? 'OD' : 'ID'}:</strong> ${dim ?? 'N/A'} mm</div>
            <div><strong>🔩 Thread:</strong> ${f.thread}</div>
            <div><strong>⚙️ Type:</strong> ${f.type}</div>
            <div><strong>📐 Size Diff:</strong> ${entry.diff.toFixed(2)} mm</div>
            <div><strong>💡 Tip:</strong> ${f.tips || '–'}</div>
          </div>
        `;
      }).join('');
    } else {
      // Render as table
      const headers = `
        <tr>
          <th>${isOuter ? 'Outer Diameter' : 'Inner Diameter'}</th>
          <th>Fittings Type</th>
          <th>Thread</th>
          <th>Tips</th>
          <th>Size Difference</th>
        </tr>`;

      const rows = results.map((entry, i) => {
        const f = entry.fitting;
        const diameterValue = isOuter ? f.od : f.id;
        return `
          <tr class="${i === 0 ? 'highlight bold' : ''}">
            <td>${diameterValue ?? 'N/A'} mm</td>
            <td>${f.type}</td>
            <td>${f.thread}</td>
            <td>${f.tips && f.tips !== "NULL" ? f.tips : '—'}</td>
            <td>${entry.diff.toFixed(2)} mm</td>
          </tr>`;
      }).join('');

      resultDiv.innerHTML = `
        <div class="table-scroll">
          <table class="result-table">
            <thead>${headers}</thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }
  }

  // Fitting Guide button
  const guideButtonWrap = document.createElement('div');
  guideButtonWrap.className = 'finder-button-wrap';
  guideButtonWrap.innerHTML = `
    <span>📘 <strong>Need help with hydraulic fittings?</strong> View the Fitting Guide:</span>
    <a href="#/guide" class="guide-btn small-btn"><strong>Open Fitting Guide</strong></a>
  `;
  app.appendChild(guideButtonWrap);

  // Info card accordion
  function addInfoSections() {
    const wrapper = document.createElement('div');
    wrapper.className = 'info-wrapper';
    wrapper.innerHTML = `
      <div class="card">
        <button class="card-header">ℹ️ About This Tool</button>
        <div class="card-body">
          <p>This tool helps you identify hydraulic fittings by measuring outer or inner diameter. It shows closest matches, thread type, and tips.</p>
          <p>This tool helps ROV and offshore technicians quickly identify hydraulic fittings by measuring the outer or inner diameter with calipers. It automatically compares your measurements against a built-in reference of industry standards—including Ermeto (DIN 2353), JIC, ORFS, BSP, NPT, and more—to show the closest match, thread type, and useful ordering tips. It also explains related concepts such as dash sizes, thread pitch, and pressure series, making it ideal for verifying parts on the bench or ordering replacements offshore.</p>
        </div>
      </div>

      <div class="card">
        <button class="card-header">📏 How to Measure</button>
        <div class="card-body">
          <p>Use a caliper and follow these steps:</p>
          <ol>
            <li><strong>Outer Diameter (OD):</strong> Measure the outside thread edges.</li>
            <li><strong>Inner Diameter (ID):</strong> Measure the inner opening.</li>
          </ol>
          <img src="images/how-to-measure.jpg" alt="How to measure" class="measure-img" />
          <p>Use digital calipers for at least 0.1 mm accuracy.</p>
        </div>
      </div>

      <div class="card">
        <button class="card-header">🧵 Fitting Types Explained</button>
        <div class="card-body">
          <ul>
            <li><strong>Ermeto</strong>: DIN 2353 compression with a 24° cone and ring.</li>
            <li><strong>BSP</strong>: British Standard Pipe parallel with bonded seal.</li>
            <li><strong>NPT</strong>: Tapered thread, seals with PTFE or paste.</li>
            <li><strong>JIC</strong>: 37° flare, straight UNF threads, high-pressure.</li>
            <li><strong>ORFS</strong>: O-ring face seal, straight thread, leak-free.</li>
          </ul>
        </div>
      </div>
    `;

    resultDiv.insertAdjacentElement('afterend', wrapper);

    wrapper.querySelectorAll('.card-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        const isOpen = body.style.maxHeight;
        wrapper.querySelectorAll('.card-body').forEach(b => (b.style.maxHeight = null));
        if (!isOpen) body.style.maxHeight = body.scrollHeight + 'px';
      });
    });
  }

  loadFittings().then(() => {
    findBtn?.addEventListener('click', findFitting);
    addInfoSections();
  });
}