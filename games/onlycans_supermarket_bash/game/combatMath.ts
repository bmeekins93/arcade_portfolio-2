import { HitPayload } from './types';

// Pure resolution of a single hit. This is the math half of Fighter.takeHit():
// it computes how much HP is lost, the stun windows, and the knockback velocity
// for both the blocked and unblocked cases, with no dependency on Phaser or the
// fighter's mutable state (the one piece of current state it needs — the
// defender's vertical velocity — is passed in explicitly).

/** A blocked hit deals 25% of the move's damage as chip (min 1). */
export const BLOCK_CHIP_RATIO = 0.25;
/** Blockstun is 65% of the move's hitstun. */
export const BLOCK_STUN_RATIO = 0.65;
/** Blocked knockback pushes the defender back at 35% strength. */
export const BLOCK_PUSHBACK_RATIO = 0.35;
/** Blocking only allows a slight upward lift (5% of vertical knockback). */
export const BLOCK_LIFT_RATIO = 0.05;

export interface HitResolution {
  /** True if the hit was blocked (chip damage + reduced effects). */
  blocked: boolean;
  /** HP the defender should lose. */
  hpLoss: number;
  /**
   * Candidate hitstun frames (0 when blocked). The caller applies
   * Math.max() against any stun already in progress.
   */
  hitstunFrames: number;
  /**
   * Candidate blockstun frames (0 when not blocked). The caller applies
   * Math.max() against any stun already in progress.
   */
  blockstunFrames: number;
  /** Horizontal knockback velocity to apply. */
  velX: number;
  /** Vertical knockback velocity to apply (clamped vs currentVelY on block). */
  velY: number;
}

/**
 * Resolve a hit into the deltas the fighter should apply.
 * @param payload        Damage/knockback/hitstun carried by the attack.
 * @param isBlocked      Whether the defender was blocking.
 * @param attackerFacing +1 if the attacker faces right, -1 if left.
 * @param currentVelY    The defender's current vertical velocity (block only).
 */
export function resolveHit(
  payload: HitPayload,
  isBlocked: boolean,
  attackerFacing: number,
  currentVelY: number,
): HitResolution {
  const { damage, knockbackX, knockbackY, hitstun } = payload;

  if (isBlocked) {
    return {
      blocked: true,
      hpLoss: Math.max(1, Math.floor(damage * BLOCK_CHIP_RATIO)),
      hitstunFrames: 0,
      blockstunFrames: Math.floor(hitstun * BLOCK_STUN_RATIO),
      velX: attackerFacing * knockbackX * BLOCK_PUSHBACK_RATIO,
      velY: Math.min(currentVelY, -knockbackY * BLOCK_LIFT_RATIO),
    };
  }

  return {
    blocked: false,
    hpLoss: damage,
    hitstunFrames: hitstun,
    blockstunFrames: 0,
    velX: attackerFacing * knockbackX,
    velY: -knockbackY,
  };
}
