import { describe, expect, it } from "vitest";
import { computeCanvasSize } from "./canvasSize";

describe("computeCanvasSize", () => {
  it("fits the canvas to the smaller viewport dimension, minus margin", () => {
    const { cssSize } = computeCanvasSize({ width: 1000, height: 500 }, 1);

    expect(cssSize).toBe(436); // min(1000, 500) - 2 * 32
  });

  it("clamps to a minimum size on very small viewports", () => {
    const { cssSize } = computeCanvasSize({ width: 200, height: 200 }, 1);

    expect(cssSize).toBe(240);
  });

  it("clamps to a maximum size on very large viewports", () => {
    const { cssSize } = computeCanvasSize({ width: 2000, height: 2000 }, 1);

    expect(cssSize).toBe(600);
  });

  it("scales the backing store size by devicePixelRatio", () => {
    const { cssSize, pixelSize } = computeCanvasSize({ width: 1000, height: 1000 }, 2);

    expect(pixelSize).toBe(cssSize * 2);
  });

  it("rounds the backing store size to a whole pixel", () => {
    const { pixelSize } = computeCanvasSize({ width: 1000, height: 1000 }, 1.5);

    expect(Number.isInteger(pixelSize)).toBe(true);
  });
});
