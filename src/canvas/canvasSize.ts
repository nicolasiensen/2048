export interface Viewport {
  width: number;
  height: number;
}

export interface CanvasSize {
  /** CSS pixel size the canvas is displayed at (square). */
  cssSize: number;
  /** Backing store size in device pixels, for crisp rendering at devicePixelRatio. */
  pixelSize: number;
}

const MIN_CSS_SIZE = 240;
const MAX_CSS_SIZE = 600;
const VIEWPORT_MARGIN = 32;

/**
 * Computes a square canvas size that fits the viewport (minus a margin),
 * clamped to a sensible range, plus a devicePixelRatio-scaled backing
 * store size so rendering stays sharp on high-DPI screens.
 */
export function computeCanvasSize(viewport: Viewport, devicePixelRatio: number): CanvasSize {
  const available = Math.min(viewport.width, viewport.height) - VIEWPORT_MARGIN * 2;
  const cssSize = Math.max(MIN_CSS_SIZE, Math.min(MAX_CSS_SIZE, available));
  const pixelSize = Math.round(cssSize * devicePixelRatio);
  return { cssSize, pixelSize };
}
