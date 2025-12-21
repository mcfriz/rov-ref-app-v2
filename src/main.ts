// Dashboard script for the ROV Reference app.
// Builds a responsive layout with a mobile carousel and desktop banner using base-aware links.
import './style.css';

type NavLink = { label: string; href: string };
type HeroSlide = { title: string; subtitle: string; href: string; background: string };
type ImgTile = { title: string; note: string; href: string; background: string };

// GitHub Pages often serves the site from a sub-path. BASE_URL accounts for that.
const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
const buildHref = (slug: string) => `${baseWithSlash}apps/${slug}.html`;
const buildAsset = (path: string) => `${baseWithSlash}${path}`;
const buildHome = () => baseWithSlash;

const navLinks: NavLink[] = [
  { label: 'Home', href: buildHome() },
  { label: 'Operations', href: '#' },
  { label: 'Maintenance', href: '#' },
  { label: 'Files', href: '#' },
];

const heroSlides: HeroSlide[] = [
  {
    title: 'Fitting Finder',
    subtitle: 'Match hydraulic fittings by OD/ID in seconds.',
    href: buildHref('fitting-finder'),
    background: 'linear-gradient(135deg, #0ea5e9, #082f49)',
  },
  {
    title: 'ROV Cheatsheets',
    subtitle: 'Offline PDFs for ops, maintenance, and readiness.',
    href: buildHref('rov-cheatsheet'),
    background: 'linear-gradient(135deg, #f97316, #7c2d12)',
  },
  {
    title: 'Cable List',
    subtitle: 'Field-friendly cable catalog with quick IDs.',
    href: buildHref('cable-list'),
    background: 'linear-gradient(135deg, #22c55e, #064e3b)',
  },
];

const tiles: ImgTile[] = [
  {
    title: 'Fitting Finder',
    note: 'Caliper-friendly lookup for fittings, OD/ID + thread tips.',
    href: buildHref('fitting-finder'),
    background: 'linear-gradient(160deg, rgba(14,165,233,0.18), rgba(8,42,69,0.6))',
  },
  {
    title: 'ROV Cheatsheets',
    note: 'Pick an ROV and open its PDF quick ref.',
    href: buildHref('rov-cheatsheet'),
    background: 'linear-gradient(160deg, rgba(249,115,22,0.24), rgba(124,45,18,0.55))',
  },
  {
    title: 'Cable List',
    note: 'Catalog of cables with friendly identifiers.',
    href: buildHref('cable-list'),
    background: 'linear-gradient(160deg, rgba(34,197,94,0.2), rgba(6,78,59,0.55))',
  },
  {
    title: 'T4 Torque',
    note: 'Open the T4 torque PDF cheat sheet.',
    href: buildHref('t4-torque'),
    background: 'linear-gradient(160deg, rgba(15,118,110,0.22), rgba(8,42,69,0.55))',
  },
  {
    title: 'T4 Slave Arm Drawing',
    note: 'PDF-first drawing reference for the T4 slave arm.',
    href: buildHref('t4-slave-arm-drawing'),
    background: 'linear-gradient(160deg, rgba(168,85,247,0.2), rgba(76,29,149,0.55))',
  },
  {
    title: 'ROV Pod',
    note: 'Configuration notes and filterable part lookups.',
    href: buildHref('rov-pod'),
    background: 'linear-gradient(160deg, rgba(99,102,241,0.2), rgba(49,46,129,0.55))',
  },
];

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

const topbar = `
  <header class="topbar">
    <div class="topbar-left">
      <button class="icon-btn" id="burger-btn" aria-label="Open menu">
        <span aria-hidden="true">&#9776;</span>
      </button>
      <img class="brand-mark" src="${buildAsset('assets/images/ROV_REF_Logo_black_on_transparent.png')}" alt="ROV Reference App logo" />
    </div>
    <div class="topbar-center">
      <nav class="nav-links" aria-label="Primary">
        ${navLinks
          .map(
            (link) => `<a class="nav-link" href="${link.href}">
            ${link.label}
          </a>`
          )
          .join('')}
      </nav>
    </div>
    <div class="topbar-right">
      <form class="search-form desktop-search" role="search">
        <label class="sr-only" for="desktop-search-input">Search</label>
        <input id="desktop-search-input" type="search" name="q" placeholder="Search" />
        <button type="submit" class="icon-btn" aria-label="Search">
          <span aria-hidden="true">🔍</span>
        </button>
      </form>
      <button class="icon-btn mobile-search-btn" id="search-toggle" aria-label="Open search" aria-expanded="false" aria-controls="search-panel">
        <span aria-hidden="true">🔍</span>
      </button>
    </div>
  </header>
  <div id="search-panel" class="search-panel" hidden>
    <form class="search-form" role="search">
      <label class="sr-only" for="mobile-search-input">Search</label>
      <input id="mobile-search-input" type="search" name="q" placeholder="Search the app" />
      <button type="submit" class="icon-btn" aria-label="Search">
        <span aria-hidden="true">🔍</span>
      </button>
    </form>
  </div>
`;

