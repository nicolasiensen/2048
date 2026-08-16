import { computeCanvasSize } from "./canvasSize";
import type { CanvasSize } from "./canvasSize";

/**
 * Applies the current viewport's computed size to a canvas element: its CSS
 * display size, its devicePixelRatio-scaled backing store, and a pre-scaled
 * 2D context transform so later rendering tickets can draw in CSS-pixel
 * coordinates without redoing the devicePixelRatio math on every draw call.
 * Returns the computed size so callers know the CSS-pixel coordinate space
 * to draw in without re-parsing the canvas's style.
 */
export function applyCanvasSize(canvas: HTMLCanvasElement): CanvasSize {
  const size = computeCanvasSize(
    { width: window.innerWidth, height: window.innerHeight },
    window.devicePixelRatio || 1,
  );
  const { cssSize, pixelSize } = size;

  canvas.style.width = `${cssSize}px`;
  canvas.style.height = `${cssSize}px`;
  canvas.width = pixelSize;
  canvas.height = pixelSize;

  const context = canvas.getContext("2d");
  const scale = pixelSize / cssSize;
  context?.setTransform(scale, 0, 0, scale, 0, 0);

  return size;
}
