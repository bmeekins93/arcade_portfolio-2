import { describe, it, expect } from 'vitest';
import { MOVES, totalFrames } from './moves';

describe('totalFrames', () => {
  it('sums startup, active and recovery', () => {
    const move = MOVES.jason_jab;
    expect(totalFrames(move)).toBe(move.startup + move.active + move.recovery);
  });

  it('matches the documented frame data for a sample move', () => {
    // jason_jab: 6 + 4 + 12 = 22 frames total.
    expect(totalFrames(MOVES.jason_jab)).toBe(22);
  });
});

describe('MOVES data integrity', () => {
  const entries = Object.entries(MOVES);

  it('defines at least one move', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)('%s has a non-empty display name', (_key, move) => {
    expect(move.name.trim().length).toBeGreaterThan(0);
  });

  it.each(entries)('%s has positive frame windows and total duration', (_key, move) => {
    expect(move.startup).toBeGreaterThan(0);
    expect(move.active).toBeGreaterThan(0);
    expect(move.recovery).toBeGreaterThan(0);
    expect(totalFrames(move)).toBeGreaterThan(0);
  });

  it.each(entries)('%s deals positive damage and non-negative stun/hitstop', (_key, move) => {
    expect(move.damage).toBeGreaterThan(0);
    expect(move.hitstun).toBeGreaterThanOrEqual(0);
    expect(move.blockstun).toBeGreaterThanOrEqual(0);
    expect(move.hitstop).toBeGreaterThanOrEqual(0);
    expect(move.blockPushback).toBeGreaterThanOrEqual(0);
  });

  it.each(entries)('%s has a positively-sized hitbox', (_key, move) => {
    expect(move.hitbox.w).toBeGreaterThan(0);
    expect(move.hitbox.h).toBeGreaterThan(0);
    expect(Number.isFinite(move.hitbox.ox)).toBe(true);
    expect(Number.isFinite(move.hitbox.oy)).toBe(true);
  });

  it.each(entries)('%s has finite knockback values', (_key, move) => {
    expect(Number.isFinite(move.knockback.x)).toBe(true);
    expect(Number.isFinite(move.knockback.y)).toBe(true);
  });
});
