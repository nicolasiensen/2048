import { describe, expect, it } from "vitest";
import type { Tile } from "../engine";
import { FakeStorage } from "./fakeStorage";
import { clearGameState, loadGameState, saveGameState } from "./gameState";

const tiles: Tile[] = [
  { id: 1, value: 2, row: 0, col: 0 },
  { id: 2, value: 4, row: 0, col: 1 },
];

describe("loadGameState", () => {
  it("returns null when nothing is stored", () => {
    expect(loadGameState(new FakeStorage())).toBeNull();
  });

  it("returns a previously saved game state", () => {
    const storage = new FakeStorage();
    saveGameState(storage, {
      tiles,
      score: 12,
      hasWon: false,
      hasShownWinBanner: false,
    });

    expect(loadGameState(storage)).toEqual({
      tiles,
      score: 12,
      hasWon: false,
      hasShownWinBanner: false,
    });
  });

  it("returns null when the stored value is not valid JSON", () => {
    const storage = new FakeStorage();
    storage.setItem("2048:game-state", "not-json{");

    expect(loadGameState(storage)).toBeNull();
  });

  it("returns null when the stored value is missing required fields", () => {
    const storage = new FakeStorage();
    storage.setItem("2048:game-state", JSON.stringify({ tiles, score: 12 }));

    expect(loadGameState(storage)).toBeNull();
  });

  it("returns null when a Tile is malformed", () => {
    const storage = new FakeStorage();
    storage.setItem(
      "2048:game-state",
      JSON.stringify({
        tiles: [{ id: 1, value: 2 }],
        score: 0,
        hasWon: false,
        hasShownWinBanner: false,
      })
    );

    expect(loadGameState(storage)).toBeNull();
  });
});

describe("saveGameState", () => {
  it("overwrites a previously saved game state", () => {
    const storage = new FakeStorage();
    saveGameState(storage, {
      tiles,
      score: 4,
      hasWon: false,
      hasShownWinBanner: false,
    });
    saveGameState(storage, {
      tiles: [],
      score: 100,
      hasWon: true,
      hasShownWinBanner: true,
    });

    expect(loadGameState(storage)).toEqual({
      tiles: [],
      score: 100,
      hasWon: true,
      hasShownWinBanner: true,
    });
  });
});

describe("clearGameState", () => {
  it("removes a previously saved game state", () => {
    const storage = new FakeStorage();
    saveGameState(storage, {
      tiles,
      score: 4,
      hasWon: false,
      hasShownWinBanner: false,
    });

    clearGameState(storage);

    expect(loadGameState(storage)).toBeNull();
  });

  it("is a no-op when nothing was saved", () => {
    const storage = new FakeStorage();

    expect(() => clearGameState(storage)).not.toThrow();
    expect(loadGameState(storage)).toBeNull();
  });
});
