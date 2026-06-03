# AGENTS.md

## Purpose

This file defines the working rules for AI coding agents in this repository.

## Core Rules

1. Keep content separated from UI.
   - Career data, project summaries, skills, and education must remain in `src/content/*.ts`.
   - UI components should consume content, not own it.

2. Keep the project static-first.
   - The site must remain deployable without a backend.
   - Do not add runtime dependencies on server APIs for the MVP.

3. Keep TypeScript strict.
   - Preserve strict typing.
   - Avoid weakening compiler settings to make the build pass.

4. Validate before committing.
   - `npm run build` must pass before any commit that changes project files.

5. Do not add game-engine features unless explicitly requested.
   - Phaser, Three.js, WASD movement, combat systems, or similar game mechanics are future extensions.
   - The default product is a professional interactive CV, not a game.

6. Keep the UI professional and readable.
   - The visual language may be dark, cyberpunk, and pixel-influenced.
   - It must not become childish, toy-like, or novelty-first.

7. Preserve the mobile fallback.
   - Mobile users must see a readable vertical timeline.
   - Do not remove or break the simplified mobile experience.

8. Keep operational artifacts in the repo-local artifact area.
   - Write worklogs to `.ai-artifacts/worklogs/`.
   - Keep scratch notes and validation breadcrumbs in `.ai-artifacts/` when needed.

9. Keep changes minimal and scoped.
   - Do not refactor components unless the request explicitly calls for it.
   - Avoid unrelated cleanups.

## Current Project Shape

- Astro pages: `/`, `/cv`, `/projects`, `/contact`
- Interactive map: `src/components/RpgMap.tsx`
- Checkpoint details: `src/components/CheckpointPanel.tsx`
- Mobile fallback: `src/components/Timeline.astro`

## Documentation Expectations

- Update docs when the MVP scope or roadmap changes.
- Keep planning docs honest about what is implemented and what is deferred.

