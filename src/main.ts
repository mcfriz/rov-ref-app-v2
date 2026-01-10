// Dashboard script for the ROV Reference app.
// Renders hero, tiles, and interactions. Header/footer come from src/ui/shell-init.
import './style.css';

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

const heroSlides: HeroSlide[] = [
  {
    title: 'Welcome to the ROV Reference App',
    subtitle: 'Read More',
    href: buildHref('about'),
    background: `url(${buildAsset('assets/images/mobile_slides/1.png')}) center/cover`,
  },
  {
    title: 'Global Search',
    subtitle: 'Search',
    href: buildHref('search'),
    background: `url(${buildAsset('assets/images/mobile_slides/2.png')}) center/cover`,
  },
  {
    title: 'Contact & Feedback',
    subtitle: 'Contact',
    href: buildHref('contact'),
    background: `url(${buildAsset('assets/images/mobile_slides/5.png')}) center/cover`,
  },
];

const tiles: ImgTile[] = [
  {
    title: 'Fitting Finders',
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
    title: 'Procedures',
    subtitle: 'In-app procedures with search and categories.',
    href: buildHref('procedures'),
    img: buildAsset('assets/images/tiles/rov_ref_ref_files.png'),
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
    title: 'Manual Finder',
    subtitle: 'Manuals, drawings, and reference files in one search.',
    href: buildHref('manual-finder'),
    img: buildAsset('assets/images/tiles/rov_ref_ref_files.png'),
  },
  {
    title: 'T4 Parts Finder',
    subtitle: 'Search Titan 4 parts and open drawings quickly.',
    href: buildHref('t4-parts-finder'),
    img: buildAsset('assets/images/tiles/T4-parts.png'),
  },
  {
    title: 'Atlas Parts Finder',
    subtitle: 'Search Atlas manipulator parts and descriptions.',
    href: buildHref('atlas-parts-finder'),
    img: buildAsset('assets/images/tiles/atlas-parts.png'),
  },
  {
    title: 'Atlas Cheat Sheet',
    subtitle: 'Atlas PDF plus expandable valve package hose list.',
    href: buildHref('atlas-cheat-sheet'),
    img: buildAsset('assets/images/tiles/atlas-cheatsheet.png'),
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

app.innerHTML = `
  <section class="hero hero-mobile" aria-label="Featured tools">
    <div class="hero-slides" id="hero-slides" aria-live="polite">
      ${heroSlides
        .map(
          (slide, index) => `
            <a class="hero-slide" href="${slide.href}" data-index="${index}" style="background: ${slide.background}">
              <div class="slide-overlay">
                <h2>${slide.title}</h2>
                <span class="hero-cta btn primary">${slide.subtitle}</span>
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
`;

// Hero slider controls (mobile).
const slidesContainer = document.querySelector<HTMLDivElement>('#hero-slides');
const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('#hero-dots .dot'));
const isMobileHero = () => window.matchMedia('(max-width: 800px)').matches;
let currentSlide = 0;
let autoTimer: number | null = null;
let pauseUntil = 0;

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
  currentSlide = clamped;
}

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const index = Number(dot.getAttribute('data-index') ?? 0);
    goToSlide(index);
    pauseUntil = Date.now() + 10000;
  });
});

slidesContainer?.addEventListener('scroll', () => {
  if (!slidesContainer) return;
  const slideWidth = slidesContainer.getBoundingClientRect().width;
  const index = Math.round(slidesContainer.scrollLeft / slideWidth);
  setActiveDot(index);
  currentSlide = index;
  pauseUntil = Date.now() + 10000;
});

function startAutoSlide() {
  if (!slidesContainer || !isMobileHero()) return;
  if (autoTimer) window.clearInterval(autoTimer);
  autoTimer = window.setInterval(() => {
    if (Date.now() < pauseUntil) return;
    const next = (currentSlide + 1) % heroSlides.length;
    goToSlide(next);
  }, 5000);
}

['touchstart', 'wheel', 'keydown', 'mousedown'].forEach((evt) => {
  slidesContainer?.addEventListener(evt, () => {
    pauseUntil = Date.now() + 10000;
  });
});

startAutoSlide();
