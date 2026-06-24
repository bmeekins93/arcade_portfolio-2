import { describe, it, expect } from 'vitest';
import { clamp, approach } from './mathUtils';

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to the bounds', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it('returns the bound exactly at the edges', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('approach', () => {
  it('moves up toward a higher target by delta', () => {
    expect(approach(0, 10, 3)).toBe(3);
  });

  it('moves down toward a lower target by delta', () => {
    expect(approach(10, 0, 3)).toBe(7);
  });

  it('never overshoots the target', () => {
    expect(approach(8, 10, 5)).toBe(10);
    expect(approach(2, 0, 5)).toBe(0);
  });

  it('returns the target when already there', () => {
    expect(approach(10, 10, 5)).toBe(10);
  });
});
