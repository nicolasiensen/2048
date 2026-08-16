import { describe, expect, it } from "vitest";
import { applyMove, createGame, GRID_SIZE, isGameOver } from "./index";
import type { GameState, MoveResult, RandomSource, Tile } from "./index";

/** Returns each value in order on successive calls, repeating the last value once exhausted. */
function sequence(...values: number[]): RandomSource {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

function tile(id: number, value: number, row: number, col: number): Tile {
  return { id, value, row, col };
}

function state(tiles: Tile[], overrides: Partial<Pick<GameState, "score" | "hasWon">> = {}): GameState {
  return { tiles, score: 0, hasWon: false, ...overrides };
}

/** The result's Tiles excluding the spawned one, for asserting on the Move's own slide/merge outcome. */
function survivors(result: MoveResult): Tile[] {
  return result.state.tiles.filter((t) => t.id !== result.spawnedTile?.id);
}

describe("createGame", () => {
  it("returns a fresh 4x4 Grid state with two spawned Tiles", () => {
    const game = createGame(sequence(0, 0, 0.99, 0));

    expect(game.score).toBe(0);
    expect(game.hasWon).toBe(false);
    expect(game.tiles).toHaveLength(2);
    for (const t of game.tiles) {
      expect(t.row).toBeGreaterThanOrEqual(0);
      expect(t.row).toBeLessThan(GRID_SIZE);
      expect(t.col).toBeGreaterThanOrEqual(0);
      expect(t.col).toBeLessThan(GRID_SIZE);
      expect([2, 4]).toContain(t.value);
    }
  });

  it("spawns the two Tiles at distinct Cells with distinct ids", () => {
    const game = createGame(sequence(0, 0, 0.9375, 0));

    const [a, b] = game.tiles;
    expect(a.id).not.toBe(b.id);
    expect(`${a.row}-${a.col}`).not.toBe(`${b.row}-${b.col}`);
  });
});

describe("applyMove — sliding and merging", () => {
  it("slides Tiles left and merges equal adjacent Tiles", () => {
    const initial = state([tile(1, 2, 0, 1), tile(2, 2, 0, 3)]);

    const result = applyMove(initial, "left", sequence(0, 0));

    const s = survivors(result);
    expect(s).toEqual([{ id: 1, value: 4, row: 0, col: 0 }]);
    expect(result.merges).toEqual([{ survivorId: 1, consumedId: 2 }]);
  });

  it("slides Tiles right and merges equal adjacent Tiles", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 2, 0, 2)]);

    const result = applyMove(initial, "right", sequence(0, 0));

    const s = survivors(result);
    expect(s).toEqual([{ id: 2, value: 4, row: 0, col: 3 }]);
  });

  it("slides Tiles up and merges equal adjacent Tiles", () => {
    const initial = state([tile(1, 2, 1, 0), tile(2, 2, 3, 0)]);

    const result = applyMove(initial, "up", sequence(0, 0));

    const s = survivors(result);
    expect(s).toEqual([{ id: 1, value: 4, row: 0, col: 0 }]);
  });

  it("slides Tiles down and merges equal adjacent Tiles", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 2, 2, 0)]);

    const result = applyMove(initial, "down", sequence(0, 0));

    const s = survivors(result);
    expect(s).toEqual([{ id: 2, value: 4, row: 3, col: 0 }]);
  });

  it("slides non-mergeable Tiles into empty Cells without merging them", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 4, 0, 3)]);

    const result = applyMove(initial, "left", sequence(0, 0));

    const s = survivors(result);
    expect(s).toEqual(
      expect.arrayContaining([
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 4, row: 0, col: 1 },
      ]),
    );
    expect(result.merges).toEqual([]);
  });
});

describe("applyMove — merge-once-per-Move rule", () => {
  it("merges each Tile at most once per Move, even with three equal Tiles in a line", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 2, 0, 1), tile(3, 2, 0, 2)]);

    const result = applyMove(initial, "left", sequence(0, 0));

    const s = survivors(result);
    expect(s).toEqual([
      { id: 1, value: 4, row: 0, col: 0 },
      { id: 3, value: 2, row: 0, col: 1 },
    ]);
    expect(result.merges).toEqual([{ survivorId: 1, consumedId: 2 }]);
  });

  it("merges two separate equal pairs in the same line into two distinct Tiles", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 2, 0, 1), tile(3, 4, 0, 2), tile(4, 4, 0, 3)]);

    const result = applyMove(initial, "left", sequence(0, 0));

    const s = survivors(result);
    expect(s).toEqual([
      { id: 1, value: 4, row: 0, col: 0 },
      { id: 3, value: 8, row: 0, col: 1 },
    ]);
  });

  it("merges a chain of four equal Tiles in one line into two doubled Tiles, not one quadrupled Tile", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 2, 0, 1), tile(3, 2, 0, 2), tile(4, 2, 0, 3)]);

    const result = applyMove(initial, "left", sequence(0, 0));

    const s = survivors(result);
    expect(s).toEqual([
      { id: 1, value: 4, row: 0, col: 0 },
      { id: 3, value: 4, row: 0, col: 1 },
    ]);
    expect(result.merges).toEqual([
      { survivorId: 1, consumedId: 2 },
      { survivorId: 3, consumedId: 4 },
    ]);
    expect(result.scoreGained).toBe(4 + 4);
  });
});

