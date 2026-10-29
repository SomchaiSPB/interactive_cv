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
  0x3a281f,
  0xd8c28f,
  0xb18e5e,
  0x6d3428,
  0xa94b36,
  0xd56a45,
  0x69a7a2,
  0xb8dfcf,
  0xe7b64f,
  0x795035,
  0x8d8b78,
  0x56574d,
  0xb83f35,
  0xf1e3bd,
  0x315a3a,
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
  0x27363a,
  0x49656a,
  0x75949a,
  0xb8cfca,
  0xe4e1c5,
  0x79c9c4,
  0xbaf3df,
  0xe7b64f,
  0x8c583d,
];

const PALETTE_ACADEMY: Palette = [
  0x00000000,
  0x382a22,
  0x6e3d30,
  0x9d5841,
  0xc77a51,
  0xe3c899,
  0xf0dfbd,
  0x77918b,
  0xbad0bc,
  0xe2b84f,
];

const PALETTE_GATE: Palette = [
  0x00000000,
  0x352820,
  0x65513e,
  0x8d7657,
  0xb69c72,
  0xd8c493,
  0xeee0ba,
  0xe4aa43,
  0x6ca993,
  0x43555a,
];

const PALETTE_TEMPLE: Palette = [
  0x00000000,
  0x34322d,
  0x69675d,
  0x96917f,
  0xc7bea2,
  0xeadcb8,
  0xf5ebce,
  0xb94d3f,
  0xe1a44a,
  0x668f75,
];

