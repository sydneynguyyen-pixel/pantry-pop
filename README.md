# Pantry Pop! 🎁

A gacha-style "blind box" meal picker. Pick a box type (breakfast, lunch, dinner, snack, dessert), claim boxes without knowing what's inside, then unwrap them one at a time to reveal a recipe. Track what you've unwrapped, build a shopping list, and manage your own recipe pool.

Built with React 19, TypeScript, Vite, and Zustand. Everything is stored locally in the browser (`localStorage`) — no backend, no accounts.

## Features

- Blind-box shelf with weighted rarity draws (common / rare / ultra-rare), a pity counter, and day-of-week gating for splurge-tier pulls
- Drag-and-drop claiming, an interactive shake-and-unwrap sequence, and a shuffle-boxes animation
- A shopping list on checkout, grouped by recipe with per-ingredient estimated macros
- History view with a streak counter, sticker album, and a per-day calorie chart with an optional goal line
- Recipe pool manager: add recipes by hand, drag-and-drop a custom photo, or import from pasted text/a link/a text file
- An "active ingredients" pantry checklist — uncheck what you don't have at home and matching recipes are excluded from the draw
- Light/dark mode, a fully responsive layout, and a playful pastel visual theme

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production (outputs to `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint

## Notes

All app state (shelves, basket, recipe pool, settings, shopping history, pantry, theme) persists to `localStorage` in the current browser only — it isn't synced anywhere.
