// Shared header and footer renderer for all pages.
// Keeps links base-aware and consistent across dashboard and app pages.
const base = import.meta.env.BASE_URL ?? '/';
const baseWithSlash = base.endsWith('/') ? base : `${base}/`;

type PageType = 'home' | 'app';

type ShellOptions = {
  pageType: PageType;
};

const buildHref = (slug: string) => `${baseWithSlash}apps/${slug}.html`;
const buildAsset = (path: string) => `${baseWithSlash}${path}`;

const navLinks = [
  { label: 'Home', href: baseWithSlash },
  { label: 'Operations', href: '#' },
  { label: 'Maintenance', href: '#' },
  { label: 'Files', href: '#' },
  { label: 'Contact', href: buildHref('contact') },
];

const footerHtml = `
  <div class="footer-left">
    <p class="footer-title">ROV Reference App</p>
    <p class="footer-note">Information may not be fully correct and some content may be AI-generated. Please verify before use.</p>
  </div>
  <div class="footer-links">
    <a href="${buildHref('contact')}">Contact</a>
    <a href="${buildHref('rov-cheatsheet')}">Cheatsheets</a>
    <a href="${buildHref('search')}">Global search</a>
  </div>
`;

export function initShell(options: ShellOptions) {
  const siteHeader = document.getElementById('site-header');
  const siteFooter = document.getElementById('site-footer');

  const homeHref = options.pageType === 'app' ? '../index.html' : 'index.html';
  const logoSrc = buildAsset('assets/images/ROV_REF_Logo_black_on_transparent.png');

  if (siteHeader) {
    siteHeader.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <a class="brand-link" href="${homeHref}">
            <button class="icon-btn" id="burger-btn" aria-label="Open menu">
              <span aria-hidden="true">&#9776;</span>
            </button>
            <img class="brand-mark" src="${logoSrc}" alt="ROV Reference App logo" />
          </a>
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
              <span aria-hidden="true">&#128269;</span>
            </button>
          </form>
          <button class="icon-btn mobile-search-btn" id="search-toggle" aria-label="Open search" aria-expanded="false" aria-controls="search-panel">
            <span aria-hidden="true">&#128269;</span>
          </button>
        </div>
      </header>
      <div id="search-panel" class="search-panel" hidden>
        <form class="search-form" role="search" action="${buildHref('search')}">
          <label class="sr-only" for="mobile-search-input">Search</label>
          <input id="mobile-search-input" type="search" name="q" placeholder="Search the app" />
          <button type="submit" class="icon-btn" aria-label="Search">
            <span aria-hidden="true">&#128269;</span>
          </button>
        </form>
      </div>
    `;

    const searchToggle = siteHeader.querySelector<HTMLButtonElement>('#search-toggle');
    const searchPanel = siteHeader.querySelector<HTMLDivElement>('#search-panel');
    const mobileSearchInput = siteHeader.querySelector<HTMLInputElement>('#mobile-search-input');

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
  }

  if (siteFooter) {
    siteFooter.innerHTML = `<footer class="app-footer">${footerHtml}</footer>`;
  }
}
