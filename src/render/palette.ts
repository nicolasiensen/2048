import type { Theme, TilePalette } from "../theme/themes";

export type { TilePalette };

/** The background/text colors for a Tile's value under `theme`, so different values are visually distinguished. */
export function tileColor(theme: Theme, value: number): TilePalette {
  return theme.tiles[value] ?? theme.tileFallback;
}
