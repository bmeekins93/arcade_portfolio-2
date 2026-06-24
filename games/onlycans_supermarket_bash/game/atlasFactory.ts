// Shared builder for the character sprite atlases.
//
// Every fighter spritesheet uses the same geometry: a 3-column grid of
// 1080x1080 cells, filled left-to-right then top-to-bottom. The only things
// that differ between characters are the frame names and the source image,
// so the per-character data files just call makeGridAtlas() with those.

const CELL = 1080;
const COLS = 3;

export interface AtlasFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}

export interface GridAtlas {
  frames: Record<string, AtlasFrame>;
  meta: {
    app: string;
    version: string;
    image: string;
    size: { w: number; h: number };
    scale: string;
    format: string;
  };
}

/**
 * Build a Phaser JSON-Hash atlas for a fixed 3-column / 1080px-cell grid.
 * @param image      Source image filename stored in atlas meta.
 * @param frameNames Frame keys in grid order (row 0 left→right, then row 1, …).
 */
export function makeGridAtlas(image: string, frameNames: string[]): GridAtlas {
  const frames: Record<string, AtlasFrame> = {};
  frameNames.forEach((name, i) => {
    const x = (i % COLS) * CELL;
    const y = Math.floor(i / COLS) * CELL;
    frames[name] = {
      frame: { x, y, w: CELL, h: CELL },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: CELL, h: CELL },
      sourceSize: { w: CELL, h: CELL }
    };
  });

  const rows = Math.ceil(frameNames.length / COLS);
  return {
    frames,
    meta: {
      app: 'chatgpt-atlas',
      version: '1.0',
      image,
      size: { w: COLS * CELL, h: rows * CELL },
      scale: '1',
      format: `grid ${COLS}x${rows}, cell ${CELL}x${CELL}`
    }
  };
}
