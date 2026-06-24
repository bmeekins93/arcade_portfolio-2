import { describe, it, expect } from 'vitest';
import { resolveHit } from './combatMath';
import { MOVES } from './moves';
import { HitPayload } from './types';

// Build a HitPayload the way MatchScene does from a move's data.
const payloadFor = (key: string): HitPayload => {
  const m = MOVES[key];
  return {
    damage: m.damage,
    knockbackX: m.knockback.x,
    knockbackY: m.knockback.y,
    hitstun: m.hitstun,
    hitstop: m.hitstop,
  };
};

describe('resolveHit — unblocked', () => {
  const p = payloadFor('jason_special'); // dmg 13, kb {600,600}, hitstun 22
  const res = resolveHit(p, false, 1, 0);

  it('applies full damage and hitstun, no blockstun', () => {
    expect(res.blocked).toBe(false);
    expect(res.hpLoss).toBe(p.damage);
    expect(res.hitstunFrames).toBe(p.hitstun);
    expect(res.blockstunFrames).toBe(0);
  });

  it('applies full knockback in the attacker facing direction', () => {
    expect(res.velX).toBe(p.knockbackX);
    expect(res.velY).toBe(-p.knockbackY);
  });

  it('flips horizontal knockback when the attacker faces left', () => {
    const left = resolveHit(p, false, -1, 0);
    expect(left.velX).toBe(-p.knockbackX);
    expect(left.velY).toBe(-p.knockbackY); // vertical unaffected by facing
  });
});

describe('resolveHit — blocked', () => {
  const p = payloadFor('jason_special'); // dmg 13, hitstun 22
  const res = resolveHit(p, true, 1, 0);

  it('reduces damage to chip (25%, min 1) and sets blockstun (65%)', () => {
    expect(res.blocked).toBe(true);
    expect(res.hpLoss).toBe(Math.max(1, Math.floor(p.damage * 0.25))); // floor(3.25) = 3
    expect(res.hpLoss).toBe(3);
    expect(res.blockstunFrames).toBe(Math.floor(p.hitstun * 0.65)); // floor(14.3) = 14
    expect(res.hitstunFrames).toBe(0);
  });

  it('reduces pushback to 35% and barely lifts the defender', () => {
    expect(res.velX).toBeCloseTo(p.knockbackX * 0.35);
    expect(res.velY).toBe(Math.min(0, -p.knockbackY * 0.05));
  });

  it('guarantees at least 1 chip damage even for a weak move', () => {
    // drunk_jab deals 4 damage -> floor(1.0) = 1, still >= 1.
    const weak = resolveHit(payloadFor('drunk_jab'), true, 1, 0);
    expect(weak.hpLoss).toBeGreaterThanOrEqual(1);
  });

  it('does not push the defender further up than their current upward velocity', () => {
    // Already rising fast (-500); block lift is small, so keep the faster rise.
    const rising = resolveHit(p, true, 1, -500);
    expect(rising.velY).toBe(-500);
  });
});
