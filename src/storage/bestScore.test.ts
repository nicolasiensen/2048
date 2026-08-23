import { describe, expect, it } from "vitest";
import { loadBestScore, saveBestScore } from "./bestScore";

class FakeStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }
}

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
