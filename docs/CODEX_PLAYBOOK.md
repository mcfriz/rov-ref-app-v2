# CODEX_PLAYBOOK — Prompts that work well in this repo

## Rules for Codex
- Make changes in small commits.
- Touch only the files I list unless you ask first.
- Keep TypeScript simple and well-commented.
- After changes: run npm run build (and npm run preview when relevant).

---

## Prompt: Create scaffold pages
Goal: Create /apps pages using the Tier system.

Files to touch:
- /apps/*.html
- /index.html
- /src/main.ts
- /src/style.css

Acceptance:
- Home shows tiles linking to each page
- Each page has title + purpose line + source material section
- Relative links work on GitHub Pages base path

---

## Prompt: Add a JSON-driven selector
Goal: Add selector to a page and render content from JSON.

Files to touch:
- /apps/<page>.html
- /src/<page>.ts
- /public/data/<file>.json

Acceptance:
- Dropdown updates content live
- No hard-coded data in TS except schema defaults
- Works in npm run preview
