import { MoveData } from './types';

export const MOVES: Record<string, MoveData> = {
  // --- JASON (Balanced) ---
  jason_jab: {
    name: 'Furry Fist',
    startup: 6,
    active: 4,
    recovery: 12,
    damage: 6,
    hitstun: 14,
    blockstun: 9,
    knockback: { x: 420, y: 520 },
    blockPushback: 260,
    hitstop: 6,
    hitbox: { w: 70, h: 26, ox: 55, oy: -58 },
  },
  jason_special: {
    name: 'P. SWAYZE R.I.P. Kick',
    startup: 11,
    active: 6,
    recovery: 16,
    damage: 13,
    hitstun: 22,
    blockstun: 14,
    knockback: { x: 600, y: 600 },
    blockPushback: 350,
    hitstop: 9,
    hitbox: { w: 90, h: 40, ox: 65, oy: -55 },
  },

  // --- JAY (The Rock) ---
  jay_jab: {
    name: "The People's Elbow",
    startup: 7,
    active: 5,
    recovery: 15,
    damage: 8,
    hitstun: 16,
    blockstun: 9,
    knockback: { x: 450, y: 450 },
    blockPushback: 280,
    hitstop: 8,
    hitbox: { w: 80, h: 30, ox: 60, oy: -60 },
  },
  jay_special: {
    name: 'Smolder',
    startup: 12,
    active: 8,
    recovery: 20,
    damage: 18,
    hitstun: 24,
    blockstun: 12,
    knockback: { x: 650, y: 400 },
    blockPushback: 350,
    hitstop: 12,
    hitbox: { w: 110, h: 40, ox: 75, oy: -55 },
  },

  // --- DAVID (Heavy/Slow) ---
  david_jab: {
    name: 'Gayitsu Slap',
    startup: 8,
    active: 5,
    recovery: 15,
    damage: 9,
    hitstun: 18,
    blockstun: 12,
    knockback: { x: 480, y: 400 },
    blockPushback: 300,
    hitstop: 8,
    hitbox: { w: 80, h: 32, ox: 60, oy: -65 },
  },
  david_special: {
    name: 'Ponytail Whip',
    startup: 16,
    active: 8,
    recovery: 24,
    damage: 18,
    hitstun: 26,
    blockstun: 18,
    knockback: { x: 700, y: 400 }, // Horizontal sent
    blockPushback: 450,
    hitstop: 12,
    hitbox: { w: 120, h: 20, ox: 80, oy: -50 },
  },

  // --- DRUNK DAVE (Erratic) ---
  drunk_jab: {
    name: 'Call it in',
    startup: 5,
    active: 3,
    recovery: 10,
    damage: 4,
    hitstun: 12,
    blockstun: 6,
    knockback: { x: 350, y: 550 },
    blockPushback: 200,
    hitstop: 5,
    hitbox: { w: 60, h: 24, ox: 50, oy: -50 },
  },
  drunk_special: {
    name: 'Game Day Tackle',
    startup: 10,
    active: 10,
    recovery: 20,
    damage: 12,
    hitstun: 20,
    blockstun: 12,
    knockback: { x: 650, y: 700 },
    blockPushback: 300,
    hitstop: 10,
    hitbox: { w: 80, h: 50, ox: 60, oy: -30 }, // Low hit
  },

  // --- JACOB (Glass Cannon) ---
  jacob_jab: {
    name: 'Flexin on ah Shelf',
    startup: 5,
    active: 4,
    recovery: 10,
    damage: 8, // High damage for jab
    hitstun: 16,
    blockstun: 8,
    knockback: { x: 400, y: 500 },
    blockPushback: 250,
    hitstop: 7,
    hitbox: { w: 75, h: 30, ox: 58, oy: -70 }, // High hit
  },
  jacob_special: {
    name: 'Illiterate Wrath',
    startup: 9,
    active: 4,
    recovery: 28, // High recovery (punishable)
    damage: 20, // Huge damage
    hitstun: 30,
    blockstun: 10, // Unsafe on block
    knockback: { x: 800, y: 800 },
    blockPushback: 400,
    hitstop: 15, // Big freeze
    hitbox: { w: 100, h: 60, ox: 70, oy: -60 },
  },
};

export function totalFrames(move: MoveData): number {
  return move.startup + move.active + move.recovery;
}