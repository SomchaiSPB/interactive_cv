import Phaser from 'phaser';

export const ADVENTURER_ASSET_BASE = '/game/assets/characters/adventurer';
export const ADVENTURER_FRAME_WIDTH = 64;
export const ADVENTURER_FRAME_HEIGHT = 80;
export const ADVENTURER_FRAME_COUNT = 12;
// The source strips include blank separator columns at 1, 4, 7, and 10.
// Use only the visible frames so the animation does not blink through empty cells.
export const ADVENTURER_VISIBLE_FRAMES = [0, 2, 3, 5, 6, 8, 9, 11] as const;
// Frame 3 is one of the most centered, readable poses in the source pack.
export const ADVENTURER_STABLE_FRAME_INDEX = 3;

export type AdventurerFacing = 'down' | 'left' | 'right' | 'up';
export type AdventurerTextureKey = 'adventurer-idle-down' | 'adventurer-idle-left' | 'adventurer-idle-right' | 'adventurer-idle-up';

type AdventurerSheetDef = {
  key: string;
  file: string;
};

const ADVENTURER_SHEETS: AdventurerSheetDef[] = [
  { key: 'adventurer-idle-down', file: 'idle_down.png' },
  { key: 'adventurer-idle-left', file: 'idle_left.png' },
  { key: 'adventurer-idle-right', file: 'idle_right.png' },
  { key: 'adventurer-idle-up', file: 'idle_up.png' },
  { key: 'adventurer-run-down', file: 'run_down.png' },
  { key: 'adventurer-run-left', file: 'run_left.png' },
  { key: 'adventurer-run-right', file: 'run_right.png' },
  { key: 'adventurer-run-up', file: 'run_up.png' },
];

export const ADVENTURER_IDLE_DEFAULT_KEY: AdventurerTextureKey = 'adventurer-idle-down';

export const ADVENTURER_TEXTURE_BY_FACING: Record<AdventurerFacing, AdventurerTextureKey> = {
  down: 'adventurer-idle-down',
  left: 'adventurer-idle-left',
  right: 'adventurer-idle-right',
  up: 'adventurer-idle-up',
};

export function preloadAdventurerSprites(scene: Phaser.Scene) {
  for (const sheet of ADVENTURER_SHEETS) {
    scene.load.spritesheet(sheet.key, `${ADVENTURER_ASSET_BASE}/${sheet.file}`, {
      frameWidth: ADVENTURER_FRAME_WIDTH,
      frameHeight: ADVENTURER_FRAME_HEIGHT,
    });
  }
}

export function hasAdventurerSprites(scene: Phaser.Scene) {
  return ADVENTURER_SHEETS.every((sheet) => scene.textures.exists(sheet.key));
}
