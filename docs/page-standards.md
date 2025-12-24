# ROV Reference App — Page Standards (Vite + vanilla TS)

Use this as the reference when creating or updating any `/apps/*.html` page and its companion TS module.

## Structure
- HTML: Minimal shell with `<!doctype html>`, `<meta charset>`/`viewport`, and three root containers:
  - `<div id="site-header"></div>`
  - `<div id="app"></div>`
  - `<div id="site-footer"></div>`
- Scripts: Load the shared shell initializer first, then the page script:
  ```html
  <script type="module" src="../src/ui/shell-init.ts"></script>
  <script type="module" src="../src/pages/<page>.ts"></script>
  ```
- Paths: Always use BASE_URL-safe helpers or `../` relative paths (no leading slashes). Assets live under `public/assets/...`; data under `public/data/...`.

## Shared Shell & Hero
- Header and burger come from the shell module; never inline duplicate markup.
- On app pages, the shell injects a hero with `deep_blue_Background.png` and the page title overlay. Do not add extra H1s in content; the hero carries the title.
- The back link remains in page content but is hidden on mobile (≤800px).

## Layout & Spacing
- Wrap content in `<main class="page narrow-page">` (or `page` when wider).
- Use existing utility classes: `.card`, `.finder-form`, `.field`, `.result-table`, `.fit-card`, `.button-row`, `.btn`, `.btn.small`.
- Spacing defaults (desktop): page padding ~1–2.5rem, section gap ~0.5–1rem. Mobile spacing is tighter; avoid adding large custom margins.
- Keep text contrast high; prefer palette variables (`--muted`, etc.) instead of white on light backgrounds.

## Navigation & Links
- Back link copy: `&larr; Back to dashboard`. Hide on mobile via the shared CSS rule (`.app-page .back { display: none; }` in mobile breakpoint).
- External links: `target="_blank" rel="noopener noreferrer"`.
- Internal links: use `buildHref()` or `../index.html` as appropriate; never use absolute “/”.

## Data Loading
- Fetch JSON with `import.meta.env.BASE_URL` awareness (e.g., `fetch(baseWithSlash + 'data/...')`).
- Add graceful error handling (show helper text, not blank UIs).
- Cache per-session when reusing data; debounce search inputs (~200ms).

## Components & Content Patterns
- Hero CTA buttons: `.btn.primary` with accessible text; ensure focus-visible outlines.
- Tables: wrap in `.table-scroll`, use `.result-table`, include headers.
- Cards: `.card` for containers; `.fit-card` for list items; include small helper text where needed.
- Accordions: use `<details>`/`<summary>` with `.accordion` styling when appropriate.
- PDF or iframe embeds: `.pdf-frame` class; include a note for mobile users to open in a new tab.

## Accessibility
- Provide `aria-label` on icon-only buttons (burger, search, close, share).
- Ensure focus-visible styles are intact on links, buttons, and dots/controls.
- Toasts and status messages: `role="status"` with `aria-live="polite"`.

## Assets & Images
- Use `loading="lazy"` on non-critical images (tiles, thumbs). Provide `onerror="this.style.display='none';"` if fallback is acceptable.
- Keep hero and tile images BASE_URL-safe via helper or `../assets/...` from apps.
- For category/icon usage, prefer simple SVGs in `public/assets/icons/`.

## Testing & Validation
- Manually verify on mobile and desktop: header spacing, hero visibility, back link behavior, focus outlines, and that all links resolve under the repo subpath.
- For search/finder pages: test empty state, error state, and a few known-good queries.

## Naming & Files
- Page pair: `apps/<page>.html` + `src/pages/<page>.ts`.
- Data: `public/data/<context>.json`, avoid duplicate similarly named files; document canonical sources in code comments if multiple variants exist.
