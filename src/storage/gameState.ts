import type { GameState, Tile } from "../engine";

const STORAGE_KEY = "2048:game-state";

/** The in-progress Grid, Score, and Win flag, plus whether the Win banner has already been shown. */
export interface PersistedGameState extends GameState {
  hasShownWinBanner: boolean;
}

/** Persists `state` as the in-progress game state in `storage`. */
export function saveGameState(
  storage: Storage,
  state: PersistedGameState
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Reads the persisted in-progress game state from `storage`, or `null` when unset or invalid. */
export function loadGameState(storage: Storage): PersistedGameState | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  return isPersistedGameState(parsed) ? parsed : null;
}

/** Removes the persisted in-progress game state from `storage`. */
export function clearGameState(storage: Storage): void {
  storage.removeItem(STORAGE_KEY);
}

function isPersistedGameState(value: unknown): value is PersistedGameState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;

  return (
    Array.isArray(candidate.tiles) &&
    candidate.tiles.every(isTile) &&
    typeof candidate.score === "number" &&
    Number.isFinite(candidate.score) &&
    typeof candidate.hasWon === "boolean" &&
    typeof candidate.hasShownWinBanner === "boolean"
  );
}

function isTile(value: unknown): value is Tile {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.value === "number" &&
    typeof candidate.row === "number" &&
    typeof candidate.col === "number"
  );
}
