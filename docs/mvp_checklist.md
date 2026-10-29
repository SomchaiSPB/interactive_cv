# MVP Checklist

## Foundation

- [x] Astro project scaffold is in place
- [x] React integration is enabled
- [x] TypeScript is configured in strict mode
- [x] TailwindCSS styling is configured
- [x] Static production build passes
- [x] Basic site shell and navigation exist
- [x] Static services landing at `/`; game moved to `/play`
- [x] Favicon and Apple touch icon
- [x] Custom 404 page

## Content

- [x] Content lives in `src/content/*.ts`
- [x] Profile data is separated from UI
- [x] Checkpoint data is separated from UI
- [x] Project data is separated from UI
- [x] Skills data is separated from UI
- [x] Education data is separated from UI
- [x] Content repositioned for client-facing services (English draft)
- [ ] Final content pass with Denis's exact wording (positioning, SUPO case numbers)
- [x] Replace placeholder external links with final live profiles

## RPG Map MVP

- [x] Fullscreen game-first homepage exists
- [x] Phaser-powered 2D RPG quest exists on `/play`
- [x] `/play` opens directly into the playable quest map
- [x] Visible hero character appears in the first viewport
- [x] Click-to-move hero movement works
- [x] Checkpoint panel opens automatically when the hero enters interaction range
- [x] Clicking a location moves the hero toward it
- [x] Checkpoints render from content data
- [x] Town, buildings, roads, and side locations are visually distinct
- [x] Phaser.Game mounts once per game session without remount flicker
- [x] Town map composition is readable at desktop scale
- [x] Default site navbar stays off the game page
- [x] Detail panel shows title, summary, details, stack, and links
- [x] HUD shows the classic CV and main navigation
- [x] Add generated placeholder sprite system
- [x] Add tile-like generated terrain, districts, paths, foliage, and fences
- [x] Complete Art Pass 1 with recognizable generated buildings and a warmer RPG town palette
- [x] Clean up map UX with unobstructed labels and simplified dirt-road geometry
- [x] Integrate the Adventurer runtime player sprite with directional idle/run animation (fixed 96px frame slicing)
- [x] Town reduced to six client-facing locations, all visible on the first screen
- [x] Hero walks past buildings to the clicked one without stopping
- [x] Remove dead code (roads, halos, NPC marker, debug panel stats)
- [x] Audit and stage the TilesetGrass runtime image with source and license notes
- [x] Integrate TilesetGrass as a local prototype terrain pass
- [x] Generate a tile index contact sheet for TilesetGrass
- [x] Verify the TilesetGrass source and license before production use
- [ ] Add final real sprites, map art, and sound
- [ ] Replace generated placeholders with a final production asset pack
- [ ] Add deeper guided travel or interaction behaviors
- [ ] Add WASD / keyboard movement only if it becomes useful

## Classic CV

- [x] `/cv` route exists
- [x] CV is recruiter-friendly and readable
- [x] CV reuses the same content source as the map
- [ ] Add a downloadable PDF version
- [ ] Add print-specific styling

## Projects

- [x] `/projects` route exists
- [x] Projects are content-driven
- [x] Projects are presented as reusable cards
- [x] Case studies: problem → what I did → result, with live links
- [ ] Screenshots for tldw.cloud and Zapros

## Mobile

- [x] Mobile timeline fallback exists
- [x] Timeline is readable without the map UI
- [x] Content order remains consistent on mobile
- [x] Game mode is best on desktop with a readable mobile fallback
- [ ] Add touch-specific controls only if explicitly requested

## SEO

- [x] Add Open Graph metadata (1200×630 `og.png`)
- [x] Add Twitter card metadata
- [x] Add canonical URLs (slash-free, `build.format: 'file'`)
- [x] Add structured data for person/profile
- [x] `robots.txt` and `sitemap.xml`

## Deployment

- [x] Set deployment environment for `somchai.dev` (ovhvps origin behind the Vultr edge)
- [x] Verify static hosting configuration (cache headers, 404, www → apex, HTTP → HTTPS)
- [x] Verify build output on target infrastructure (`npm run deploy`, release dirs + atomic switch)
- [ ] Set up preview/staging deploy flow

## Future Game Layer

- [ ] Define richer quest / movement rules
- [x] Improve generated placeholder sprites, buildings, and map readability
- [ ] Add final production sprites, tiles, and map art
- [ ] Replace the generated checkpoint buildings with final production art
- [ ] Convert or author the final tile map after the TilesetGrass license gate is cleared
- [ ] Add audio and ambient effects
- [ ] Evaluate Three.js only if 3D value is proven
- [ ] Add mobile controls only after the desktop prototype is already useful
- [ ] References NPC (parked until referees are confirmed)
