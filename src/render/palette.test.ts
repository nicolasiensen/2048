import { describe, expect, it } from "vitest";
import { findTheme } from "../theme/themes";
import { tileColor } from "./palette";

const midnight = findTheme("midnight");

describe("tileColor", () => {
  it("gives low-value Tiles a distinct text color from high-value Tiles", () => {
    expect(tileColor(midnight, 2).text).toBe("#cbd5f5");
    expect(tileColor(midnight, 4).text).toBe("#cbd5f5");
    expect(tileColor(midnight, 8).text).toBe("#ffffff");
    expect(tileColor(midnight, 2048).text).toBe("#111827");
  });

  it("gives every known Tile value a distinct background", () => {
    const values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
    const backgrounds = new Set(
      values.map((value) => tileColor(midnight, value).background)
    );

    expect(backgrounds.size).toBe(values.length);
  });

  it("falls back to a distinct color for values beyond the known palette", () => {
    const fallback = tileColor(midnight, 4096);

    expect(fallback.background).not.toBe(tileColor(midnight, 2048).background);
    expect(fallback).toEqual(tileColor(midnight, 8192));
  });

  it("reads colors from the given theme, not a hardcoded one", () => {
    const ocean = findTheme("ocean");
    expect(tileColor(ocean, 2)).toEqual(ocean.tiles[2]);
    expect(tileColor(ocean, 2)).not.toEqual(tileColor(midnight, 2));
  });
});
