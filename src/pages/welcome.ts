import '../style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>

    <header class="page-header">
      <h1>Welcome to the ROV Reference App</h1>
      <p class="lead">Built to keep critical ROV info handy offshore: PDFs, selectors, torque sheets, and quick links in one place.</p>
    </header>

    <section class="card">
      <h2>What this app does</h2>
      <ul>
        <li>Fast-launch tools: fitting finder, cable finder, T4 parts, videos, and PDF cheat sheets.</li>
        <li>Offline-friendly: key references ship as local PDFs for deck-side use.</li>
        <li>Consistent navigation: shared header, quick links, and a global search across JSON data.</li>
      </ul>
    </section>

    <section class="card">
      <h2>Why we built it</h2>
      <p>Field teams needed a single, lightweight hub for recurring tasks—no heavy manuals, no hunting through drives. This app keeps the most-used checklists, drawings, and lookups together with minimal clicks.</p>
    </section>

    <section class="card">
      <h2>How to use it</h2>
      <ul>
        <li><strong>Global Search:</strong> use the header search to jump across fittings, cables, parts, and videos.</li>
        <li><strong>Mini-app pages:</strong> each page is tuned for one job—filters, quick nav, and PDF-first layouts where useful.</li>
        <li><strong>Mobile:</strong> the app bar keeps back/share/close handy; use “Open PDF (new tab)” if embeds are slow.</li>
      </ul>
    </section>

    <section class="card">
      <h2>Limitations & cautions</h2>
      <ul>
        <li>Data may be incomplete or outdated; verify against official manuals before critical work.</li>
        <li>Some content is AI-assisted; treat suggestions as guidance, not authority.</li>
        <li>PDFs are snapshots: check revision dates and cross-check with control room documents.</li>
        <li>If something looks wrong, report it via the Contact page so we can correct it.</li>
      </ul>
    </section>
  </main>
`;
