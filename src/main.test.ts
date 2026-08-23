import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const GAME_MARKUP = `
  <div id="app">
    <div id="game">
      <header id="scoreboard">
        <div class="score-box">
          <span class="score-label">Score</span>
          <span id="score-value">0</span>
        </div>
        <div class="score-box">
          <span class="score-label">Best</span>
          <span id="best-score-value">0</span>
        </div>
        <button id="new-game-button" type="button">New Game</button>
      </header>
      <canvas id="game-canvas"></canvas>
    </div>
  </div>
`;

async function loadMain(): Promise<void> {
  vi.resetModules();
  await import("./main");
}

function setUpViewport(): void {
  Object.defineProperty(window, "innerWidth", { value: 800, writable: true });
  Object.defineProperty(window, "innerHeight", { value: 800, writable: true });
  Object.defineProperty(window, "devicePixelRatio", { value: 1, writable: true });
}

describe("main", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("sizes the canvas on load and re-sizes it on window resize", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

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

  it("throws if the score, best score, or new game elements are missing", async () => {
    document.body.innerHTML = '<div id="app"><canvas id="game-canvas"></canvas></div>';

    await expect(loadMain()).rejects.toThrow("#score-value");
  });

  it("consumes arrow key presses as Moves but leaves other keys alone", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const moveKey = new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true });
    window.dispatchEvent(moveKey);
    expect(moveKey.defaultPrevented).toBe(true);

    const otherKey = new KeyboardEvent("keydown", { key: "a", cancelable: true });
    window.dispatchEvent(otherKey);
    expect(otherKey.defaultPrevented).toBe(false);
  });

  it("displays the current Score, starting at 0", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    expect(scoreValueEl.textContent).toBe("0");
  });

  it("loads a persisted Best Score on start and displays it", async () => {
    window.localStorage.setItem("2048:best-score", "4096");
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const bestScoreValueEl = document.querySelector<HTMLElement>("#best-score-value")!;
    expect(bestScoreValueEl.textContent).toBe("4096");
  });

  it("updates Score immediately on a Merge and raises a surpassed Best Score, persisting it", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    vi.spyOn(Math, "random").mockReturnValue(0);

    await loadMain();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true }));

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    const bestScoreValueEl = document.querySelector<HTMLElement>("#best-score-value")!;
    expect(scoreValueEl.textContent).toBe("4");
    expect(bestScoreValueEl.textContent).toBe("4");
    expect(window.localStorage.getItem("2048:best-score")).toBe("4");
  });

  it("resets the Grid and Score, but keeps the Best Score, when New Game is clicked", async () => {
    window.localStorage.setItem("2048:best-score", "999");
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    document.querySelector<HTMLButtonElement>("#new-game-button")!.click();

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    const bestScoreValueEl = document.querySelector<HTMLElement>("#best-score-value")!;
    expect(scoreValueEl.textContent).toBe("0");
    expect(bestScoreValueEl.textContent).toBe("999");
  });
});
