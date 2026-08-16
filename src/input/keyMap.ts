import type { Direction } from "../engine";

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

/** Maps a `KeyboardEvent.key` to the Move Direction it represents, or null if the key isn't a Move key. */
export function directionForKey(key: string): Direction | null {
  return KEY_DIRECTIONS[key] ?? null;
}
