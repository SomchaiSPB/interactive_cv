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

const PALETTE_BUILDINGS_CORE: Palette = [
  0x00000000,
  0x2a3a4a,
  0x3d5068,
  0x5a7a9a,
  0x1a2530,
  0xc9d6ea,
  0x8da3c2,
  0x69a7ff,
  0x7cf7d4,
  0xf6b74c,
  0xd4882a,
  0xff6b6b,
  0x3d1a1a,
  0x1a1110,
  0x3a2a1a,
  0x5a4a3a,
];

const PALETTE_WOOD: Palette = [
  0x00000000,
  0x1a1110,
  0x3a2a1a,
  0x5a4a3a,
  0x8a7a5a,
  0xb8a179,
  0xf6b74c,
  0xd4882a,
  0x2a3a4a,
  0x4a6582,
  0x69a7ff,
];

const PALETTE_MARKET: Palette = [
  0x00000000,
  0x2a1a0a,
  0x4a3a1a,
  0x5a4a2a,
  0x8a6a3a,
  0xb8904a,
  0xe8b86c,
  0xf6b74c,
  0xaed0ff,
  0x69a7ff,
  0x2a3a4a,
];

const PALETTE_FORGE: Palette = [
  0x00000000,
  0x1a0a05,
  0x3a1a10,
  0x523225,
  0x7a4a30,
  0xa06a40,
  0xd7a06f,
  0xf6b74c,
  0xff6b3a,
  0xff4500,
  0x2a1a10,
];

const PALETTE_LAB: Palette = [
  0x00000000,
  0x0a1a2a,
  0x1a2a3a,
  0x2f5361,
  0x4a7a8a,
  0x7aaaba,
  0xa7e6ff,
  0x9fdfff,
  0x7cf7d4,
  0x45c9a8,
];

const PALETTE_ACADEMY: Palette = [
  0x00000000,
  0x1a2a3a,
  0x3a4a5a,
  0x47555e,
  0x5a6a7a,
  0x8a9aaa,
  0xd1dee8,
  0xc9d6ea,
  0x7cf7d4,
  0x69a7ff,
];

const PALETTE_GATE: Palette = [
  0x00000000,
  0x1a100a,
  0x3a2a1a,
  0x5a3a2a,
  0x655042,
  0x8a6a4a,
  0xd7c1aa,
  0xf6b74c,
  0x7cf7d4,
  0x2a3a4a,
];

const PALETTE_TEMPLE: Palette = [
  0x00000000,
  0x1a101a,
  0x3a2a3a,
  0x57484b,
  0x6a5a5a,
  0x8a7a7a,
  0xd9b2b6,
  0xffc9c9,
  0xc9d6ea,
  0x7cf7d4,
];

const PALETTE_ARCHIVE: Palette = [
  0x00000000,
  0x1a102a,
  0x3a204a,
  0x4c3f5c,
  0x6a4a7a,
  0x8a6a9a,
  0xc3a6df,
  0xb07cff,
  0xd9e2f0,
  0x7cf7d4,
];

