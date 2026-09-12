import { DEFAULT_THEME, findTheme, type Theme } from "../theme/themes";

const STORAGE_KEY = "2048:theme";

/** Reads the persisted Theme choice from `storage`, defaulting to `DEFAULT_THEME` when unset or unknown. */
export function loadTheme(storage: Storage): Theme {
  const id = storage.getItem(STORAGE_KEY);
  return id === null ? DEFAULT_THEME : findTheme(id);
}

/** Persists `theme` as the player's Theme choice in `storage`. */
export function saveTheme(storage: Storage, theme: Theme): void {
  storage.setItem(STORAGE_KEY, theme.id);
}
