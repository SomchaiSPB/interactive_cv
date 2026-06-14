export const TILE_SIZE = 32;

export const PLAYER_SPAWN = { x: 1200, y: 1030 } as const;

export type MapPoint = { x: number; y: number };

type District = {
  x: number;
  y: number;
  width: number;
  height: number;
  baseColor: number;
  alternateColor: number;
  borderColor: number;
};

type PathRoute = {
  from: string;
  to: string;
  via?: MapPoint[];
  width?: number;
};

type Fence = MapPoint & {
  length: number;
  orientation: 'horizontal' | 'vertical';
};

type NpcMarker = MapPoint & {
  id: string;
  name: string;
  role: string;
};

export const TOWN_DISTRICTS: District[] = [
  { x: 128, y: 224, width: 640, height: 704, baseColor: 0x24472b, alternateColor: 0x294f30, borderColor: 0x315d38 },
  { x: 704, y: 192, width: 448, height: 448, baseColor: 0x3d3f2c, alternateColor: 0x454431, borderColor: 0x5c5137 },
  { x: 1056, y: 64, width: 672, height: 448, baseColor: 0x33483b, alternateColor: 0x394f41, borderColor: 0x526052 },
  { x: 768, y: 544, width: 864, height: 544, baseColor: 0x355b35, alternateColor: 0x3b633b, borderColor: 0x54734b },
  { x: 1536, y: 512, width: 736, height: 480, baseColor: 0x4f5231, alternateColor: 0x585936, borderColor: 0x6d6940 },
  { x: 640, y: 1024, width: 640, height: 448, baseColor: 0x2f3830, alternateColor: 0x343d34, borderColor: 0x454b41 },
  { x: 96, y: 1088, width: 672, height: 416, baseColor: 0x2b4d34, alternateColor: 0x31563a, borderColor: 0x416747 },
  { x: 1632, y: 960, width: 672, height: 544, baseColor: 0x3f4935, alternateColor: 0x46503a, borderColor: 0x596048 },
];

export const TOWN_PATHS: PathRoute[] = [
  { from: 'spawn-point', to: 'legacy-forest', via: [{ x: 880, y: 800 }, { x: 880, y: 610 }] },
  { from: 'spawn-point', to: 'backend-forge', via: [{ x: 1040, y: 800 }, { x: 1040, y: 540 }, { x: 850, y: 540 }] },
  { from: 'spawn-point', to: 'data-citadel', via: [{ x: 1200, y: 560 }] },
  { from: 'spawn-point', to: 'integration-swamp', via: [{ x: 1460, y: 800 }, { x: 1460, y: 760 }] },
  { from: 'spawn-point', to: 'production-black-hole', via: [{ x: 1080, y: 980 }, { x: 900, y: 980 }] },
  { from: 'spawn-point', to: 'leadership-tower', via: [{ x: 1440, y: 640 }, { x: 1570, y: 640 }] },
  { from: 'integration-swamp', to: 'product-launch-gate', via: [{ x: 1840, y: 880 }, { x: 1950, y: 880 }] },
  { from: 'product-launch-gate', to: 'contact-portal', via: [{ x: 2100, y: 1120 }] },
  { from: 'backend-forge', to: 'ai-workshop', via: [{ x: 970, y: 430 }, { x: 970, y: 250 }], width: 28 },
  { from: 'backend-forge', to: 'webrtc-signal-tower', via: [{ x: 600, y: 430 }], width: 28 },
  { from: 'data-citadel', to: 'video-observatory', via: [{ x: 1220, y: 500 }, { x: 1080, y: 500 }], width: 28 },
  { from: 'data-citadel', to: 'report-lab', via: [{ x: 1410, y: 250 }], width: 28 },
  { from: 'leadership-tower', to: 'policy-temple', via: [{ x: 1780, y: 350 }], width: 28 },
  { from: 'integration-swamp', to: 'xml-foundry', via: [{ x: 1770, y: 860 }], width: 28 },
  { from: 'integration-swamp', to: 'calendar-gate', via: [{ x: 1960, y: 760 }], width: 28 },
  { from: 'spawn-point', to: 'education-trail', via: [{ x: 760, y: 1040 }, { x: 500, y: 1040 }], width: 28 },
];

export const TREE_POSITIONS: MapPoint[] = [
  { x: 190, y: 280 }, { x: 290, y: 330 }, { x: 410, y: 260 }, { x: 560, y: 310 }, { x: 680, y: 250 },
  { x: 180, y: 520 }, { x: 300, y: 590 }, { x: 450, y: 700 }, { x: 610, y: 820 }, { x: 210, y: 900 },
  { x: 180, y: 1160 }, { x: 300, y: 1240 }, { x: 410, y: 1140 }, { x: 620, y: 1460 }, { x: 210, y: 1430 },
  { x: 2230, y: 210 }, { x: 2140, y: 340 }, { x: 2260, y: 520 }, { x: 2190, y: 930 }, { x: 2290, y: 1120 },
  { x: 1510, y: 170 }, { x: 1730, y: 190 }, { x: 1880, y: 280 }, { x: 2030, y: 240 }, { x: 2320, y: 760 },
];

export const BUSH_POSITIONS: MapPoint[] = [
  { x: 760, y: 690 }, { x: 820, y: 930 }, { x: 960, y: 700 }, { x: 1370, y: 720 }, { x: 1490, y: 920 },
  { x: 1640, y: 890 }, { x: 1850, y: 630 }, { x: 2010, y: 610 }, { x: 730, y: 1180 }, { x: 1110, y: 1350 },
  { x: 1420, y: 1240 }, { x: 1560, y: 1370 }, { x: 1900, y: 1420 }, { x: 2050, y: 1230 },
];

export const FENCES: Fence[] = [
  { x: 720, y: 690, length: 240, orientation: 'vertical' },
  { x: 1510, y: 610, length: 250, orientation: 'vertical' },
  { x: 1560, y: 1010, length: 320, orientation: 'horizontal' },
  { x: 240, y: 1060, length: 420, orientation: 'horizontal' },
  { x: 1780, y: 1490, length: 360, orientation: 'horizontal' },
];

export const NPC_MARKERS: NpcMarker[] = [
  { id: 'reference-keeper', name: 'Reference Keeper', role: 'Future Reference Tavern', x: 1480, y: 930 },
];
