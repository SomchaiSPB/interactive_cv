# MVP Checklist

## Foundation

- [x] Astro project scaffold is in place
- [x] React integration is enabled
- [x] TypeScript is configured in strict mode
- [x] TailwindCSS styling is configured
- [x] Static production build passes
- [x] Basic site shell and navigation exist

## Content

- [x] Content lives in `src/content/*.ts`
- [x] Profile data is separated from UI
- [x] Checkpoint data is separated from UI
- [x] Project data is separated from UI
- [x] Skills data is separated from UI
- [x] Education data is separated from UI
- [x] Final content pass with Denis's exact wording
- [x] Replace placeholder external links with final live profiles

## RPG Map MVP

- [x] Fullscreen game-first homepage exists
- [x] Phaser-powered 2D RPG quest prototype exists on `/`
- [x] Start screen appears before entering the game
- [x] Visible hero character appears in the first viewport
- [x] Click-to-move hero movement works
- [x] E opens the checkpoint panel when near a location
- [x] Clicking a location opens the checkpoint panel
- [x] Checkpoints render from content data
- [x] Town, buildings, roads, and side locations are visually distinct
- [x] Phaser.Game mounts once per game session without remount flicker
- [x] Town map composition is readable at desktop scale
- [x] Default site navbar stays off the game page
- [x] Detail panel shows title, summary, details, stack, and links
- [x] HUD shows the classic CV and main navigation
- [ ] Add real sprites, map art, and sound
- [ ] Add richer town / building visuals
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
- [ ] Add more project entries
- [ ] Add case-study depth for selected projects

## Mobile

- [x] Mobile timeline fallback exists
- [x] Timeline is readable without the map UI
- [x] Content order remains consistent on mobile
- [x] Game mode is best on desktop with a readable mobile fallback
- [ ] Add touch-specific controls only if explicitly requested

## SEO

- [ ] Add Open Graph metadata
- [ ] Add Twitter card metadata
- [ ] Add canonical URLs
- [ ] Add structured data for person/profile

## Deployment

- [ ] Set deployment environment for `somchai.dev`
- [ ] Verify static hosting configuration
- [ ] Verify build output on target infrastructure
- [ ] Set up preview/staging deploy flow

## Future Game Layer

- [ ] Define richer quest / movement rules
- [ ] Add better sprites, buildings, and map art
- [ ] Add audio and ambient effects
- [ ] Evaluate Three.js only if 3D value is proven
- [ ] Add mobile controls only after the desktop prototype is already useful
