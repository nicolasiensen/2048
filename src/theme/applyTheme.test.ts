import { describe, expect, it } from "vitest";
import { applyTheme } from "./applyTheme";
import { findTheme } from "./themes";

describe("applyTheme", () => {
  it("sets every chrome color as a CSS custom property on the given root", () => {
    const root = document.createElement("div");

    applyTheme(findTheme("midnight"), root);

    expect(root.style.getPropertyValue("--page-background")).toBe("#0f1117");
    expect(root.style.getPropertyValue("--panel-background")).toBe("#1c1f2b");
    expect(root.style.getPropertyValue("--button-background")).toBe("#4c1d95");
    expect(root.style.getPropertyValue("--win-banner-text")).toBe("#1c1f2b");
    expect(root.style.getPropertyValue("--game-over-background")).toBe(
      "rgb(15 17 23 / 0.85)"
    );
  });

  it("overwrites a previously applied Theme's properties", () => {
    const root = document.createElement("div");

    applyTheme(findTheme("midnight"), root);
    applyTheme(findTheme("ocean"), root);

    expect(root.style.getPropertyValue("--panel-background")).toBe("#01579b");
  });
});
