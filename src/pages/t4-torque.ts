import '../style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Root element #app not found');

const base = import.meta.env.BASE_URL ?? '../';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const pdfPath = `${baseWithSlash}assets/pdfs/T4_Torque_CheatSheet.pdf`;

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>

    <header class="page-header">
      <h1>T4 Torque Cheat Sheet</h1>
      <p class="lead">Quick torque reference for T4 tasks. Open the PDF for the full checklist and values.</p>
    </header>

    <section class="card">
      <h2>T4 Quick Nav</h2>
      <div class="quick-nav">
        <div class="nav-buttons">
          <a class="nav-btn active" href="t4-torque.html">T4 Torque</a>
          <a class="nav-btn" href="t4-slave-arm-drawing.html">T4 Slave Arm Drawing</a>
          <a class="nav-btn disabled" aria-disabled="true" tabindex="-1">T4 O-Rings (Coming soon)</a>
          <a class="nav-btn" href="t4-videos.html">T4 Videos</a>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Source material</h2>
      <p class="helper-text">Primary reference lives in a local PDF so it still works offline on vessels.</p>
      <div class="pdf-actions">
        <a class="btn" id="open-pdf" href="${pdfPath}" target="_blank" rel="noopener">Open PDF (new tab)</a>
        <span class="helper-text">If the embed below is slow on mobile, use the button instead.</span>
      </div>
    </section>

    <section class="card">
      <h2>Embedded viewer</h2>
      <p class="helper-text">Desktop users can scroll the PDF below. Mobile browsers sometimes block inline PDFs.</p>
      <iframe
        title="T4 Torque Cheat Sheet PDF"
        id="pdf-frame"
        class="pdf-frame"
        src="${pdfPath}"
      ></iframe>
      <p class="helper-text">Cannot see it? Tap "Open PDF (new tab)" above to view it directly.</p>
    </section>
  </main>
`;
