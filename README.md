# Interactive CV

This repository is a static-first Astro + React + TypeScript portfolio site for Denis Gaivoronskii.

The project presents Denis as a VP of Engineering and Go backend engineer through an RPG-style career map called "Backend Odyssey". Visitors can explore checkpoints that represent career stages, production problems, projects, and technical domains, while still being able to open a classic CV immediately.

## Backend Odyssey

The concept is a dark, cyberpunk-inspired journey map:

- each checkpoint is a career node;
- the desktop experience uses a clickable map;
- the mobile experience falls back to a readable vertical timeline;
- the content stays separate from the UI so the story can evolve without rewriting components.

The goal is to make the site understandable in seconds, useful to recruiters without interaction, and expandable into a richer game layer later.

## Tech Stack

- Astro
- React
- TypeScript
- TailwindCSS
- Framer Motion

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

- `src/components/RpgMap.tsx`
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

The current build is an MVP, not a full game layer.

Current limitations:

- checkpoints are clickable only on desktop; there is no keyboard movement yet;
- there is no Phaser or Three.js game engine layer;
- the map is visual and interactive, but not a full simulation;
- guided movement is not implemented yet;
- full WASD navigation is intentionally deferred;
- the current CV is a structured web page, not a generated PDF export.

## Deployment Target

The target deployment is `somchai.dev` on self-hosted infrastructure.

The app is designed to ship as a static build, so deployment should not require a runtime backend.

