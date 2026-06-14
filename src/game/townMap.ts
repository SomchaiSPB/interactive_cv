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

type SignPost = MapPoint & {
  label: string;
};

export const TOWN_DISTRICTS: District[] = [
  { x: 128, y: 224, width: 640, height: 704, baseColor: 0x4f8a49, alternateColor: 0x5a9852, borderColor: 0x3e743d },
  { x: 704, y: 192, width: 448, height: 448, baseColor: 0x738b45, alternateColor: 0x81984e, borderColor: 0x64783e },
  { x: 1056, y: 64, width: 672, height: 448, baseColor: 0x5f8b59, alternateColor: 0x6a9862, borderColor: 0x507b4d },
  { x: 768, y: 544, width: 864, height: 544, baseColor: 0x65a052, alternateColor: 0x70aa5b, borderColor: 0x548d48 },
  { x: 1536, y: 512, width: 736, height: 480, baseColor: 0x8b994d, alternateColor: 0x98a556, borderColor: 0x788744 },
  { x: 640, y: 1024, width: 640, height: 448, baseColor: 0x597455, alternateColor: 0x647f5e, borderColor: 0x4b6749 },
  { x: 96, y: 1088, width: 672, height: 416, baseColor: 0x579052, alternateColor: 0x639c5b, borderColor: 0x487d47 },
  { x: 1632, y: 960, width: 672, height: 544, baseColor: 0x708650, alternateColor: 0x7b9258, borderColor: 0x607647 },
];

export const TOWN_PATHS: PathRoute[] = [
  { from: 'spawn-point', to: 'legacy-forest', via: [{ x: 910, y: 780 }, { x: 760, y: 690 }] },
  { from: 'spawn-point', to: 'backend-forge', via: [{ x: 1060, y: 720 }, { x: 960, y: 560 }] },
  { from: 'spawn-point', to: 'data-citadel', via: [{ x: 1200, y: 560 }] },
  { from: 'spawn-point', to: 'integration-swamp', via: [{ x: 1450, y: 810 }] },
  { from: 'spawn-point', to: 'production-black-hole', via: [{ x: 1100, y: 1010 }, { x: 990, y: 1100 }] },
  { from: 'spawn-point', to: 'leadership-tower', via: [{ x: 1390, y: 690 }, { x: 1480, y: 540 }] },
  { from: 'integration-swamp', to: 'product-launch-gate', via: [{ x: 1810, y: 850 }, { x: 1890, y: 950 }] },
  { from: 'product-launch-gate', to: 'contact-portal', via: [{ x: 2100, y: 1120 }] },
  { from: 'backend-forge', to: 'ai-workshop', via: [{ x: 930, y: 340 }], width: 22 },
  { from: 'backend-forge', to: 'webrtc-signal-tower', via: [{ x: 600, y: 450 }], width: 22 },
  { from: 'data-citadel', to: 'video-observatory', via: [{ x: 1160, y: 400 }], width: 22 },
  { from: 'data-citadel', to: 'report-lab', via: [{ x: 1320, y: 350 }], width: 22 },
  { from: 'leadership-tower', to: 'policy-temple', via: [{ x: 1690, y: 410 }], width: 22 },
  { from: 'integration-swamp', to: 'xml-foundry', via: [{ x: 1740, y: 850 }], width: 22 },
  { from: 'integration-swamp', to: 'calendar-gate', via: [{ x: 1900, y: 780 }], width: 22 },
  { from: 'spawn-point', to: 'education-trail', via: [{ x: 880, y: 1030 }, { x: 680, y: 1160 }], width: 22 },
];

export const TREE_POSITIONS: MapPoint[] = [
  { x: 190, y: 280 }, { x: 290, y: 330 }, { x: 410, y: 260 }, { x: 560, y: 310 }, { x: 680, y: 250 },
  { x: 210, y: 520 }, { x: 330, y: 610 }, { x: 430, y: 730 }, { x: 640, y: 760 }, { x: 230, y: 920 },
  { x: 240, y: 1180 }, { x: 320, y: 1290 }, { x: 440, y: 1140 }, { x: 610, y: 1450 }, { x: 210, y: 1430 },
  { x: 960, y: 710 }, { x: 760, y: 710 }, { x: 1380, y: 710 }, { x: 1510, y: 170 }, { x: 1730, y: 190 },
  { x: 1880, y: 280 }, { x: 2030, y: 240 }, { x: 2230, y: 210 }, { x: 2140, y: 340 }, { x: 2260, y: 520 },
];

export const BUSH_POSITIONS: MapPoint[] = [
  { x: 760, y: 690 }, { x: 840, y: 960 }, { x: 980, y: 720 }, { x: 1370, y: 720 }, { x: 1490, y: 920 },
  { x: 1740, y: 900 }, { x: 1850, y: 630 }, { x: 2010, y: 610 }, { x: 730, y: 1180 }, { x: 1110, y: 1350 },
  { x: 1420, y: 1240 }, { x: 1560, y: 1370 }, { x: 1900, y: 1420 }, { x: 2050, y: 1230 },
];

export const ROCK_POSITIONS: MapPoint[] = [
  { x: 740, y: 350 }, { x: 1320, y: 150 }, { x: 1880, y: 690 }, { x: 1020, y: 1140 },
  { x: 1320, y: 1320 }, { x: 2140, y: 1080 }, { x: 380, y: 980 }, { x: 2260, y: 1450 },
];

export const FLOWER_POSITIONS: MapPoint[] = [
  { x: 720, y: 760 }, { x: 760, y: 790 }, { x: 1510, y: 740 }, { x: 1550, y: 780 },
  { x: 430, y: 1180 }, { x: 470, y: 1150 }, { x: 1870, y: 1160 }, { x: 1910, y: 1190 },
];

export const SIGN_POSTS: SignPost[] = [
  { x: 900, y: 800, label: 'Library / Forge' },
  { x: 1500, y: 780, label: 'Market / Hall' },
  { x: 1080, y: 1040, label: 'Academy / Bug Pit' },
  { x: 1910, y: 930, label: 'Town Gates' },
];

export const FENCES: Fence[] = [
  { x: 700, y: 660, length: 220, orientation: 'vertical' },
  { x: 1540, y: 610, length: 230, orientation: 'vertical' },
  { x: 1600, y: 1010, length: 300, orientation: 'horizontal' },
  { x: 180, y: 1080, length: 320, orientation: 'horizontal' },
  { x: 1800, y: 1480, length: 280, orientation: 'horizontal' },
];

export const NPC_MARKERS: NpcMarker[] = [
  { id: 'reference-keeper', name: 'Reference Keeper', role: 'Future Reference Tavern', x: 1480, y: 930 },
];
