import Phaser from 'phaser';

export const ADVENTURER_ASSET_BASE = '/game/assets/characters/adventurer';
// Each strip is 768x80: eight 96px frames, character centred around x≈46, feet at y≈57.
export const ADVENTURER_FRAME_WIDTH = 96;
export const ADVENTURER_FRAME_HEIGHT = 80;
export const ADVENTURER_FEET_ORIGIN_Y = 58 / ADVENTURER_FRAME_HEIGHT;

export type AdventurerFacing = 'down' | 'left' | 'right' | 'up';
export type AdventurerMotion = 'idle' | 'run';

const FACINGS: AdventurerFacing[] = ['down', 'left', 'right', 'up'];
const MOTIONS: AdventurerMotion[] = ['idle', 'run'];
const FRAME_RATE: Record<AdventurerMotion, number> = { idle: 6, run: 12 };

export function adventurerKey(motion: AdventurerMotion, facing: AdventurerFacing) {
  return `adventurer-${motion}-${facing}`;
}

export function preloadAdventurerSprites(scene: Phaser.Scene) {
  for (const motion of MOTIONS) {
    for (const facing of FACINGS) {
      scene.load.spritesheet(adventurerKey(motion, facing), `${ADVENTURER_ASSET_BASE}/${motion}_${facing}.png`, {
        frameWidth: ADVENTURER_FRAME_WIDTH,
        frameHeight: ADVENTURER_FRAME_HEIGHT,
      });
    }
  }
}

/** Creates one looping animation per strip (same key as the texture). Returns false if any strip failed to load. */
export function createAdventurerAnimations(scene: Phaser.Scene) {
  for (const motion of MOTIONS) {
    for (const facing of FACINGS) {
      const key = adventurerKey(motion, facing);
      if (!scene.textures.exists(key)) {
        return false;
      }
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(key, {}),
          frameRate: FRAME_RATE[motion],
          repeat: -1,
        });
      }
    }
  }
  return true;
}
