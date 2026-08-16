export type Direction = "up" | "down" | "left" | "right";

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
}

export interface GameState {
  tiles: Tile[];
  score: number;
  hasWon: boolean;
}

/** A Tile consumed by a Merge, and the surviving Tile whose id/position it merged into. */
export interface Merge {
  survivorId: number;
  consumedId: number;
}

export interface MoveResult {
  state: GameState;
  moved: boolean;
  scoreGained: number;
  spawnedTile: Tile | null;
  merges: Merge[];
}

/** Returns a float in [0, 1), like `Math.random` — injectable so spawn outcomes can be seeded in tests. */
export type RandomSource = () => number;
