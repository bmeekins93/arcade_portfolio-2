export interface HitboxConfig {
  w: number;
  h: number;
  ox: number; // offset x
  oy: number; // offset y
}

export interface Knockback {
  x: number;
  y: number;
}

export interface MoveData {
  name: string;
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  knockback: Knockback;
  blockPushback: number;
  hitstop: number;
  hitbox: HitboxConfig;
}

export interface HitPayload {
  damage: number;
  knockbackX: number;
  knockbackY: number;
  hitstun: number;
  hitstop: number;
}

export interface FighterAssets {
  idle: string;
  run: string;
  jump: string;
  jab: string;
  special: string;
  block: string;
}

export interface FighterOptions {
  id: string;
  characterId: string;
  name: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: number;
  moveSet?: { jab: string; special: string };
  assets?: FighterAssets;
  facingRight?: boolean;
}

export interface CharacterBase {
  id: string;
  name: string;
  color: number;
  description?: string;
  moveSet: {
    jab: string;
    special: string;
  };
  moveNames: {
    jab: string;
    special: string;
  };
  assets?: FighterAssets;
  atlasUrl?: string;
  atlasData?: any;
  facingRight?: boolean; // Defaults to true. If false, sprite is flipped by default.
  cardImg?: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  color: number;
  layers?: string[];
}
