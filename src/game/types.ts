import type { Checkpoint, LinkItem } from '../content/types';

export type LocationKind = 'spawn' | 'main' | 'branch' | 'gate' | 'dock';

export type GameLocation = Checkpoint & {
  kind: LocationKind;
  worldX: number;
  worldY: number;
  radius: number;
  promptRadius: number;
  labelOffsetX: number;
  labelOffsetY: number;
  glowColor: number;
  coreColor: number;
  ringColor: number;
  displayScale: number;
  links?: LinkItem[];
};

export type OdysseyNearestEventDetail = {
  location: GameLocation | null;
  prompt: string | null;
  interactable: boolean;
};

export type OdysseyOpenEventDetail = {
  checkpointId: string;
};

export const ODYSSEY_EVENT_READY = 'odyssey:ready';
export const ODYSSEY_EVENT_NEAREST = 'odyssey:nearest';
export const ODYSSEY_EVENT_OPEN = 'odyssey:open';
export const ODYSSEY_EVENT_CLOSE = 'odyssey:close';
