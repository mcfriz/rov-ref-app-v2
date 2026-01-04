# ROV Reference App — TODO Backlog (high-level)

> Collected tasks to improve consistency, robustness, and UX across the multi-page app. Prioritize top-down; trim or reorder as needed.

## Phased plan
1) **Stability/UX quick wins**: add fetch error/empty states everywhere, clean up spacing/contrast, confirm back-link desktop-only behavior, and add lazy-loading/fallbacks for images.
2) **Navigation & search polish**: tune global search mini-app insertion/fallback thresholds, add source badges, tighten header offsets and aria/focus handling.
3) **Data & A11y hardening**: lightweight schema checks, aria-live toasts/status, image error placeholders, and consistent chip/tag rendering.
4) **Performance & QA**: debounce/throttle handlers, cache JSON per session where safe, add internal link checker and unit tests for search/procedure helpers.

## Navigation, Header, and Hero
- [ ] Standardize top offsets: ensure `--header-h` and `--appbar-h` are applied uniformly on all app pages, and verify hero spacing on mobile vs desktop.
- [ ] Back link visibility: confirm mobile hide/desktop show behavior across all pages; align copy to “Back to dashboard”.
- [ ] Burger menu aria: review `summary`/`details` for focus-visible outlines and chevron direction; confirm ESC/backdrop close works on iOS Safari.

## Styling and Layout
- [ ] Audit color contrast (lead/body text vs backgrounds) after palette changes; fix any low-contrast text (especially on light cards).
- [ ] Normalize section spacing: main padding, card margins, and gaps so cards don’t appear cramped on mobile.
- [ ] Align button sizing: verify min-widths and radii are consistent after recent changes.

## Data + Fetching
- [ ] Add graceful error states for all fetches (manual finder, procedures, parts, cables, videos, fittings) with retry/cta to contact.
- [ ] Add loading indicators/placeholders for long fetches (especially procedures and manual finder).
- [ ] Validate JSON schemas at runtime (lightweight checks) to prevent render failures on malformed data.

## Global Search
- [ ] Revisit mini-app insertion logic: confirm fallback to Contact only when all mini-app scores are weak; tune thresholds and keyword weights.
- [ ] Add source badges/icons to results for clarity; ensure manual/parts/video links always open in new tab.
- [ ] Add tests/fixtures for search scoring (keywords, part-number patterns) to avoid regressions.

## Procedures Mini-App
- [ ] Improve hash routing/back navigation: remember last category and scroll position when returning from a procedure.
- [ ] Add loading and empty states for steps/troubleshooting/notes; guard against missing arrays.
- [ ] Add image error handling/placeholder for step images.
- [ ] Allow multiple categories and render chips consistently; add filtering by category in search view.

## Accessibility
- [ ] Ensure all interactive elements have `aria-label` where text is not visible (icon buttons, toggles).
- [ ] Add `role="status"`/`aria-live` to toasts and loading messages; confirm focus order is logical.
- [ ] Provide focus-visible outlines for hero CTA buttons and tile links.

## Performance
- [ ] Debounce/throttle scroll/resize listeners (hero slider, nav) where applicable.
- [ ] Cache fetched JSON per session where safe (global search, manual finder, procedures) to reduce requests.
- [ ] Lazy-load non-critical images (hero backgrounds, tile thumbs) and add `loading="lazy"` consistently.

## Content & Assets
- [ ] Verify all PDF/image paths are BASE_URL safe (no leading slashes) and exist in `public/assets`.
- [ ] Add higher-res tile images where missing; ensure onerror fallback styling still looks good.
- [ ] Clean up duplicate or stale data files (e.g., old cable JSON) and document the canonical files.

## Tooling & QA
- [ ] Add a lightweight link checker script (no network in CI) to ensure internal relative paths are valid.
- [ ] Add TypeScript strictness in pages where `any` is used; type JSON shapes explicitly.
- [ ] Consider unit tests for search scoring and procedure rendering helpers (pure functions only).