describe("applyMove — no-op Moves", () => {
  it("is a no-op when the Move would not change the Grid: no spawn, no Score change, same state reference", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 4, 0, 1)], { score: 12 });

    const result = applyMove(initial, "left", sequence(0, 0));

    expect(result.moved).toBe(false);
    expect(result.scoreGained).toBe(0);
    expect(result.spawnedTile).toBeNull();
    expect(result.merges).toEqual([]);
    expect(result.state).toBe(initial);
  });
});

describe("applyMove — scoring", () => {
  it("increases Score by the resulting Tile's value on every Merge, across multiple Merges in one Move", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 2, 0, 1), tile(3, 4, 0, 2), tile(4, 4, 0, 3)], {
      score: 10,
    });

    const result = applyMove(initial, "left", sequence(0, 0));

    expect(result.scoreGained).toBe(4 + 8);
    expect(result.state.score).toBe(10 + 4 + 8);
  });
});

describe("applyMove — spawning", () => {
  it("spawns exactly one new Tile after a Move that changes the Grid", () => {
    const initial = state([tile(1, 2, 0, 0)]);

    const result = applyMove(initial, "right", sequence(0, 0));

    expect(result.spawnedTile).not.toBeNull();
    expect(result.state.tiles).toHaveLength(2);
  });

  it("spawns a value-2 Tile when the random draw is below 0.9", () => {
    const initial = state([tile(1, 2, 0, 0)]);

    const result = applyMove(initial, "right", sequence(0, 0.89999));

    expect(result.spawnedTile?.value).toBe(2);
  });

  it("spawns a value-4 Tile when the random draw is 0.9 or above", () => {
    const initial = state([tile(1, 2, 0, 0)]);

    const result = applyMove(initial, "right", sequence(0, 0.9));

    expect(result.spawnedTile?.value).toBe(4);
  });

  it("spawns the new Tile in an empty Cell", () => {
    const initial = state([tile(1, 2, 0, 0)]);

    const result = applyMove(initial, "right", sequence(0, 0));

    const spawned = result.spawnedTile;
    expect(spawned).not.toBeNull();
    const occupiedByOthers = result.state.tiles.some(
      (t) => t.id !== spawned?.id && t.row === spawned?.row && t.col === spawned?.col,
    );
    expect(occupiedByOthers).toBe(false);
  });
});

describe("applyMove — Tile identity", () => {
  it("keeps ids stable across Moves for Tiles that don't merge", () => {
    const initial = state([tile(7, 2, 0, 0), tile(9, 4, 3, 3)]);

    const result = applyMove(initial, "up", sequence(0, 0));

    const s = survivors(result);
    expect(s.map((t) => t.id).sort()).toEqual([7, 9]);
  });

  it("keeps the surviving Tile's id through a Merge, recorded in merges", () => {
    const initial = state([tile(5, 8, 0, 0), tile(6, 8, 0, 1)]);

    const result = applyMove(initial, "left", sequence(0, 0));

    expect(result.merges).toEqual([{ survivorId: 5, consumedId: 6 }]);
    const s = survivors(result);
    expect(s).toEqual([{ id: 5, value: 16, row: 0, col: 0 }]);
  });
});

describe("applyMove — Win detection", () => {
  it("sets hasWon the first time a 2048 Tile exists", () => {
    const initial = state([tile(1, 1024, 0, 0), tile(2, 1024, 0, 1)]);

    const result = applyMove(initial, "left", sequence(0, 0));

    expect(result.state.hasWon).toBe(true);
  });

  it("does not set hasWon when no 2048 Tile exists", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 2, 0, 1)]);

    const result = applyMove(initial, "left", sequence(0, 0));

    expect(result.state.hasWon).toBe(false);
  });

  it("never unsets hasWon once true, even on later Moves without a 2048 Tile present", () => {
    const initial = state([tile(1, 2, 0, 0), tile(2, 4, 0, 3)], { hasWon: true });

    const result = applyMove(initial, "left", sequence(0, 0));

    expect(result.state.hasWon).toBe(true);
  });
});

describe("isGameOver", () => {
  it("is false when the Grid is not full", () => {
    const grid = state([tile(1, 2, 0, 0)]);

    expect(isGameOver(grid)).toBe(false);
  });

  it("is false when the Grid is full but a Move would still merge Tiles", () => {
    const tiles: Tile[] = [];
    let id = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        tiles.push(tile(++id, 2, row, col));
      }
    }

    expect(isGameOver(state(tiles))).toBe(false);
  });

  it("is true when the Grid is full and no Move in any direction would change it", () => {
    // 4x4 grid where every adjacent pair (row-wise and column-wise) differs.
    const values = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    const tiles: Tile[] = [];
    let id = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        tiles.push(tile(++id, values[row][col], row, col));
      }
    }

    expect(isGameOver(state(tiles))).toBe(true);
  });
});
