import { GRID_SIZE } from "./grid";
import { computeMove } from "./slide";
import { spawnRandomTile } from "./spawn";
import type { Direction, GameState, MoveResult, RandomSource } from "./types";

const WIN_VALUE = 2048;
const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

const defaultRandom: RandomSource = Math.random;

/** Creates a fresh 4x4 Grid state with two spawned Tiles. */
export function createGame(random: RandomSource = defaultRandom): GameState {
  const first = spawnRandomTile([], random);
  const second = spawnRandomTile(first.tiles, random);
  return { tiles: second.tiles, score: 0, hasWon: false };
}

/**
 * Applies one Move to `state`. A Move that would not change the Grid is a
 * no-op: the same `state` reference is returned, with no Score change and
 * no spawn.
 */
export function applyMove(
  state: GameState,
  direction: Direction,
  random: RandomSource = defaultRandom,
): MoveResult {
  const slide = computeMove(state.tiles, direction);

  if (!slide.moved) {
    return { state, moved: false, scoreGained: 0, spawnedTile: null, merges: [] };
  }

  const { tiles, spawnedTile } = spawnRandomTile(slide.tiles, random);
  const score = state.score + slide.scoreGained;
  const hasWon = state.hasWon || tiles.some((tile) => tile.value === WIN_VALUE);

  return {
    state: { tiles, score, hasWon },
    moved: true,
    scoreGained: slide.scoreGained,
    spawnedTile,
    merges: slide.merges,
  };
}

/** True when the Grid is full and no Move in any direction would change it. */
export function isGameOver(state: GameState): boolean {
  if (state.tiles.length < GRID_SIZE * GRID_SIZE) return false;
  return DIRECTIONS.every((direction) => !computeMove(state.tiles, direction).moved);
}
