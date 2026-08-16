import { computeCanvasSize } from "./canvasSize";

/**
 * Applies the current viewport's computed size to a canvas element: its CSS
 * display size, its devicePixelRatio-scaled backing store, and a pre-scaled
 * 2D context transform so later rendering tickets can draw in CSS-pixel
 * coordinates without redoing the devicePixelRatio math on every draw call.
 */
export function applyCanvasSize(canvas: HTMLCanvasElement): void {
  const { cssSize, pixelSize } = computeCanvasSize(
    { width: window.innerWidth, height: window.innerHeight },
    window.devicePixelRatio || 1,
  );

  canvas.style.width = `${cssSize}px`;
  canvas.style.height = `${cssSize}px`;
  canvas.width = pixelSize;
  canvas.height = pixelSize;

  const context = canvas.getContext("2d");
  const scale = pixelSize / cssSize;
  context?.setTransform(scale, 0, 0, scale, 0, 0);
}
