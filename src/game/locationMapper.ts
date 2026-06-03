import type { Checkpoint } from '../content/types';
import type { GameLocation, LocationKind } from './types';

const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 2200;

function resolveKind(checkpoint: Checkpoint): LocationKind {
  if (checkpoint.id === 'spawn-point') {
    return 'spawn';
  }

  if (checkpoint.id === 'contact-portal') {
    return 'dock';
  }

  if (checkpoint.id === 'product-launch-gate') {
    return 'gate';
  }

  if (checkpoint.branchOf) {
    return 'branch';
  }

  return 'main';
}

export function mapCheckpointsToGameLocations(checkpoints: Checkpoint[]): GameLocation[] {
  return checkpoints.map((checkpoint) => {
    const kind = resolveKind(checkpoint);
    const x = 220 + (checkpoint.position.x / 100) * (WORLD_WIDTH - 440);
    const y = 170 + (checkpoint.position.y / 100) * (WORLD_HEIGHT - 340);
    const branch = Boolean(checkpoint.branchOf);
    const radius =
      kind === 'spawn'
        ? 96
        : kind === 'dock'
          ? 72
          : kind === 'gate'
            ? 78
            : branch
              ? 58
              : 78;

    const labelOffsetY = branch ? radius + 48 : radius + 60;

    return {
      ...checkpoint,
      kind,
      worldX: Math.round(x),
      worldY: Math.round(y),
      radius,
      promptRadius: checkpoint.interactionRadius ?? Math.round(radius + (branch ? 92 : 124)),
      labelOffsetX: checkpoint.side === 'left' ? -8 : checkpoint.side === 'right' ? 8 : 0,
      labelOffsetY,
      glowColor:
        kind === 'spawn'
          ? 0x7cf7d4
          : kind === 'dock'
            ? 0x69a7ff
            : kind === 'gate'
              ? 0xf6b74c
              : branch
                ? 0x8ea1c7
                : 0x69a7ff,
      coreColor:
        kind === 'spawn'
          ? 0x0d1423
          : kind === 'dock'
            ? 0x14243d
            : kind === 'gate'
              ? 0x2c1d09
              : branch
                ? 0x111827
                : 0x0c1d33,
      ringColor:
        kind === 'spawn'
          ? 0x7cf7d4
          : kind === 'dock'
            ? 0x69a7ff
            : kind === 'gate'
              ? 0xf6b74c
              : branch
                ? 0x93a2cb
                : 0x7cf7d4,
      displayScale: branch ? 0.76 : kind === 'spawn' ? 1.15 : kind === 'gate' ? 1.04 : 1,
    };
  });
}

export const GAME_WORLD = {
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
} as const;
