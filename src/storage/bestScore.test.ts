import { describe, expect, it } from "vitest";
import { loadBestScore, saveBestScore } from "./bestScore";
import { FakeStorage } from "./fakeStorage";

describe("loadBestScore", () => {
  it("defaults to 0 when nothing is stored", () => {
    expect(loadBestScore(new FakeStorage())).toBe(0);
  });

  it("returns a previously saved Best Score", () => {
    const storage = new FakeStorage();
    saveBestScore(storage, 1024);

    expect(loadBestScore(storage)).toBe(1024);
  });

  it("defaults to 0 when the stored value is invalid", () => {
    const storage = new FakeStorage();
    storage.setItem("2048:best-score", "not-a-number");

    expect(loadBestScore(storage)).toBe(0);
  });
});

describe("saveBestScore", () => {
  it("overwrites a previously saved Best Score", () => {
    const storage = new FakeStorage();
    saveBestScore(storage, 100);
    saveBestScore(storage, 200);

    expect(loadBestScore(storage)).toBe(200);
  });
});
