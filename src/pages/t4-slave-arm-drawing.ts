import '../style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Root element #app not found');

const base = import.meta.env.BASE_URL ?? '../';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const pdfPath = `${baseWithSlash}assets/pdfs/T4_Slave_Arm_Drawing_CheatSheet.pdf`;

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>

    <header class="page-header">
      <div class="pill">Tier 1</div>
      <h1>T4 Slave Arm Drawing Cheat Sheet</h1>
      <p class="lead">PDF-first reference for the T4 slave arm drawing. Open in a new tab for fastest viewing.</p>
    </header>

    <section class="card">
      <h2>T4 Quick Nav</h2>
      <div class="quick-nav">
        <div class="nav-buttons">
          <a class="nav-btn" href="t4-torque.html">T4 Torque</a>
          <a class="nav-btn active" href="t4-slave-arm-drawing.html">T4 Slave Arm Drawing</a>
          <a class="nav-btn disabled" aria-disabled="true" tabindex="-1">T4 O-Rings (Coming soon)</a>
          <a class="nav-btn" href="t4-videos.html">T4 Videos</a>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Source material</h2>
      <p class="helper-text">Local PDF for offline access on vessels.</p>
      <div class="pdf-actions">
        <a class="btn" id="open-pdf" href="${pdfPath}" target="_blank" rel="noopener">Open PDF (new tab)</a>
        <span class="helper-text">On mobile, the new tab button is the most reliable option.</span>
      </div>
    </section>

    <section class="card">
      <h2>Embedded viewer</h2>
      <p class="helper-text">Inline preview for desktop. Mobile browsers sometimes block embedded PDFs.</p>
      <iframe
        title="T4 Slave Arm Drawing PDF"
        id="pdf-frame"
        class="pdf-frame"
        src="${pdfPath}"
      ></iframe>
      <p class="helper-text">If you cannot see the PDF, tap "Open PDF (new tab)" above.</p>
    </section>
  </main>
`;
