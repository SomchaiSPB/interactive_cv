# Backend Odyssey Plan

This plan keeps the project centered on a useful portfolio first, with optional game-like layers added only after the core site is already effective.

## Phase 0: Documentation and Content Cleanup

Scope:

- document the project structure and working rules;
- clarify MVP boundaries;
- keep content ownership in `src/content/*.ts`.

Deliverables:

- README and agent instructions;
- MVP checklist;
- phased implementation plan;
- clearer content boundaries.

Non-goals:

- no UI redesign;
- no game engine work;
- no route or component refactor.

## Phase 1: Content Finalization

Scope:

- replace placeholder text with Denis's final wording;
- confirm titles, summaries, and external links;
- refine checkpoint copy so it reads like a real career narrative.

Deliverables:

- final profile copy;
- final checkpoint copy;
- final project summaries;
- final education and skill wording.

Non-goals:

- no new interaction model;
- no backend;
- no PDF generation unless explicitly requested later.

## Phase 2: Visual Polish

Scope:

- improve spacing, hierarchy, and emphasis;
- refine the RPG map feel while keeping it professional;
- improve readability on both desktop and mobile.

Deliverables:

- stronger visual hierarchy;
- better glows, panels, and map legibility;
- tighter responsive polish.

Non-goals:

- no Phaser;
- no Three.js;
- no WASD movement;
- no motion-heavy game mechanics.

## Phase 3: MVP Deployment

Scope:

- deploy the current site as a static portfolio;
- verify the build and hosting path;
- ensure the site is useful before adding game features.

Deliverables:

- production deployment to `somchai.dev` / self-hosted infrastructure;
- validated static build;
- public access to the MVP site.

Non-goals:

- no runtime backend requirement;
- no engine rewrite;
- no feature expansion into a full game.

## Phase 4: Guided Movement

Scope:

- add guided map movement between checkpoints;
- preserve clickable checkpoint selection as the primary action;
- keep navigation readable and controlled.

Deliverables:

- path-guided exploration;
- smoother map narrative flow;
- improved sequencing between checkpoints.

Non-goals:

- no unrestricted free-roam movement yet;
- no WASD as the default interaction model;
- no complex game loop.

Important:

- clickable checkpoints remain the MVP baseline;
- guided movement can be added before full WASD;
- the site must already be useful as a portfolio before movement complexity increases.

## Phase 5: Optional WASD / Game Mode

Scope:

- evaluate whether a game mode adds real value;
- add WASD and game-like movement only if the portfolio already stands on its own;
- keep the existing CV experience intact.

Deliverables:

- optional game mode design;
- WASD navigation only if justified;
- feature separation so the portfolio remains stable.

Non-goals:

- do not replace the portfolio with a game;
- do not add game-engine complexity unless it improves the user experience materially;
- do not compromise readability or recruiter usability.

