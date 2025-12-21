# AGENTS.md — ROV Ref App v2 (Vite + vanilla-ts)

## Goal
Build a fast, mobile-first ROV reference app deployed to GitHub Pages.

## Tech rules (non-negotiable)
- Use Vite + vanilla TypeScript (no frameworks).
- Static site only (no backend).
- Keep code readable and heavily commented.
- Prefer simple patterns that work on GitHub Pages.

## Structure (we will build towards this)
- /index.html (tile dashboard)
- /apps/*.html (each mini-app page)
- /src/* (TypeScript modules)
- /public/data/*.json (editable content)
- /public/assets/pdfs (small PDFs)
- Large manuals / big collections stay on Google Drive and are linked via JSON.

## GitHub Pages requirement
- Vite base path must use BASE_PATH env var (already set up).
- Always test locally with:
  - npm run dev
  - npm run build
  - npm run preview

## Mini-app tiers
Each mini-app page declares a Tier in the top comment block:
- Tier 1: static content + source links
- Tier 2: Tier 1 + search/filter/copy-friendly tables
- Tier 3: Tier 2 + interactive helpers (selectors/calcs/guides)

## ROV selector (initial)
- Must support two options:
  - "Constructor 3 & 4"
  - "Constructor 5 & 6"
- Content comes from JSON in /public/data/
