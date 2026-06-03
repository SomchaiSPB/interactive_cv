# Interactive CV

This repository is a static-first Astro + React + TypeScript portfolio site for Denis Gaivoronskii.

The homepage is a Phaser-powered 2D RPG quest portfolio prototype called "Backend Odyssey". Visitors start on a playable town map, click to move a hero, approach buildings and NPCs, and press `E` or click to open portfolio panels. The classic CV, projects, and contact pages stay available as readable static routes.

## Backend Odyssey

The concept is a dark, cyberpunk-inspired RPG quest:

- each checkpoint becomes a town location, building, gate, or NPC interaction;
- the desktop homepage opens with a playable Phaser town scene;
- the classic pages remain accessible as a fallback for recruiters and clients;
- the mobile experience falls back to a readable journey/timeline view;
- the content stays separate from the UI so the story can evolve without rewriting components.

The goal is to make the site understandable in seconds, useful to recruiters without interaction, and expandable into richer art, sound, and movement layers later.

## Tech Stack

- Astro
- React
- TypeScript
- TailwindCSS
- Framer Motion
- Phaser

The site is intentionally static-first and deployable without a backend.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

- `src/pages/` - route entry points for `/`, `/cv`, `/projects`, and `/contact`
- `src/components/` - reusable UI components and the interactive map
- `src/content/` - profile, checkpoints, projects, skills, and education data
- `src/styles/` - global styles and theme primitives
- `docs/` - project planning and MVP checklists

Key interactive files:

- `src/components/game/GameShell.tsx`
- `src/components/game/PhaserGame.tsx`
- `src/game/BackendOdysseyScene.ts`
- `src/components/CheckpointPanel.tsx`
- `src/components/Timeline.astro`

## Content Editing

All presentation content is stored in `src/content/*.ts`.

Update these files to change the public story without touching layout logic:

- `src/content/profile.ts`
- `src/content/checkpoints.ts`
- `src/content/projects.ts`
- `src/content/skills.ts`
- `src/content/education.ts`

This separation is deliberate so future content refreshes stay low-risk and the UI can remain stable.

## Current MVP Limitations

The current build is an MVP, not a full game product.

Current limitations:

- the game layer uses generated placeholder buildings, roads, and hero sprites rather than final art;
- the tilemap / asset pipeline is not finalized yet;
- mobile users still get a readable fallback instead of joystick or touch controls;
- WASD movement, pathfinding, and richer traversal are deferred;
- 3D/Three.js is deferred;
- the current CV is a structured web page, not a generated PDF export.

## Deployment Target

The target deployment is `somchai.dev` on self-hosted infrastructure.

The app is designed to ship as a static build, so deployment should not require a runtime backend.
