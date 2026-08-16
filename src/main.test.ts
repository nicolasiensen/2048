import { describe, expect, it, vi } from "vitest";

async function loadMain(): Promise<void> {
  vi.resetModules();
  await import("./main");
}

describe("main", () => {
  it("sizes the canvas on load and re-sizes it on window resize", async () => {
    document.body.innerHTML = '<div id="app"><canvas id="game-canvas"></canvas></div>';
    Object.defineProperty(window, "innerWidth", { value: 800, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, writable: true });
    Object.defineProperty(window, "devicePixelRatio", { value: 1, writable: true });

    await loadMain();

    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas")!;
    expect(canvas.style.width).toBe("600px");

    Object.defineProperty(window, "innerWidth", { value: 300, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 300, writable: true });
    window.dispatchEvent(new Event("resize"));

    expect(canvas.style.width).toBe("240px");
  });

  it("throws if the canvas element is missing", async () => {
    document.body.innerHTML = "";

    await expect(loadMain()).rejects.toThrow("#game-canvas");
  });

  it("consumes arrow key presses as Moves but leaves other keys alone", async () => {
    document.body.innerHTML = '<div id="app"><canvas id="game-canvas"></canvas></div>';
    Object.defineProperty(window, "innerWidth", { value: 800, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, writable: true });
    Object.defineProperty(window, "devicePixelRatio", { value: 1, writable: true });

    await loadMain();

    const moveKey = new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true });
    window.dispatchEvent(moveKey);
    expect(moveKey.defaultPrevented).toBe(true);

    const otherKey = new KeyboardEvent("keydown", { key: "a", cancelable: true });
    window.dispatchEvent(otherKey);
    expect(otherKey.defaultPrevented).toBe(false);
  });
});
