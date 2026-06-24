import { describe, it, expect } from 'vitest';
import { makeGridAtlas } from './atlasFactory';

// The factory lays frames out in a fixed 3-column grid of 1080px cells,
// filled left-to-right then top-to-bottom.
const CELL = 1080;
const COLS = 3;

describe('makeGridAtlas', () => {
  const frameNames = ['a.png', 'b.png', 'c.png', 'd.png', 'e.png'];
  const atlas = makeGridAtlas('sheet.png', frameNames);

  it('creates one frame per name, keyed by name', () => {
    expect(Object.keys(atlas.frames)).toEqual(frameNames);
    expect(Object.keys(atlas.frames)).toHaveLength(frameNames.length);
  });

  it('places frames left-to-right then top-to-bottom on the grid', () => {
    // index 0 -> (0,0); index 2 -> last column of row 0; index 3 -> wraps to row 1.
    expect(atlas.frames['a.png'].frame).toEqual({ x: 0, y: 0, w: CELL, h: CELL });
    expect(atlas.frames['c.png'].frame).toEqual({ x: 2 * CELL, y: 0, w: CELL, h: CELL });
    expect(atlas.frames['d.png'].frame).toEqual({ x: 0, y: CELL, w: CELL, h: CELL });
    expect(atlas.frames['e.png'].frame).toEqual({ x: CELL, y: CELL, w: CELL, h: CELL });
  });

  it('gives every frame a full-cell, untrimmed source size', () => {
    for (const name of frameNames) {
      const f = atlas.frames[name];
      expect(f.rotated).toBe(false);
      expect(f.trimmed).toBe(false);
      expect(f.frame.w).toBe(CELL);
      expect(f.frame.h).toBe(CELL);
      expect(f.spriteSourceSize).toEqual({ x: 0, y: 0, w: CELL, h: CELL });
      expect(f.sourceSize).toEqual({ w: CELL, h: CELL });
    }
  });

  it('computes meta size from a full-width, ceil(rows) grid', () => {
    // 5 frames over 3 columns => 2 rows.
    const rows = Math.ceil(frameNames.length / COLS);
    expect(atlas.meta.size).toEqual({ w: COLS * CELL, h: rows * CELL });
    expect(atlas.meta.format).toBe(`grid ${COLS}x${rows}, cell ${CELL}x${CELL}`);
  });

  it('echoes the source image filename into meta', () => {
    expect(atlas.meta.image).toBe('sheet.png');
  });

  it('handles an exact-row-fill count without adding an empty row', () => {
    // 3 frames over 3 columns => exactly 1 row, no wasted height.
    const exact = makeGridAtlas('x.png', ['a.png', 'b.png', 'c.png']);
    expect(exact.meta.size).toEqual({ w: COLS * CELL, h: CELL });
    expect(exact.frames['c.png'].frame).toEqual({ x: 2 * CELL, y: 0, w: CELL, h: CELL });
  });

  it('handles an empty frame list', () => {
    const empty = makeGridAtlas('empty.png', []);
    expect(Object.keys(empty.frames)).toHaveLength(0);
    expect(empty.meta.size).toEqual({ w: COLS * CELL, h: 0 });
  });
});
