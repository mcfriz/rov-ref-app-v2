// Dashboard script for the ROV Reference app.
// Builds a responsive layout with a mobile carousel and desktop banner using base-aware links.
import './style.css';

type NavLink = { label: string; href: string };
type HeroSlide = { title: string; subtitle: string; href: string; background: string };
type ImgTile = {
  title: string;
  subtitle: string;
  href: string;
  img: string;
};

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
  { label: 'Contact', href: buildHref('contact') },
];

const heroSlides: HeroSlide[] = [
  {
    title: 'Contact',
    subtitle: 'Send feedback, feature ideas, or bug reports.',
    href: buildHref('contact'),
    background: `url(${buildAsset('assets/images/tiles/contact_form.png')}) center/cover`,
  },
  {
    title: 'Global Search',
    subtitle: 'One search across drawings, cables, parts, and videos.',
    href: buildHref('search'),
    background: `url(${buildAsset('assets/images/tiles/Global_search.png')}) center/cover`,
  },
];

const tiles: ImgTile[] = [
  {
    title: 'Fitting Finder',
    subtitle: 'Caliper-friendly lookup for fittings, OD/ID + thread tips.',
    href: buildHref('fitting-finder'),
    img: buildAsset('assets/images/tiles/fitting-finder.png'),
  },
  {
    title: 'ROV Cheatsheets',
    subtitle: 'Pick an ROV and open its PDF quick ref.',
    href: buildHref('rov-cheatsheet'),
    img: buildAsset('assets/images/tiles/rov-cheatsheet.png'),
  },
  {
    title: 'Cable List',
    subtitle: 'Catalog of cables with friendly identifiers.',
    href: buildHref('cable-list'),
    img: buildAsset('assets/images/tiles/cable-list.png'),
  },
  {
    title: 'T4 Torque',
    subtitle: 'Open the T4 torque PDF cheat sheet.',
    href: buildHref('t4-torque'),
    img: buildAsset('assets/images/tiles/T4-Torque.png'),
  },
  {
    title: 'T4 Slave Arm Drawing',
    subtitle: 'PDF-first drawing reference for the T4 slave arm.',
    href: buildHref('t4-slave-arm-drawing'),
    img: buildAsset('assets/images/tiles/t4-slave-arm-drawing.png'),
  },
  {
    title: 'ROV Pod',
    subtitle: 'Configuration notes and filterable part lookups.',
    href: buildHref('rov-pod'),
    img: buildAsset('assets/images/tiles/rov-pod.png'),
  },
  {
    title: 'T4 Parts Finder',
    subtitle: 'Search Titan 4 parts and open drawings quickly.',
    href: buildHref('t4-parts-finder'),
    img: buildAsset('assets/images/tiles/T4-parts.png'),
  },
  {
    title: 'T4 Videos',
    subtitle: 'Maintenance walkthroughs grouped by assembly.',
    href: buildHref('t4-videos'),
    img: buildAsset('assets/images/tiles/T4-videos.png'),
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
      <form class="search-form desktop-search" role="search" action="${buildHref('search')}">
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
    <form class="search-form" role="search" action="${buildHref('search')}">
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
    <div class="hero-banner" style="background-image: url('${buildAsset('assets/images/Logo_background.png')}'); background-size: cover; background-position: center;">
      <div class="hero-copy">
        <p class="eyebrow">ROV Reference App</p>
        <h1>Stay ready offshore</h1>
        <p class="lead">T4 cheatsheets, offline PDFs, and quick use tools to assist ROV operations and maintenance.</p>
        <div class="hero-actions">
          <a class="btn primary" href="${buildHref('search')}">Global Search</a>
          <a class="btn primary" href="${buildHref('contact')}">Contact</a>
        </div>
      </div>
    </div>
  </section>

  <section class="tile-grid img-tiles" aria-label="Mini apps">
    ${tiles
      .map(
        (tile) => `
      <a class="img-tile" href="${tile.href}">
        <div class="tile-overlay"></div>
        <img class="tile-bg" src="${tile.img}" alt="" loading="lazy" onerror="this.style.display='none';" />
        <div class="tile-content">
          <h3>${tile.title}</h3>
          <p>${tile.subtitle}</p>
        </div>
        <span class="tile-arrow" aria-hidden="true">›</span>
      </a>
    `
      )
      .join('')}
  </section>

  <footer class="app-footer">
    <div class="footer-left">
      <p class="footer-title">ROV Reference App</p>
      <p class="footer-note">Information may not be fully correct and some content may be AI-generated. Please verify before use.</p>
    </div>
    <div class="footer-links">
      <a href="${buildHref('contact')}">Contact</a>
      <a href="${buildHref('rov-cheatsheet')}">Cheatsheets</a>
      <a href="${buildHref('search')}">Global search</a>
    </div>
  </footer>
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
