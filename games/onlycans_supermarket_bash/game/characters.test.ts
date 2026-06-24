import { describe, it, expect } from 'vitest';
import { CHARACTERS } from './constants';
import { MOVES } from './moves';

describe('CHARACTERS roster', () => {
  it('defines a roster', () => {
    expect(CHARACTERS.length).toBeGreaterThan(0);
  });

  it('has unique character ids', () => {
    const ids = CHARACTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(CHARACTERS)('$id references jab/special moves that exist in MOVES', (char) => {
    // A typo here would throw mid-match when the move is looked up, so guard it.
    expect(MOVES[char.moveSet.jab], `missing move "${char.moveSet.jab}"`).toBeDefined();
    expect(MOVES[char.moveSet.special], `missing move "${char.moveSet.special}"`).toBeDefined();
  });

  it.each(CHARACTERS)('$id carries a non-empty sprite atlas', (char) => {
    expect(char.atlasData).toBeDefined();
    const frames = char.atlasData.frames as Record<string, unknown>;
    expect(Object.keys(frames).length).toBeGreaterThan(0);
  });

  it.each(CHARACTERS)('$id only points its assets at frames present in its atlas', (char) => {
    if (!char.assets) return;
    const frames = char.atlasData.frames as Record<string, unknown>;
    for (const frameName of Object.values(char.assets)) {
      expect(frames[frameName], `frame "${frameName}" missing from ${char.id} atlas`).toBeDefined();
    }
  });
});
