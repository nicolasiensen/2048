import { describe, expect, it } from "vitest";
import { tileColor } from "./palette";

describe("tileColor", () => {
  it("gives low-value Tiles dark text on a light background", () => {
    expect(tileColor(2).text).toBe("#776e65");
    expect(tileColor(4).text).toBe("#776e65");
  });

  it("gives higher-value Tiles light text", () => {
    expect(tileColor(8).text).toBe("#f9f6f2");
    expect(tileColor(2048).text).toBe("#f9f6f2");
  });

  it("gives every known Tile value a distinct background", () => {
    const values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
    const backgrounds = new Set(values.map((value) => tileColor(value).background));

    expect(backgrounds.size).toBe(values.length);
  });

  it("falls back to a distinct color for values beyond the known palette", () => {
    const fallback = tileColor(4096);

    expect(fallback.background).not.toBe(tileColor(2048).background);
    expect(fallback).toEqual(tileColor(8192));
  });
});
