import { beforeEach, describe, expect, it } from "vitest";
import { applyCanvasSize } from "./applyCanvasSize";

function setViewport(width: number, height: number, devicePixelRatio = 1): void {
  Object.defineProperty(window, "innerWidth", { value: width, writable: true });
  Object.defineProperty(window, "innerHeight", { value: height, writable: true });
  Object.defineProperty(window, "devicePixelRatio", { value: devicePixelRatio, writable: true });
}

describe("applyCanvasSize", () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement("canvas");
  });

  it("sets the canvas's CSS size to fit the viewport", () => {
    setViewport(800, 800);

    applyCanvasSize(canvas);

    expect(canvas.style.width).toBe("600px");
    expect(canvas.style.height).toBe("600px");
  });

  it("returns the computed size it applied", () => {
    setViewport(800, 800, 2);

    const size = applyCanvasSize(canvas);

    expect(size).toEqual({ cssSize: 600, pixelSize: 1200 });
  });

  it("scales the backing store size for devicePixelRatio", () => {
    setViewport(800, 800, 2);

    applyCanvasSize(canvas);

    expect(canvas.width).toBe(1200);
    expect(canvas.height).toBe(1200);
  });

  it("re-sizes when applied again after the viewport changes", () => {
    setViewport(800, 800);
    applyCanvasSize(canvas);
    expect(canvas.style.width).toBe("600px");

    setViewport(300, 300);
    applyCanvasSize(canvas);

    expect(canvas.style.width).toBe("240px");
  });
});
