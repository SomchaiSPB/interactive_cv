import type { Checkpoint, LinkItem } from '../content/types';

export type LocationKind =
  | 'town_square'
  | 'library'
  | 'forge'
  | 'tower'
  | 'market'
  | 'pit'
  | 'hall'
  | 'gate'
  | 'lab'
  | 'archive'
  | 'temple'
  | 'workshop'
  | 'office'
  | 'academy'
  | 'npc';

export type GameLocation = Checkpoint & {
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
