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
          <a class="nav-btn" href="t4-videos.html">T4 Videos</a>
        </div>
      </div>
    </section>

    <section class="row-with-action">
      <div class="card">
        <h2>Source material</h2>
        <p class="helper-text">Current PDF: <a href="${pdfPath}" target="_blank" rel="noopener">T4 Torque Cheat Sheet</a></p>
      </div>
      <div class="row-action">
        <a class="btn" id="open-pdf" href="${pdfPath}" target="_blank" rel="noopener">Open PDF (new tab)</a>
      </div>
    </section>

    <section class="card">
      <iframe
        title="T4 Torque Cheat Sheet PDF"
        id="pdf-frame"
        class="pdf-frame"
        src="${pdfPath}"
      ></iframe>
    </section>
  </main>
`;
