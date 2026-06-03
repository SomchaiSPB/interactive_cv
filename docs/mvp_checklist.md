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
- [ ] Final content pass with Denis's exact wording
- [ ] Replace placeholder external links with final live profiles

## RPG Map MVP

- [x] Desktop map section exists
- [x] Checkpoints render from content data
- [x] Clicking a checkpoint updates the detail panel
- [x] Side checkpoints are supported
- [x] Detail panel shows title, summary, details, and technologies
- [x] Add richer animation polish
- [x] Add guided hero marker v1
- [ ] Add keyboard navigation

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
- [ ] Improve small-screen spacing and density after content finalization

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

- [ ] Define guided movement rules
- [ ] Add map pathing between checkpoints
- [ ] Evaluate Phaser only if interaction requirements grow
- [ ] Evaluate Three.js only if 3D value is proven
- [ ] Add WASD movement only after the site is already useful as a portfolio