const PALETTE_ARCHIVE: Palette = [
  0x00000000,
  0x33261f,
  0x604332,
  0x886044,
  0xad8058,
  0xd2ad78,
  0xe8d2a7,
  0x6f876a,
  0x9fb28c,
  0xe4b84e,
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

type BuildingDef = {
  grid: string[];
  palette: Palette;
};

const B_DEFS: Record<string, BuildingDef> = {
  library: {
    palette: PALETTE_BUILDINGS_CORE,
    grid: [
      '000055550000',
      '000566650000',
      '005666665000',
      '056666666500',
      '511111111115',
      '512277772215',
      '512277772215',
      '5122eeee2215',
      '512222222215',
      '51279e972215',
      '5127aaa72215',
      '5117aaa71115',
      '5117aaa71115',
      '000aaaa00000',
    ],
  },
  forge: {
    palette: PALETTE_FORGE,
    grid: [
      '000000440000',
      '000000440000',
      '000005554000',
      '000566665000',
      '005666666500',
      '056666666650',
      '511111111115',
      '513377773315',
      '513388883315',
      '513338333315',
      '513333333315',
      '5133aa333315',
      '511aaaa11115',
      '000aaaa00000',
    ],
  },
  dataTower: {
    palette: PALETTE_BUILDINGS_CORE,
    grid: [
      '000009900000',
      '000099990000',
      '000bbccbb000',
      '000b2222b000',
      '000b7887b000',
      '000b2222b000',
      '000b7887b000',
      '000b2222b000',
      '000b7887b000',
      '000b2222b000',
      '000b7887b000',
      '000b2222b000',
      '00bbb99bbb00',
      '00bbbbbbbb00',
    ],
  },
  market: {
    palette: PALETTE_MARKET,
    grid: [
      '000677776000',
      '006766667600',
      '067677776760',
      '677666666776',
      '611111111116',
      '612222222216',
      '612888899216',
      '612888899216',
      '612222222216',
      '612444444216',
      '612444444216',
      '611111111116',
      '011100001110',
      '011100001110',
    ],
  },
  pit: {
    palette: PALETTE_PIT,
    grid: [
      '000044440000',
      '004466664400',
      '046688886640',
      '468822228864',
      '468211112864',
      '468219912864',
      '468211112864',
      '468822228864',
      '046688886640',
      '004466664400',
      '000044440000',
    ],
  },
  hall: {
    palette: PALETTE_BUILDINGS_CORE,
    grid: [
      '00000dd00000',
      '00000dd00000',
      '000055550000',
      '000566650000',
      '005666665000',
      '056666666500',
      '511111111115',
      '512b2bb2b215',
      '512b2ee2b215',
      '512b2ee2b215',
      '512b2aa2b215',
      '512b2aa2b215',
      '511bbaabb115',
      '00bbb99bbb00',
    ],
  },
  productGate: {
    palette: PALETTE_GATE,
    grid: [
      '000077770000',
      '000777777000',
      '001111111100',
      '011555555110',
      '115666665511',
      '152222222251',
      '152200022251',
      '152009002251',
      '152009002251',
      '152009002251',
      '152009002251',
      '112009002211',
      '011009001110',
      '011111111110',
    ],
  },
  aiLab: {
    palette: PALETTE_LAB,
    grid: [
      '000000600000',
      '000006760000',
      '000000600000',
      '000055550000',
      '000544450000',
      '005444445000',
      '054444444500',
      '511111111115',
      '512266662215',
      '512267762215',
      '512266662215',
      '512299992215',
      '511199991115',
      '000999900000',
    ],
  },
  signalTower: {
    palette: PALETTE_LAB,
    grid: [
      '000006600000',
      '000067760000',
      '000706607000',
      '000006600000',
      '000006600000',
      '000055550000',
      '000544450000',
      '000544450000',
      '000522250000',
      '000522250000',
      '000522250000',
      '000522250000',
      '000599950000',
      '000999990000',
    ],
  },
  archive: {
    palette: PALETTE_ARCHIVE,
    grid: [
      '000055550000',
      '000566650000',
      '005666665000',
      '056666666500',
      '511111111115',
      '512777777215',
      '512733337215',
      '512733337215',
      '512799997215',
      '512733337215',
      '512733337215',
      '512777777215',
      '511111111115',
      '000111100000',
    ],
  },
  temple: {
    palette: PALETTE_TEMPLE,
    grid: [
      '000007700000',
      '000077770000',
      '000744447000',
      '007444444700',
      '074444444470',
      '744444444447',
      '111111111111',
      '105050050501',
      '105050050501',
      '105050050501',
      '105050050501',
      '105050050501',
      '115151151511',
      '111111111111',
    ],
  },
  reportLab: {
    palette: PALETTE_LAB,
    grid: [
      '000055550000',
      '000544450000',
      '005444445000',
      '054444444500',
      '511111111115',
      '512555555215',
      '512566665215',
      '512565565215',
      '512566665215',
      '512555555215',
      '512299992215',
      '512299992215',
      '511199991115',
      '000999900000',
    ],
  },
  workshop: {
    palette: PALETTE_WOOD,
    grid: [
      '000055550000',
      '000566650000',
      '005666665000',
      '056666666500',
      '511111111115',
      '512444444215',
      '512400004215',
      '512408804215',
      '512400004215',
      '512444444215',
      '5123aa3aa315',
      '512333333315',
      '511133331115',
      '000333300000',
    ],
  },
  office: {
    palette: PALETTE_BUILDINGS_CORE,
    grid: [
      '000055550000',
      '000566650000',
      '005666665000',
      '056666666500',
      '511111111115',
      '512eeeeee215',
      '512edddde215',
      '512ed99de215',
      '512edddde215',
      '512eeeeee215',
      '5122aaa22215',
      '5122aaa22215',
      '5111aaa11115',
      '0000aaa00000',
    ],
  },
  academy: {
    palette: PALETTE_ACADEMY,
    grid: [
      '000022220000',
      '000233320000',
      '002344432000',
      '023444443200',
      '211111111112',
      '215555555512',
      '215677776512',
      '215677776512',
      '215555555512',
      '215599995512',
      '215599995512',
      '211199991112',
      '211199991112',
      '000999900000',
    ],
  },
  contactGate: {
    palette: PALETTE_GATE,
    grid: [
      '000008800000',
      '000088880000',
      '000855558000',
      '008511115800',
      '085111111580',
      '851122221158',
      '851200002158',
      '851200002158',
      '851200002158',
      '851200002158',
      '851200002158',
      '851200002158',
      '811200002118',
      '111111111111',
    ],
  },
};

const LOCATION_TEXTURE_KEYS: Record<string, string> = {
  'hire-me': 'contactGate',
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
