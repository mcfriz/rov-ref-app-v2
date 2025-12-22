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
  const pageTitle = document.title.replace(' | ROV Reference', '');

  if (options.pageType === 'app') {
    document.body.classList.add('app-page');
  } else {
    document.body.classList.remove('app-page');
  }

  if (siteHeader) {
    siteHeader.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-btn" id="burger-btn" aria-label="Open menu">
            <span aria-hidden="true">&#9776;</span>
          </button>
          <a class="brand-link" href="${homeHref}">
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
    const burgerBtn = siteHeader.querySelector<HTMLButtonElement>('#burger-btn');

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

    // Drawer
    const drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.innerHTML = `
      <div class="drawer-backdrop" aria-hidden="true"></div>
      <nav class="drawer-panel" aria-label="Navigation menu" tabindex="-1">
        <button class="icon-btn close-drawer" aria-label="Close menu">&times;</button>
        <ul class="drawer-list">
          <li><a href="${homeHref}">Home</a></li>
          <li>
            <button class="drawer-parent" aria-expanded="false">ROV</button>
            <ul class="drawer-nested" hidden>
              <li><a href="${buildHref('rov-pod')}">ROV Pod</a></li>
              <li><a href="${buildHref('cable-list')}">Cables</a></li>
              <li><a href="${buildHref('rov-cheatsheet')}">ROV Cheat Sheets</a></li>
            </ul>
          </li>
          <li>
            <button class="drawer-parent" aria-expanded="false">T4</button>
            <ul class="drawer-nested" hidden>
              <li><a href="${buildHref('t4-torque')}">T4 Torque</a></li>
              <li><a href="${buildHref('t4-slave-arm-drawing')}">T4 Slave Arm Drawing</a></li>
              <li><a href="${buildHref('t4-videos')}">T4 Videos</a></li>
            </ul>
          </li>
          <li><a href="${buildHref('fitting-finder')}">Fitting Finder</a></li>
          <li><a href="${buildHref('contact')}">Contact</a></li>
        </ul>
      </nav>
    `;
    document.body.appendChild(drawer);

    const backdrop = drawer.querySelector<HTMLDivElement>('.drawer-backdrop');
    const panel = drawer.querySelector<HTMLDivElement>('.drawer-panel');
    const closeBtn = drawer.querySelector<HTMLButtonElement>('.close-drawer');
    const parents = Array.from(drawer.querySelectorAll<HTMLButtonElement>('.drawer-parent'));

    const closeDrawer = () => {
      drawer.classList.remove('open');
      burgerBtn?.setAttribute('aria-expanded', 'false');
    };
    const openDrawer = () => {
      drawer.classList.add('open');
      burgerBtn?.setAttribute('aria-expanded', 'true');
      panel?.focus();
    };

    burgerBtn?.addEventListener('click', () => openDrawer());
    backdrop?.addEventListener('click', closeDrawer);
    closeBtn?.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    parents.forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        const nested = btn.nextElementSibling as HTMLElement | null;
        nested?.toggleAttribute('hidden', expanded);
      });
    });

    // Mobile app bar for app pages
    if (options.pageType === 'app') {
      const appBar = document.createElement('div');
      appBar.className = 'app-bar';
      appBar.innerHTML = `
        <button class="icon-btn appbar-btn" id="appbar-back" aria-label="Go back">&#8592;</button>
        <div class="appbar-title">${pageTitle}</div>
        <div class="appbar-actions">
          <button class="icon-btn appbar-btn" id="appbar-share" aria-label="Share">&#128279;</button>
          <a class="icon-btn appbar-btn" id="appbar-close" aria-label="Close" href="${homeHref}">&#10005;</a>
        </div>
      `;
      siteHeader.appendChild(appBar);

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.hidden = true;
      toast.textContent = 'Link copied';
      document.body.appendChild(toast);

      const backBtn = appBar.querySelector<HTMLButtonElement>('#appbar-back');
      const shareBtn = appBar.querySelector<HTMLButtonElement>('#appbar-share');
      const closeLink = appBar.querySelector<HTMLAnchorElement>('#appbar-close');

      const showToast = () => {
        toast.hidden = false;
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          toast.hidden = true;
        }, 1800);
      };

      backBtn?.addEventListener('click', () => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = homeHref;
      });

      shareBtn?.addEventListener('click', async () => {
        const url = window.location.href;
        if (navigator.share) {
          try {
            await navigator.share({ url, title: pageTitle });
          } catch {
            // ignore cancellation
          }
        } else if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(url);
            showToast();
          } catch {
            showToast();
          }
        }
      });

      closeLink?.addEventListener('click', () => {
        // handled via href
      });
    }
  }

  if (siteFooter) {
    siteFooter.innerHTML = `<footer class="app-footer">${footerHtml}</footer>`;
  }
}
