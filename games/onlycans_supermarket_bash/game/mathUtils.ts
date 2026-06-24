// Small pure numeric helpers shared by the fighter physics. Kept Phaser-free so
// they can be unit-tested directly.

/** Constrain `v` to the inclusive range [min, max]. */
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/**
 * Move `v` toward `target` by at most `delta`, without overshooting. Used for
 * acceleration and friction easing.
 */
export const approach = (v: number, target: number, delta: number) => {
  if (v < target) return Math.min(v + delta, target);
  if (v > target) return Math.max(v - delta, target);
  return target;
};
