import Phaser from 'phaser';

export const ADVENTURER_ASSET_BASE = '/game/assets/characters/adventurer';
export const ADVENTURER_FRAME_WIDTH = 64;
export const ADVENTURER_FRAME_HEIGHT = 80;
export const ADVENTURER_FRAME_COUNT = 12;

export type AdventurerFacing = 'down' | 'left' | 'right' | 'up';
export type AdventurerMotion = 'idle' | 'run';
export type AdventurerAnimationKey = `adventurer-${AdventurerMotion}-${AdventurerFacing}`;

type AdventurerSheetDef = {
  key: AdventurerAnimationKey;
  file: string;
  frameRate: number;
};

const ADVENTURER_SHEETS: AdventurerSheetDef[] = [
  { key: 'adventurer-idle-down', file: 'idle_down.png', frameRate: 6 },
  { key: 'adventurer-idle-left', file: 'idle_left.png', frameRate: 6 },
  { key: 'adventurer-idle-right', file: 'idle_right.png', frameRate: 6 },
  { key: 'adventurer-idle-up', file: 'idle_up.png', frameRate: 6 },
  { key: 'adventurer-run-down', file: 'run_down.png', frameRate: 10 },
  { key: 'adventurer-run-left', file: 'run_left.png', frameRate: 10 },
  { key: 'adventurer-run-right', file: 'run_right.png', frameRate: 10 },
  { key: 'adventurer-run-up', file: 'run_up.png', frameRate: 10 },
];

export const ADVENTURER_IDLE_DEFAULT_KEY: AdventurerAnimationKey = 'adventurer-idle-down';

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

export function registerAdventurerAnimations(scene: Phaser.Scene) {
  for (const sheet of ADVENTURER_SHEETS) {
    if (!scene.textures.exists(sheet.key) || scene.anims.exists(sheet.key)) {
      continue;
    }

    scene.anims.create({
      key: sheet.key,
      frames: scene.anims.generateFrameNumbers(sheet.key, {
        start: 0,
        end: ADVENTURER_FRAME_COUNT - 1,
      }),
      frameRate: sheet.frameRate,
      repeat: -1,
    });
  }
}

export function getAdventurerAnimationKey(motion: AdventurerMotion, facing: AdventurerFacing): AdventurerAnimationKey {
  return `adventurer-${motion}-${facing}` as AdventurerAnimationKey;
}
