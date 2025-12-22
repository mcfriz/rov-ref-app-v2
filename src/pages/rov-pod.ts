import '../style.css';

// Simple placeholder content for the ROV Pod page.
// Header/footer are injected via src/ui/shell-init.ts through the HTML file.

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

const backHref = '../index.html';

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="${backHref}">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>ROV Pod</h1>
      <p class="lead">Keep pod configurations, spares, and filterable lookup tables in one spot.</p>
    </header>

    <section class="card">
      <h2>Source material</h2>
      <ul>
        <li><a href="#">Placeholder: Pod BOM (spreadsheet)</a></li>
        <li><a href="#">Placeholder: Pod wiring diagrams</a></li>
        <li><a href="#">Placeholder: Drive link to pod maintenance logs</a></li>
      </ul>
    </section>

    <section class="card">
      <h2>What this page will do</h2>
      <p>Tier 2 table-driven reference with filters (by pod, part number, status) and quick links to drawings.</p>
    </section>
  </main>
`;
