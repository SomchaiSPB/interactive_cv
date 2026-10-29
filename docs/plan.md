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
- [x] Screenshots for tldw.cloud and Zapros in `public/work/` (cards + game panels).

## Phase 2 — Finish the game (target 2–3 days)

Current state: Phaser town renders with TilesetGrass terrain, Adventurer hero walks
(click-to-move), panels auto-open near locations, build passes. Buildings are generated placeholders.

- [x] Re-layout the town: all 6 locations fit the first screen around the square.
- [x] Buildings: TilesetGrass art for hall/library/market, generated sprites for workshop/gate.
- [x] Remove leftover NPC, dead roads/halo code, debug panel block; one-line HUD.
- [x] Readable art: plaza + well, fort, dark tower (Video Lab), Guild Hall (How I work), quest board (Hire Me).
- [x] Fix hero sprite slicing (strips are 8×96px, not 12×64px) and enable idle/run animation.
- [x] Walking to a clicked building no longer stops at every building on the way.
- [ ] Panel per case: result first, link, screenshot.
- [ ] Mobile timeline fallback shows the same items + contact CTA.

Parked: a "References" NPC once referees are confirmed (so far only the current CEO).

Out of scope for launch: sound, WASD, pathfinding, Tiled pipeline, new art packs, mobile controls, 3D.

## Phase 3 — Homepage, contact, SEO

- [x] Static landing at `/` (pitch, services, cases, contact); game moved to `/play`.
- [x] Title-screen redesign: Somchai.dev brand instead of the name, PRESS START → `/play`, contacts incl. LinkedIn.
- [x] `/contact`: email + Telegram, what to include in the first message.
- [x] `/cv` and `/projects` follow the new content.
- [x] Contacts: info@somchai.dev, Telegram @s0mchai.
- [x] Open Graph / Twitter card / canonical / Person structured data in `Layout.astro`; favicon, OG image.
- [x] `robots.txt`, `sitemap.xml`, custom 404; slash-free URLs.

## Phase 4 — Deploy to `ovhvps` (FR)

Moving off Vultr. `ovhvps` (France, 6 vCPU / 11 GiB, 84 GB free) already runs ai-video/tldw
and Zapros behind nginx; a static site adds negligible load. `ovh-de` stays free.

Traffic: Cloudflare → Vultr edge (gateway for all sites) → Tailscale → `ovhvps:8003` → `/var/www/somchai.dev/current`.
Infra lives in `vultr-infra` (`somchai-playbook.yml`, `group_vars/web.yml`, `docs/somchai-site.md`).

- [x] OVH origin vhost, release dir, UFW rule; tailnet grant `tag:vps` → `tag:tldw-core` `tcp:8003`.
- [x] Edge vhost `somchai.dev` + `www` redirect; DNS `www` record added.
- [x] `npm run deploy`: rsync to `releases/<utc>-<sha>`, atomic `current` switch, keeps 5.
- [x] Smoke-check: all routes 200, 404 page, cache headers, HTTPS/www redirects; neighbouring sites unaffected.
- [ ] Check the OG preview in LinkedIn Post Inspector and Telegram.
- [ ] Later (separate epic): move the edge gateway off Vultr to OVH.

## Open decisions

- Final wording for positioning and the SUPO case — Denis.
