# Launch Plan (2026-10-29)

Replaces the earlier phase plan. Goal: ship `somchai.dev` as a portfolio that sells
private development services, then stop polishing.

## Positioning

Old framing: "Go backend engineer / VP Engineering". Language-centric, reads as a job CV.

New framing (wording TBD by Denis): **you bring a business problem — a shop, a service built
from scratch, an integration — I learn the domain and take it to a working product in production.**

- Buyer: founders / small companies who need a result, not headcount.
- Proof is shipped systems and outcomes, not a tech list. Stack is a secondary line.
- AI is not mentioned as a selling point — it is a tool, like the IDE.
- Language: English only (matches LinkedIn). No Russian version for launch.
- No prices. Contacts: email + Telegram.

## Proof: case studies

| Case | Angle | Notes |
|---|---|---|
| **Financial integrations** (SUPO, work) | Complex financial integrations and business entities: CCH, Xero, GoCardless (Atlar next). Outcome: large share of manual accounting work automated, less staff time | Facts and outcome only, no internals. Final wording from Denis |
| **SUPO platform** (work) | Engineering lead for the platform | Merge into the case above if it reads as one story |
| **ai-video / tldw** (own product) | Solo, idea → live product: video → transcript, visual analysis, chat with evidence | Public link; what it is, what it does |
| **Zapros.ge** (own product) | Solo reverse marketplace (housing, Tbilisi): API + web, RU/EN/KA, Telegram/email, admin; live on `zapros.ge` | Public link |

Dropped from the site: WebRTC messenger, OCR bot, infra tooling, Go-centric checkpoints.
Each case: **problem → what I did → result** (live link / screenshot).

## Phase 1 — Content

- [x] Rewrite `profile.ts` around the new framing (English) — draft.
- [x] Rewrite `projects.ts` as the cases above — draft; SUPO merged into one financial case.
- [x] Cut `checkpoints.ts` from 17 to 6 (About, 3 cases, How I work, Hire Me); `LAYOUTS` reduced to match.
- [x] "What I take on" block (`profile.services`).
- [ ] Screenshots for ai-video and Zapros in `public/`.

## Phase 2 — Finish the game (target 2–3 days)

Current state: Phaser town renders with TilesetGrass terrain, Adventurer hero walks
(click-to-move), panels auto-open near locations, build passes. Buildings are generated placeholders.

- [x] Re-layout the town: all 6 locations fit the first screen around the square.
- [x] Buildings: TilesetGrass art for hall/library/market, generated sprites for workshop/gate.
- [x] Remove leftover NPC, dead roads/halo code, debug panel block; one-line HUD.
- [x] Fix hero sprite slicing (strips are 8×96px, not 12×64px) and enable idle/run animation.
- [x] Walking to a clicked building no longer stops at every building on the way.
- [ ] Panel per case: result first, link, screenshot.
- [ ] Mobile timeline fallback shows the same items + contact CTA.

Out of scope for launch: sound, WASD, pathfinding, Tiled pipeline, new art packs, mobile controls, 3D.

## Phase 3 — Homepage, contact, SEO

- [x] Static landing at `/` (pitch, services, cases, contact); game moved to `/play`.
- [x] `/contact`: email + Telegram, what to include in the first message.
- [x] `/cv` and `/projects` follow the new content.
- [x] Contacts: info@somchai.dev, Telegram @s0mchai.
- [ ] Open Graph / Twitter card / canonical / Person structured data in `Layout.astro`; favicon, OG image.

## Phase 4 — Deploy to `ovhvps` (FR)

Moving off Vultr. `ovhvps` (France, 6 vCPU / 11 GiB, 84 GB free) already runs ai-video/tldw
and Zapros behind nginx; a static site adds negligible load. `ovh-de` stays free.

- [ ] Find how public traffic reaches `ovhvps` (nginx `server_name _` → likely a Cloudflare
      tunnel/proxy) and add `somchai.dev` + `www` the same way.
- [ ] Static nginx root, e.g. `/var/www/somchai.dev`; deploy = `npm run build` + rsync `dist/`.
- [ ] Point DNS for `somchai.dev` to the new host; retire the Vultr site/vhost (`api.somchai.dev` — check whether still used).
- [ ] Smoke-check: routes, desktop game, mobile fallback, OG preview.

## Open decisions

- Final wording for positioning and the SUPO case — Denis.
