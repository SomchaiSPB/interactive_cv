# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Read `AGENTS.md` first** — it holds the binding project rules (content/UI separation, static-first, strict TS, no unrequested game mechanics, mobile fallback, worklogs in `.ai-artifacts/worklogs/`). They apply here too.

## Commands

- `npm run dev` — Astro dev server
- `npm run build` — runs `validate:sprites` then `astro build`; must pass before any commit
- `npm run validate:sprites` — checks sprite grids in `src/game/spriteDefs.ts` (row widths, palette indices)
- `npm run preview` — serve the production build

There is no test runner, linter, or `astro check` script; `npm run build` is the validation gate (it does not do full TS type checking).

## Architecture

Static Astro site (React + Tailwind islands) selling private development services. `/` is a static landing (pitch, services, cases from `src/content/`); `/play` is the Phaser game "Backend Odyssey"; `/cv`, `/projects`, `/contact` are plain Astro pages. `Layout.astro` hides its header/footer on `/play`.

**Content → game pipeline**
- `src/content/*.ts` is the single source of truth (checkpoints, projects, profile, skills, education; types in `src/content/types.ts`).
- `src/game/locationMapper.ts` merges each checkpoint (by id) with a hard-coded `LAYOUTS` entry (world position, footprint, interaction radius, colors, `LocationKind`) to produce `GameLocation`s. Adding a checkpoint that should appear in the town needs a matching layout entry here.
- `src/game/townMap.ts` / `tileAssets.ts` build the generated tile-style map from `public/game/assets/TilesetGrass/`; `spriteDefs.ts` holds pixel-grid sprites (hero, buildings) as palette + string rows — `scripts/validate-sprite-grids.mjs` parses this file with regexes, so keep the `const PALETTE_X: Palette = [...]`, `HERO`, and `name: { palette, grid: [...] }` shapes intact.
- `src/game/BackendOdysseyScene.ts` is the Phaser scene (click-to-move hero, proximity-triggered locations).

**React ↔ Phaser bridge**
- `src/components/game/GameShell.tsx` (mounted `client:load` in `src/pages/play.astro`) owns UI state, nav, and `CheckpointPanel`; below 768px it renders the readable mobile fallback instead of the game.
- `src/components/game/PhaserGame.tsx` lazy-imports `phaser` and the scene (keeps Phaser out of SSR) and owns the `Phaser.Game` lifecycle.
- Scene and React communicate only via `window` `CustomEvent`s named in `src/game/types.ts` (`odyssey:ready`, `odyssey:nearest`, `odyssey:open`, `odyssey:close`). Add new interactions as new events there rather than coupling the scene to React.

## Docs

`docs/plan.md`, `docs/mvp_checklist.md`, `docs/assets.md` (tileset audit; source packs live in `assets/`, runtime copies in `public/game/assets/`). Update them when scope changes.
