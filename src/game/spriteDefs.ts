import Phaser from 'phaser';

type Palette = number[];
type SpriteData = { w: number; h: number; pixels: number[][] };
type ParsedGrid = { w: number; h: number; pixels: number[][] };

function drawSprite(
  graphics: Phaser.GameObjects.Graphics,
  data: SpriteData,
  palette: Palette,
  scale: number,
) {
  for (let y = 0; y < data.h; y++) {
    for (let x = 0; x < data.w; x++) {
      const colorIndex = data.pixels[y]?.[x] ?? 0;
      if (colorIndex === 0) continue;
      const color = palette[colorIndex];
      if (color === undefined) {
        throw new Error(`Sprite references palette index ${colorIndex}, but the palette has ${palette.length} colors.`);
      }
      graphics.fillStyle(color, 1);
      graphics.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

function generateTexture(
  scene: Phaser.Scene,
  key: string,
  data: SpriteData,
  palette: Palette,
  scale: number,
) {
  const w = data.w * scale;
  const h = data.h * scale;
  const graphics = scene.add.graphics();
  drawSprite(graphics, data, palette, scale);
  graphics.generateTexture(key, w, h);
  graphics.destroy();
}

const PALETTE_CYBER: Palette = [
  0x00000000,
  0x1b2432,
  0x2f4056,
  0x4a6582,
  0x7cf7d4,
  0x45c9a8,
  0xf6b74c,
  0xd4882a,
  0xc9d6ea,
  0x8da3c2,
  0x0d111a,
  0x1a2a3a,
  0x69a7ff,
  0xff6b6b,
  0x3d1a1a,
];

function parseGrid(name: string, grid: string[], palette: Palette): SpriteData {
  validateGrid(name, grid, palette);
  const pixels = grid.map((row) => [...row].map((ch) => parseInt(ch, 36)));
  return { w: grid[0].length, h: grid.length, pixels };
}

function validateGrid(name: string, grid: string[], palette: Palette) {
  const width = grid[0]?.length ?? 0;
  if (width === 0) {
    throw new Error(`Sprite "${name}" must have at least one pixel column.`);
  }

  for (const [rowIndex, row] of grid.entries()) {
    if (row.length !== width) {
      throw new Error(`Sprite "${name}" row ${rowIndex + 1} has width ${row.length}; expected ${width}.`);
    }

    for (const pixel of row) {
      const colorIndex = parseInt(pixel, 36);
      if (!Number.isInteger(colorIndex) || colorIndex < 0 || colorIndex >= palette.length) {
        throw new Error(
          `Sprite "${name}" row ${rowIndex + 1} references palette index "${pixel}", but the palette has ${palette.length} colors.`,
        );
      }
    }
  }
}

const HERO: SpriteData = (() => {
  const pal = PALETTE_CYBER;
  const g = [
    '000ccccc000',
    '00c11111c00',
    '0c1111111c0',
    '0c1555551c0',
    '0c1888881c0',
    '00c11111c00',
    '00c12221c00',
    '0cc12221cc0',
    '0c4122214c0',
    '0c4122214c0',
    '00c19991c00',
    '00c19991c00',
    '00ca999ac00',
    '00ca999ac00',
    '000c333c000',
    '00c33333c00',
    '00c33333c00',
    '000c33c0000',
    '000c33c0000',
    '00cc00cc000',
  ];
  return parseGrid('odyssey-hero', g, pal);
})();

// Hire Me quest board: roof, plank board, pinned job notes.
const PALETTE_QUEST_BOARD: Palette = [
  0x00000000,
  0x2b1d14,
  0x6b4423,
  0x9c6b3c,
  0xa94b36,
  0xd2694a,
  0xf2e6c4,
  0xcdbb8f,
  0x4a4a58,
  0xf0c75e,
];

type BuildingDef = {
  grid: string[];
  palette: Palette;
};

const B_DEFS: Record<string, BuildingDef> = {
  questBoard: {
    palette: PALETTE_QUEST_BOARD,
    grid: [
      '0000000111111110000000',
      '0000011555555551100000',
      '0001144444444444411000',
      '0114444444444444444110',
      '1111111111111111111111',
      '0111111111111111111110',
      '0136696633333336696310',
      '0136666636696636666310',
      '0136888636666636886310',
      '0126666626888626666210',
      '0136888636666636886310',
      '0137777737777736666310',
      '0122222222222227777210',
      '0133333333333333333310',
      '0111111111111111111110',
      '0001200000000000021000',
      '0001200000000000021000',
      '0001200000000000021000',
      '0001200000000000021000',
      '0011100000000000011100',
    ],
  },
};

const LOCATION_TEXTURE_KEYS: Record<string, string> = {
  'hire-me': 'questBoard',
};

const BUILDING_SPRITES: Record<string, ParsedGrid> = Object.fromEntries(
  Object.entries(B_DEFS).map(([key, def]) => [key, parseGrid(`building-${key}`, def.grid, def.palette)]),
);

export function generateAllTextures(scene: Phaser.Scene) {
  generateTexture(scene, 'odyssey-hero', HERO, PALETTE_CYBER, 2);

  generateNoiseTexture(scene);
  generateBuildingTextures(scene);
}

export function getBuildingTextureKey(locationId: string, fallbackKind: string) {
  return `building-${LOCATION_TEXTURE_KEYS[locationId] ?? fallbackKind}`;
}

function generateNoiseTexture(scene: Phaser.Scene) {
  const size = 128;
  const g = scene.add.graphics();
  for (let i = 0; i < 600; i++) {
    const x = Phaser.Math.Between(0, size - 1);
    const y = Phaser.Math.Between(0, size - 1);
    const alpha = Phaser.Math.FloatBetween(0.02, 0.08);
    g.fillStyle(i % 5 === 0 ? 0xf1d59a : 0x8fbd68, alpha);
    g.fillCircle(x, y, Phaser.Math.Between(1, 2));
  }
  g.generateTexture('odyssey-noise', size, size);
  g.destroy();
}

function generateBuildingTextures(scene: Phaser.Scene) {
  for (const [key, data] of Object.entries(BUILDING_SPRITES)) {
    const def = B_DEFS[key];
    generateTexture(scene, `building-${key}`, data, def.palette, 6);
  }
}

export type { SpriteData, Palette };
