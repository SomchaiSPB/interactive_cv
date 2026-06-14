# Backend Odyssey Plan

This plan keeps the project centered on a useful portfolio first, with a Phaser-powered 2D RPG quest homepage layered on top of the static career story. The classic CV remains available as the fallback route for recruiters and clients.

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
- refine the RPG town feel while keeping it professional;
- improve readability on both desktop and mobile.
- stabilize the mounted Phaser scene and recomposed town so the homepage stays readable before any new gameplay is added.
- use a tile-like generated town composition with distinct districts, paths, foliage, fences, and a central plaza.

Deliverables:

- stronger visual hierarchy;
- better buildings, roads, panels, and map legibility;
- tighter responsive polish.

Non-goals:

- no Three.js;
- no 3D direction;
- no motion-heavy game mechanics.

## Phase 3: MVP Deployment

Scope:

- deploy the current site as a static portfolio;
- keep `/` as a game-first Phaser 2D RPG quest prototype;
- verify the build and hosting path;
- ensure the site is useful before adding game features.

Deliverables:

- production deployment to `somchai.dev` / self-hosted infrastructure;
- validated static build;
- public access to the MVP site.

Non-goals:

- no runtime backend requirement;
- no 3D / Three.js layer;
- no asset-pipeline finalization in this phase;
- no replacement of the classic CV route.

## Phase 4: Guided Movement

Scope:

- refine guided travel and interaction flow beyond the current Phaser prototype;
- preserve click-to-move and readable HUD structure;
- auto-open checkpoint panels when the hero enters a location's interaction radius;
- keep navigation readable and controlled.

Deliverables:

- optional guided movement behaviors;
- smoother map narrative flow;
- improved sequencing between locations and panels.

Non-goals:

- no 3D / Three.js;
- no joystick/mobile controller in the default build;
- no pathfinding-heavy traversal layer;
- no Tiled pipeline yet; the current map remains generated and asset-free;
- no replacement of the static CV fallback.

Important:

- the homepage is already game-first and playable;
- the classic CV remains a fallback for quick review;
- the current direction is a tile-like 2D RPG town; a full tileset and asset pipeline remain pending.
- `/cv` remains the classic readable fallback for recruiters and clients.

## Phase 5: Optional Advanced Movement

Scope:

- evaluate whether richer interaction, art, or sound adds real value;
- expand movement only if it improves the quest experience;
- improve the asset pipeline, real sprites, map art, and audio only if they increase clarity;
- keep the existing CV experience intact.

Deliverables:

- optional game expansion plan;
- better towns, buildings, NPCs, and HUD polish;
- feature separation so the portfolio remains stable.

Non-goals:

- do not replace the portfolio with a game-first-only experience;
- do not add 3D unless it is explicitly requested and justified;
- do not make WASD the default unless it is explicitly requested and clearly beneficial;
- do not compromise readability or recruiter usability.
