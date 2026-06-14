# Game Assets

## TilesetGrass Audit

`assets/TilesetGrass` is a user-provided downloaded tileset pack. The source files are preserved unchanged.

### Format

- Tile size: 16 x 16 pixels.
- Tileset image: `overworld_tileset_grass.png`, 192 x 336 pixels.
- Grid: 12 columns by 21 rows, 252 tiles.
- Transparency: RGBA PNG.
- `grass_biome.tsx` is an external Tiled tileset XML file. It defines terrain metadata for grass, water, forest, swamp grass, and swamp tiles.
- `map1.tmx` is a 21 x 42 orthogonal Tiled map with two CSV-encoded tile layers.
- `map2.tmx` is a 15 x 15 orthogonal Tiled map with two CSV-encoded tile layers.
- Both TMX files reference `grass_biome.tsx` and can be used as layout/tile-index references.

### Runtime Preparation

Only the tileset PNG is copied to `public/game/assets/TilesetGrass/`. The current Phaser scene does not load TMX or TSX XML directly, so those files are not browser runtime dependencies.

Before map integration, choose one narrow path:

1. Export a project-owned map from Tiled as JSON and load it through Phaser's Tiled JSON support.
2. Keep the map code-defined and use audited tile indices from the TSX/TMX files.

Do not add a conversion pipeline until the intended map composition is agreed.

### License Gate

No license, source URL, credits, author metadata, or README exists in the provided pack. License status is therefore unverified. Do not claim CC0 or publish the asset in production until the original source is identified and its license is recorded here and beside the public runtime file.