app.innerHTML = `
  ${topbar}

  <section class="hero hero-mobile" aria-label="Featured tools">
    <div class="hero-slides" id="hero-slides" aria-live="polite">
      ${heroSlides
        .map(
          (slide, index) => `
            <a class="hero-slide" href="${slide.href}" data-index="${index}" style="background: ${slide.background}">
              <div class="slide-overlay">
                <p class="pill subtle">Featured</p>
                <h2>${slide.title}</h2>
                <p class="slide-sub">${slide.subtitle}</p>
              </div>
            </a>
          `
        )
        .join('')}
    </div>
    <div class="hero-dots" id="hero-dots" aria-label="Slide selectors">
      ${heroSlides
        .map(
          (_slide, index) =>
            `<button class="dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`
        )
        .join('')}
    </div>
  </section>

  <section class="hero hero-desktop">
    <div class="hero-banner">
      <div class="hero-copy">
        <p class="eyebrow">ROV Reference</p>
        <h1>Stay ready offshore</h1>
        <p class="lead">Quick-launch helpers, offline PDFs, and selectors tuned for fast deck-side use.</p>
        <div class="hero-actions">
          <a class="btn primary" href="${buildHref('fitting-finder')}">Open Fitting Finder</a>
          <a class="btn ghost" href="${buildHref('rov-cheatsheet')}">Open Cheatsheets</a>
        </div>
      </div>
      <img class="hero-logo" src="${buildAsset('assets/images/ROV_ref_logo.png')}" alt="ROV Reference logo" />
    </div>
  </section>

  <section class="tile-grid img-tiles" aria-label="Mini apps">
    ${tiles
      .map(
        (tile) => `
      <a class="img-tile" href="${tile.href}" style="background-image: ${tile.background}">
        <div class="img-tile__overlay">
          <div class="img-tile__text">
            <h3>${tile.title}</h3>
            <p>${tile.note}</p>
          </div>
          <span class="pill subtle">Open</span>
        </div>
      </a>
    `
      )
      .join('')}
  </section>
`;

// Behavior: toggle mobile search panel.
const searchToggle = document.querySelector<HTMLButtonElement>('#search-toggle');
const searchPanel = document.querySelector<HTMLDivElement>('#search-panel');
const mobileSearchInput = document.querySelector<HTMLInputElement>('#mobile-search-input');

searchToggle?.addEventListener('click', () => {
  const isOpen = searchPanel?.hasAttribute('hidden') === false;
  if (isOpen) {
    searchPanel?.setAttribute('hidden', '');
    searchToggle.setAttribute('aria-expanded', 'false');
  } else {
    searchPanel?.removeAttribute('hidden');
    searchToggle.setAttribute('aria-expanded', 'true');
    mobileSearchInput?.focus();
  }
});

// Hero slider controls (mobile).
const slidesContainer = document.querySelector<HTMLDivElement>('#hero-slides');
const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('#hero-dots .dot'));

function setActiveDot(index: number) {
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function goToSlide(index: number) {
  if (!slidesContainer) return;
  const clamped = Math.max(0, Math.min(index, heroSlides.length - 1));
  const slideWidth = slidesContainer.getBoundingClientRect().width;
  slidesContainer.scrollTo({
    left: clamped * slideWidth,
    behavior: 'smooth',
  });
  setActiveDot(clamped);
}

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const index = Number(dot.getAttribute('data-index') ?? 0);
    goToSlide(index);
  });
});

slidesContainer?.addEventListener('scroll', () => {
  if (!slidesContainer) return;
  const slideWidth = slidesContainer.getBoundingClientRect().width;
  const index = Math.round(slidesContainer.scrollLeft / slideWidth);
  setActiveDot(index);
});
