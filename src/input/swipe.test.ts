import { describe, expect, it } from "vitest";
import { directionForSwipe } from "./swipe";

describe("directionForSwipe", () => {
  it.each([
    [{ x: 0, y: 0 }, { x: 40, y: 0 }, "right"],
    [{ x: 0, y: 0 }, { x: -40, y: 0 }, "left"],
    [{ x: 0, y: 0 }, { x: 0, y: 40 }, "down"],
    [{ x: 0, y: 0 }, { x: 0, y: -40 }, "up"],
  ] as const)("maps a drag from %o to %o as %s", (start, end, direction) => {
    expect(directionForSwipe(start, end)).toBe(direction);
  });

  it("picks the axis with the larger delta for a diagonal drag", () => {
    expect(directionForSwipe({ x: 0, y: 0 }, { x: 60, y: 20 })).toBe("right");
    expect(directionForSwipe({ x: 0, y: 0 }, { x: 20, y: 60 })).toBe("down");
  });

  it("returns null for a drag shorter than the minimum swipe distance", () => {
    expect(directionForSwipe({ x: 0, y: 0 }, { x: 5, y: 0 })).toBeNull();
    expect(directionForSwipe({ x: 0, y: 0 }, { x: 0, y: -5 })).toBeNull();
  });

  it("returns null when start and end points are identical", () => {
    expect(directionForSwipe({ x: 10, y: 10 }, { x: 10, y: 10 })).toBeNull();
  });
});
