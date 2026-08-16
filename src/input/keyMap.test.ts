import { describe, expect, it } from "vitest";
import { directionForKey } from "./keyMap";

describe("directionForKey", () => {
  it.each([
    ["ArrowUp", "up"],
    ["ArrowDown", "down"],
    ["ArrowLeft", "left"],
    ["ArrowRight", "right"],
  ] as const)("maps %s to %s", (key, direction) => {
    expect(directionForKey(key)).toBe(direction);
  });

  it("returns null for keys that aren't a Move", () => {
    expect(directionForKey("a")).toBeNull();
    expect(directionForKey("Enter")).toBeNull();
    expect(directionForKey(" ")).toBeNull();
  });
});
