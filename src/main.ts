// Entry script for the ROV Reference dashboard.
// Keeps the markup simple and generates base-aware links for GitHub Pages.
import './style.css';

type MiniApp = {
  title: string;
  slug: string;
  tier: string;
  blurb: string;
};

// Define the mini-apps we want to link to. These slugs map to /apps/{slug}.html.
const miniApps: MiniApp[] = [
  {
    title: 'Fitting Finder',
    slug: 'fitting-finder',
    tier: 'Tier 3',
    blurb: 'Selector helper to match fittings by spec and usage.',
  },
  {
    title: 'ROV Cheatsheet',
    slug: 'rov-cheatsheet',
    tier: 'Tier 3',
    blurb: 'Quick-reference commands, limits, and readiness checks.',
  },
  {
    title: 'ROV Pod',
    slug: 'rov-pod',
    tier: 'Tier 2',
    blurb: 'Pod configuration notes and filterable part lookups.',
  },
  {
    title: 'Cable List',
    slug: 'cable-list',
    tier: 'Tier 2',
    blurb: 'Cable catalog with friendly identifiers for field swaps.',
  },
  {
    title: 'T4 Torque',
    slug: 't4-torque',
    tier: 'Tier 1',
    blurb: 'Torque guidance and quick reminders for T4 tasks.',
  },
];

// GitHub Pages often serves the site from a sub-path. BASE_URL accounts for that.
const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;

const buildHref = (slug: string) => `${baseWithSlash}apps/${slug}.html`;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

// Render the dashboard markup.
app.innerHTML = `
  <header>
    <h1>ROV Reference</h1>
    <p class="lead">Fast access to ROV helpers, cheatsheets, and selectors. Use the tiles below to jump into a mini-app.</p>
  </header>
  <section class="tile-grid">
    ${miniApps
      .map(
        ({ title, slug, tier, blurb }) => `
        <a class="tile" href="${buildHref(slug)}">
          <h2>
            ${title}
            <span class="pill">${tier}</span>
          </h2>
          <p>${blurb}</p>
          <small>Open helper</small>
        </a>
      `.trim()
      )
      .join('')}
  </section>
`;
