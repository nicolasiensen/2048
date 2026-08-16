export interface TilePalette {
  background: string;
  text: string;
}

const LIGHT_TEXT = "#f9f6f2";
const DARK_TEXT = "#776e65";

const PALETTE: Record<number, TilePalette> = {
  2: { background: "#eee4da", text: DARK_TEXT },
  4: { background: "#ede0c8", text: DARK_TEXT },
  8: { background: "#f2b179", text: LIGHT_TEXT },
  16: { background: "#f59563", text: LIGHT_TEXT },
  32: { background: "#f67c5f", text: LIGHT_TEXT },
  64: { background: "#f65e3b", text: LIGHT_TEXT },
  128: { background: "#edcf72", text: LIGHT_TEXT },
  256: { background: "#edcc61", text: LIGHT_TEXT },
  512: { background: "#edc850", text: LIGHT_TEXT },
  1024: { background: "#edc53f", text: LIGHT_TEXT },
  2048: { background: "#edc22e", text: LIGHT_TEXT },
};

/** Used for any Tile value beyond the hand-picked palette (past 2048), so play can continue indefinitely. */
const FALLBACK_PALETTE: TilePalette = { background: "#3c3a32", text: LIGHT_TEXT };

/** The background/text colors for a Tile's value, so different values are visually distinguished. */
export function tileColor(value: number): TilePalette {
  return PALETTE[value] ?? FALLBACK_PALETTE;
}
