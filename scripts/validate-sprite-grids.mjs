import { readFile } from 'node:fs/promises';

const sourceUrl = new URL('../src/game/spriteDefs.ts', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');

const paletteLengths = new Map();
for (const match of source.matchAll(/const (PALETTE_[A-Z_]+): Palette = \[([\s\S]*?)\n\];/g)) {
  const colors = match[2].match(/0x[0-9a-f]+/gi) ?? [];
  paletteLengths.set(match[1], colors.length);
}

const sprites = [];
const heroMatch = source.match(/const HERO:[\s\S]*?const pal = (PALETTE_[A-Z_]+);[\s\S]*?const g = \[([\s\S]*?)\n\s*\];/);
if (!heroMatch) {
  throw new Error('Could not locate the odyssey hero sprite grid.');
}
sprites.push({ name: 'odyssey-hero', paletteName: heroMatch[1], rows: parseRows(heroMatch[2]) });

const buildingPattern = /(\w+): \{\s*palette: (PALETTE_[A-Z_]+),\s*grid: \[([\s\S]*?)\n\s*\],\s*},/g;
for (const match of source.matchAll(buildingPattern)) {
  sprites.push({ name: `building-${match[1]}`, paletteName: match[2], rows: parseRows(match[3]) });
}

if (sprites.length < 2) {
  throw new Error('Could not locate building sprite grids.');
}

for (const sprite of sprites) {
  validateGrid(sprite.name, sprite.rows, sprite.paletteName);
}

console.log(`Validated ${sprites.length} sprite grids.`);

function parseRows(block) {
  return [...block.matchAll(/'([0-9a-z]+)'/g)].map((match) => match[1]);
}

function validateGrid(name, rows, paletteName) {
  const width = rows[0]?.length ?? 0;
  if (width === 0) {
    throw new Error(`Sprite "${name}" must have at least one pixel column.`);
  }

  const paletteLength = paletteLengths.get(paletteName);
  if (!paletteLength) {
    throw new Error(`Sprite "${name}" references missing or empty palette "${paletteName}".`);
  }

  for (const [rowIndex, row] of rows.entries()) {
    if (row.length !== width) {
      throw new Error(`Sprite "${name}" row ${rowIndex + 1} has width ${row.length}; expected ${width}.`);
    }

    for (const pixel of row) {
      const colorIndex = Number.parseInt(pixel, 36);
      if (!Number.isInteger(colorIndex) || colorIndex < 0 || colorIndex >= paletteLength) {
        throw new Error(
          `Sprite "${name}" row ${rowIndex + 1} references palette index "${pixel}", but "${paletteName}" has ${paletteLength} colors.`,
        );
      }
    }
  }
}
