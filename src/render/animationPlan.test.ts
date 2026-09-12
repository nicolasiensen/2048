import { describe, expect, it } from "vitest";
import type { MoveResult, Tile } from "../engine";
import { buildAnimationPlan } from "./animationPlan";

function tile(id: number, value: number, row: number, col: number): Tile {
  return { id, value, row, col };
}

function moveResult(
  overrides: Partial<MoveResult> & Pick<MoveResult, "state">
): MoveResult {
  return {
    moved: true,
    scoreGained: 0,
    spawnedTile: null,
    merges: [],
    ...overrides,
  };
}

describe("buildAnimationPlan", () => {
  it("gives a plain moved Tile a 'move' frame from its old Cell to its new one", () => {
    const previousTiles = [tile(1, 2, 0, 3)];
    const result = moveResult({
      state: { tiles: [tile(1, 2, 0, 0)], score: 0, hasWon: false },
    });

    const frames = buildAnimationPlan(previousTiles, result);

    expect(frames).toEqual([
      {
        id: 1,
        value: 2,
        fromRow: 0,
        fromCol: 3,
        toRow: 0,
        toCol: 0,
        kind: "move",
        isMergeSurvivor: false,
      },
    ]);
  });

  it("gives a Merge's surviving Tile a 'move' frame flagged as a Merge survivor", () => {
    const previousTiles = [tile(1, 2, 0, 0), tile(2, 2, 0, 1)];
    const result = moveResult({
      state: { tiles: [tile(1, 4, 0, 0)], score: 4, hasWon: false },
      merges: [{ survivorId: 1, consumedId: 2 }],
    });

    const frames = buildAnimationPlan(previousTiles, result);

    const survivorFrame = frames.find((frame) => frame.id === 1);
    expect(survivorFrame).toEqual({
      id: 1,
      value: 4,
      fromRow: 0,
      fromCol: 0,
      toRow: 0,
      toCol: 0,
      kind: "move",
      isMergeSurvivor: true,
    });
  });

  it("gives a Merge's consumed Tile a 'consumed' frame sliding into the survivor's destination Cell", () => {
    const previousTiles = [tile(1, 2, 0, 0), tile(2, 2, 0, 3)];
    const result = moveResult({
      state: { tiles: [tile(1, 4, 0, 0)], score: 4, hasWon: false },
      merges: [{ survivorId: 1, consumedId: 2 }],
    });

    const frames = buildAnimationPlan(previousTiles, result);

    const consumedFrame = frames.find((frame) => frame.id === 2);
    expect(consumedFrame).toEqual({
      id: 2,
      value: 2,
      fromRow: 0,
      fromCol: 3,
      toRow: 0,
      toCol: 0,
      kind: "consumed",
      isMergeSurvivor: false,
    });
  });

  it("gives a newly spawned Tile a stationary 'spawn' frame", () => {
    const previousTiles = [tile(1, 2, 0, 0)];
    const result = moveResult({
      state: {
        tiles: [tile(1, 2, 0, 1), tile(2, 4, 3, 3)],
        score: 0,
        hasWon: false,
      },
      spawnedTile: tile(2, 4, 3, 3),
    });

    const frames = buildAnimationPlan(previousTiles, result);

    const spawnFrame = frames.find((frame) => frame.id === 2);
    expect(spawnFrame).toEqual({
      id: 2,
      value: 4,
      fromRow: 3,
      fromCol: 3,
      toRow: 3,
      toCol: 3,
      kind: "spawn",
      isMergeSurvivor: false,
    });
    expect(frames).toHaveLength(2);
  });

  it("produces one frame per surviving/consumed Tile across multiple simultaneous Merges", () => {
    const previousTiles = [
      tile(1, 2, 0, 0),
      tile(2, 2, 0, 1),
      tile(3, 4, 0, 2),
      tile(4, 4, 0, 3),
    ];
    const result = moveResult({
      state: {
        tiles: [tile(1, 4, 0, 0), tile(3, 8, 0, 1)],
        score: 12,
        hasWon: false,
      },
      merges: [
        { survivorId: 1, consumedId: 2 },
        { survivorId: 3, consumedId: 4 },
      ],
    });

    const frames = buildAnimationPlan(previousTiles, result);

    expect(frames).toHaveLength(4);
    expect(frames.map((frame) => frame.id).sort()).toEqual([1, 2, 3, 4]);
  });
});