const PALETTE_PIT: Palette = [
  0x00000000,
  0x0d0a12,
  0x1c1420,
  0x2d2333,
  0x3a2a4a,
  0x4a3a5a,
  0x885e9b,
  0xb06eff,
  0xff6b6b,
  0xff4500,
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
      throw new Error(`Sprite "${name}" row ${rowIndex} has width ${row.length}; expected ${width}.`);
    }

    for (const pixel of row) {
      const colorIndex = parseInt(pixel, 36);
      if (!Number.isInteger(colorIndex) || colorIndex < 0 || colorIndex >= palette.length) {
        throw new Error(
          `Sprite "${name}" references palette index "${pixel}", but the palette has ${palette.length} colors.`,
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

type BuildingDef = {
  grid: string[];
  palette: Palette;
};

const B_DEFS: Record<string, BuildingDef> = {
  library: {
    palette: PALETTE_BUILDINGS_CORE,
    grid: [
      '07777777777770',
      '77888888888877',
      '77111111111177',
      '77111111111177',
      '77111a11a11177',
      '77111111111177',
      '77111a11a11177',
      '77111111111177',
      '77111a11a11177',
      '77111111111177',
      '77111111111177',
      '77999999999977',
      '07777777777770',
    ],
  },
  forge: {
    palette: PALETTE_FORGE,
    grid: [
      '0555555550',
      '5555555555',
      '5111111115',
      '5111111115',
      '5111a1a115',
      '5111111115',
      '5111111115',
      '5111a1a115',
      '5111111115',
      '5111111115',
      '5333333335',
      '0555555550',
    ],
  },
  tower: {
    palette: PALETTE_BUILDINGS_CORE,
    grid: [
      '0033333300',
      '0333333330',
      '3322222233',
      '3322222233',
      '0332222330',
      '0032223300',
      '0032223300',
      '0032223300',
      '0032223300',
      '0032223300',
      '0032223300',
      '0032223300',
      '0011111100',
      '0011111100',
    ],
  },
  market: {
    palette: PALETTE_MARKET,
    grid: [
      '00066666000',
      '00666666600',
      '06666666660',
      '06111111160',
      '0611a1a1160',
      '06111111160',
      '01111111110',
      '01111111110',
      '01111111110',
      '01111111110',
      '01333333310',
      '00111111100',
    ],
  },
  pit: {
    palette: PALETTE_PIT,
    grid: [
      '00044444000',
      '00444444400',
      '04444444440',
      '04444444440',
      '44222222244',
      '44222222244',
      '04422222440',
      '00442224400',
      '00044224000',
      '00004440000',
    ],
  },
  hall: {
    palette: PALETTE_BUILDINGS_CORE,
    grid: [
      '0888888880',
      '8888888888',
      '8111111118',
      '8111111118',
      '811a111a118',
      '8111111118',
      '811a111a118',
      '8111111118',
      '8111111118',
      '8111111118',
      '8999999998',
      '0888888880',
    ],
  },
  gate: {
    palette: PALETTE_GATE,
    grid: [
      '06666666660',
      '66666666666',
      '66111111166',
      '66111111166',
      '66111111166',
      '66111111166',
      '66111111166',
      '66111111166',
      '66222222266',
      '06666666660',
    ],
  },
  lab: {
    palette: PALETTE_LAB,
    grid: [
      '0666666660',
      '6666666666',
      '6611111166',
      '6611111166',
      '6611818166',
      '6611111166',
      '6611111166',
      '6611111166',
      '6611111166',
      '6666666666',
      '0666666660',
    ],
  },
  archive: {
    palette: PALETTE_ARCHIVE,
    grid: [
      '06666666660',
      '66666666666',
      '66111111166',
      '66111111166',
      '66111111166',
      '66111111166',
      '66111111166',
      '66111111166',
      '66111111166',
      '66666666666',
      '06666666660',
    ],
  },
  temple: {
    palette: PALETTE_TEMPLE,
    grid: [
      '0066666600',
      '0666666660',
      '0666666660',
      '6611111166',
      '6611818166',
      '6611111166',
      '6611818166',
      '6611111166',
      '6611111166',
      '6611111166',
      '6666666666',
      '0666666660',
    ],
  },
  workshop: {
    palette: PALETTE_WOOD,
    grid: [
      '0555555550',
      '5555555555',
      '5111111115',
      '5111111115',
      '5111111115',
      '5111111115',
      '5111111115',
      '5111111115',
      '5111111115',
      '5333333335',
      '0555555550',
    ],
  },
  office: {
    palette: PALETTE_BUILDINGS_CORE,
    grid: [
      '0666666660',
      '6666666666',
      '6611111166',
      '661a1a1a66',
      '6611111166',
      '661a1a1a66',
      '6611111166',
      '661a1a1a66',
      '6611111166',
      '6666666666',
      '0666666660',
    ],
  },
  academy: {
    palette: PALETTE_ACADEMY,
    grid: [
      '0888888880',
      '8888888888',
      '8811111188',
      '8811111188',
      '8811818188',
      '8811111188',
      '8811111188',
      '8811111188',
      '8811111188',
      '8888888888',
      '0888888880',
    ],
  },
};

const BUILDING_SPRITES: Record<string, ParsedGrid> = Object.fromEntries(
  Object.entries(B_DEFS).map(([key, def]) => [key, parseGrid(`building-${key}`, def.grid, def.palette)]),
);

export function generateAllTextures(scene: Phaser.Scene) {
  generateTexture(scene, 'odyssey-hero', HERO, PALETTE_CYBER, 2);

  generateNoiseTexture(scene);
  generateBuildingTextures(scene);
}

function generateNoiseTexture(scene: Phaser.Scene) {
  const size = 128;
  const g = scene.add.graphics();
  for (let i = 0; i < 600; i++) {
    const x = Phaser.Math.Between(0, size - 1);
    const y = Phaser.Math.Between(0, size - 1);
    const alpha = Phaser.Math.FloatBetween(0.02, 0.08);
    g.fillStyle(i % 5 === 0 ? 0x9ab0c7 : 0x7cf7d4, alpha);
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
