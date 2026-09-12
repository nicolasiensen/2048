import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, findTheme } from "../theme/themes";
import { FakeStorage } from "./fakeStorage";
import { loadTheme, saveTheme } from "./theme";

describe("loadTheme", () => {
  it("returns DEFAULT_THEME when nothing is stored", () => {
    expect(loadTheme(new FakeStorage())).toBe(DEFAULT_THEME);
  });

  it("returns a previously saved Theme", () => {
    const storage = new FakeStorage();
    saveTheme(storage, findTheme("ocean"));

    expect(loadTheme(storage)).toBe(findTheme("ocean"));
  });

  it("falls back to DEFAULT_THEME when the stored id is unknown", () => {
    const storage = new FakeStorage();
    storage.setItem("2048:theme", "not-a-real-theme");

    expect(loadTheme(storage)).toBe(DEFAULT_THEME);
  });
});
