import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, THEMES, findTheme } from "./themes";

const KNOWN_TILE_VALUES = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

describe("THEMES", () => {
  it("gives every Theme a unique id", () => {
    const ids = THEMES.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(THEMES.length);
  });

  it("includes DEFAULT_THEME", () => {
    expect(THEMES).toContain(DEFAULT_THEME);
  });

  it.each(THEMES)("gives $name a color for every known Tile value", (theme) => {
    for (const value of KNOWN_TILE_VALUES) {
      expect(theme.tiles[value]).toBeDefined();
    }
  });

  it.each(THEMES)(
    "gives $name distinct backgrounds across its Tile values",
    (theme) => {
      const backgrounds = KNOWN_TILE_VALUES.map(
        (value) => theme.tiles[value]!.background
      );
      expect(new Set(backgrounds).size).toBe(KNOWN_TILE_VALUES.length);
    }
  );
});

describe("findTheme", () => {
  it("returns the matching Theme by id", () => {
    expect(findTheme("midnight").name).toBe("Midnight");
  });

  it("falls back to DEFAULT_THEME for an unknown id", () => {
    expect(findTheme("not-a-real-theme")).toBe(DEFAULT_THEME);
  });
});
