import type { Checkpoint } from '../content/types';
import type { GameLocation, LocationKind } from './types';

export const GAME_WORLD = {
  width: 2400,
  height: 1600,
} as const;

type Layout = {
  displayName: string;
  kind: LocationKind;
  worldX: number;
  worldY: number;
  footprintWidth: number;
  footprintHeight: number;
  interactionRadius: number;
  displayScale: number;
  labelOffsetX: number;
  labelOffsetY: number;
  baseColor: number;
  roofColor: number;
  accentColor: number;
};

const LAYOUTS: Record<string, Layout> = {
  'spawn-point': {
    displayName: 'Town Square',
    kind: 'town_square',
    worldX: 1200,
    worldY: 800,
    footprintWidth: 210,
    footprintHeight: 210,
    interactionRadius: 138,
    displayScale: 1.06,
    labelOffsetX: 0,
    labelOffsetY: 170,
    baseColor: 0x567f43,
    roofColor: 0xd9c797,
    accentColor: 0xf0c75e,
  },
  'finance-automation': {
    displayName: 'Counting House',
    kind: 'hall',
    worldX: 860,
    worldY: 640,
    footprintWidth: 180,
    footprintHeight: 140,
    interactionRadius: 116,
    displayScale: 0.94,
    labelOffsetX: 0,
    labelOffsetY: 114,
    baseColor: 0xb18e5e,
    roofColor: 0xa94b36,
    accentColor: 0xe7b64f,
  },
  'tldw': {
    displayName: 'Video Lab',
    kind: 'library',
    worldX: 1540,
    worldY: 640,
    footprintWidth: 130,
    footprintHeight: 110,
    interactionRadius: 96,
    displayScale: 0.9,
    labelOffsetX: 0,
    labelOffsetY: 102,
    baseColor: 0x2f5361,
    roofColor: 0xa7e6ff,
    accentColor: 0x7cf7d4,
  },
  'zapros': {
    displayName: 'Marketplace',
    kind: 'market',
    worldX: 1650,
    worldY: 900,
    footprintWidth: 170,
    footprintHeight: 120,
    interactionRadius: 110,
    displayScale: 0.92,
    labelOffsetX: 0,
    labelOffsetY: 112,
    baseColor: 0x8a673c,
    roofColor: 0xe4a84b,
    accentColor: 0xefc05d,
  },
  'how-i-work': {
    displayName: 'Workshop',
    kind: 'workshop',
    worldX: 750,
    worldY: 900,
    footprintWidth: 120,
    footprintHeight: 110,
    interactionRadius: 96,
    displayScale: 0.86,
    labelOffsetX: 0,
    labelOffsetY: 90,
    baseColor: 0x5c4c3a,
    roofColor: 0xd0b79b,
    accentColor: 0xf6b74c,
  },
  'hire-me': {
    displayName: 'Hire Me',
    kind: 'gate',
    worldX: 1200,
    worldY: 1200,
    footprintWidth: 150,
    footprintHeight: 150,
    interactionRadius: 108,
    displayScale: 0.92,
    labelOffsetX: 0,
    labelOffsetY: 112,
    baseColor: 0x61524a,
    roofColor: 0xd8cabf,
    accentColor: 0xf6b74c,
  },
};

function getFallbackLayout(checkpoint: Checkpoint): Layout {
  const isBranch = Boolean(checkpoint.branchOf);
  const centerX = 1200 + (checkpoint.position.x - 50) * 9;
  const centerY = 800 + (checkpoint.position.y - 50) * 7;

  return {
    displayName: checkpoint.subtitle || checkpoint.title,
    kind: isBranch ? 'npc' : 'hall',
    worldX: Math.round(centerX),
    worldY: Math.round(centerY),
    footprintWidth: isBranch ? 96 : 150,
    footprintHeight: isBranch ? 80 : 118,
    interactionRadius: isBranch ? 88 : 104,
    displayScale: isBranch ? 0.82 : 0.92,
    labelOffsetX: 0,
    labelOffsetY: isBranch ? 80 : 96,
    baseColor: isBranch ? 0x786547 : 0x8b7655,
    roofColor: isBranch ? 0xc6aa76 : 0xd5bd8d,
    accentColor: isBranch ? 0xe0bd72 : 0x7eaa75,
  };
}

export function mapCheckpointsToGameLocations(checkpoints: Checkpoint[]): GameLocation[] {
  return checkpoints.map((checkpoint) => {
    const layout = LAYOUTS[checkpoint.id] ?? getFallbackLayout(checkpoint);

    return {
      ...checkpoint,
      displayName: layout.displayName,
      kind: layout.kind,
      worldX: layout.worldX,
      worldY: layout.worldY,
      footprintWidth: layout.footprintWidth,
      footprintHeight: layout.footprintHeight,
      interactionRadius: checkpoint.interactionRadius ?? layout.interactionRadius,
      displayScale: layout.displayScale,
      labelOffsetX: layout.labelOffsetX,
      labelOffsetY: layout.labelOffsetY,
      baseColor: layout.baseColor,
      roofColor: layout.roofColor,
      accentColor: layout.accentColor,
      links: checkpoint.links,
    };
  });
}
