/** A Tile value's background/text colors within one Theme. */
export interface TilePalette {
  background: string;
  text: string;
}

/** The surrounding chrome's colors within one Theme — everything outside the canvas itself. */
export interface ThemeUi {
  pageBackground: string;
  panelBackground: string;
  panelText: string;
  buttonBackground: string;
  buttonBackgroundHover: string;
  buttonText: string;
  winBannerBackground: string;
  winBannerText: string;
  gameOverBackground: string;
  gameOverText: string;
}

/** A full visual skin for the game: canvas colors (board/cell/tiles) plus the surrounding HTML chrome. */
export interface Theme {
  id: string;
  name: string;
  board: {
    background: string;
    cell: string;
  };
  tiles: Record<number, TilePalette>;
  /** Used for any Tile value beyond the hand-picked palette (past 2048), so play can continue indefinitely. */
  tileFallback: TilePalette;
  ui: ThemeUi;
}

const MIDNIGHT: Theme = {
  id: "midnight",
  name: "Midnight",
  board: { background: "#1c1f2b", cell: "#262a3a" },
  tiles: {
    2: { background: "#2e3350", text: "#cbd5f5" },
    4: { background: "#333a63", text: "#cbd5f5" },
    8: { background: "#5b3aa0", text: "#ffffff" },
    16: { background: "#7c3aed", text: "#ffffff" },
    32: { background: "#a21caf", text: "#ffffff" },
    64: { background: "#db2777", text: "#ffffff" },
    128: { background: "#0891b2", text: "#ffffff" },
    256: { background: "#0ea5e9", text: "#ffffff" },
    512: { background: "#22d3ee", text: "#111827" },
    1024: { background: "#34d399", text: "#111827" },
    2048: { background: "#facc15", text: "#111827" },
  },
  tileFallback: { background: "#f43f5e", text: "#ffffff" },
  ui: {
    pageBackground: "#0f1117",
    panelBackground: "#1c1f2b",
    panelText: "#cbd5f5",
    buttonBackground: "#4c1d95",
    buttonBackgroundHover: "#6d28d9",
    buttonText: "#ffffff",
    winBannerBackground: "rgb(250 204 21 / 0.9)",
    winBannerText: "#1c1f2b",
    gameOverBackground: "rgb(15 17 23 / 0.85)",
    gameOverText: "#f4f4f5",
  },
};

const OCEAN: Theme = {
  id: "ocean",
  name: "Ocean",
  board: { background: "#01579b", cell: "#0288d1" },
  tiles: {
    2: { background: "#e0f7fa", text: "#01579b" },
    4: { background: "#b2ebf2", text: "#01579b" },
    8: { background: "#4dd0e1", text: "#ffffff" },
    16: { background: "#26c6da", text: "#ffffff" },
    32: { background: "#00acc1", text: "#ffffff" },
    64: { background: "#0097a7", text: "#ffffff" },
    128: { background: "#00838f", text: "#ffffff" },
    256: { background: "#006064", text: "#ffffff" },
    512: { background: "#0d47a1", text: "#ffffff" },
    1024: { background: "#002171", text: "#ffffff" },
    2048: { background: "#ffd54f", text: "#01579b" },
  },
  tileFallback: { background: "#263238", text: "#ffffff" },
  ui: {
    pageBackground: "#e1f5fe",
    panelBackground: "#01579b",
    panelText: "#e1f5fe",
    buttonBackground: "#0277bd",
    buttonBackgroundHover: "#0288d1",
    buttonText: "#ffffff",
    winBannerBackground: "rgb(255 213 79 / 0.9)",
    winBannerText: "#01579b",
    gameOverBackground: "rgb(1 87 155 / 0.75)",
    gameOverText: "#e1f5fe",
  },
};

const SUNSET: Theme = {
  id: "sunset",
  name: "Sunset",
  board: { background: "#7a3b69", cell: "#a15080" },
  tiles: {
    2: { background: "#ffe0b2", text: "#7a3b69" },
    4: { background: "#ffcc80", text: "#7a3b69" },
    8: { background: "#ffb74d", text: "#ffffff" },
    16: { background: "#ffa726", text: "#ffffff" },
    32: { background: "#fb8c00", text: "#ffffff" },
    64: { background: "#f4511e", text: "#ffffff" },
    128: { background: "#e64a19", text: "#ffffff" },
    256: { background: "#d81b60", text: "#ffffff" },
    512: { background: "#ad1457", text: "#ffffff" },
    1024: { background: "#6a1b9a", text: "#ffffff" },
    2048: { background: "#4a148c", text: "#ffd54f" },
  },
  tileFallback: { background: "#263238", text: "#ffffff" },
  ui: {
    pageBackground: "#fff1e6",
    panelBackground: "#7a3b69",
    panelText: "#ffe0b2",
    buttonBackground: "#e64a19",
    buttonBackgroundHover: "#f4511e",
    buttonText: "#ffffff",
    winBannerBackground: "rgb(255 183 77 / 0.9)",
    winBannerText: "#4a148c",
    gameOverBackground: "rgb(122 59 105 / 0.75)",
    gameOverText: "#ffe0b2",
  },
};

/** Every Theme the player can switch between, in menu order. */
export const THEMES: Theme[] = [MIDNIGHT, OCEAN, SUNSET];

/** The Theme applied when nothing has been picked yet (a first visit, or a corrupted/unknown saved id). */
export const DEFAULT_THEME: Theme = MIDNIGHT;

/** Looks up a Theme by id, falling back to `DEFAULT_THEME` for an unknown id. */
export function findTheme(id: string): Theme {
  return THEMES.find((theme) => theme.id === id) ?? DEFAULT_THEME;
}
