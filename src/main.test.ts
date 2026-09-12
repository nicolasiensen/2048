import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "./engine";
import { THEMES, findTheme } from "./theme/themes";

/** Lets individual tests seed the Grid `createGame` starts from, to reach Win/Game-Over states without playing out a full game. */
const engineMocks = vi.hoisted(() => ({
  initialState: null as GameState | null,
}));

vi.mock("./engine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./engine")>();
  return {
    ...actual,
    createGame: (...args: Parameters<typeof actual.createGame>) => {
      if (engineMocks.initialState) {
        const seeded = engineMocks.initialState;
        engineMocks.initialState = null;
        return seeded;
      }
      return actual.createGame(...args);
    },
  };
});

/** A full Grid where every adjacent pair differs, so no Move would produce a Merge. */
function gameOverTiles(): GameState["tiles"] {
  const values = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ];
  const tiles: GameState["tiles"] = [];
  let id = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      tiles.push({ id: ++id, value: values[row][col], row, col });
    }
  }
  return tiles;
}

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
        <select id="theme-select" aria-label="Theme"></select>
        <button id="new-game-button" type="button">New Game</button>
      </header>
      <div id="board-wrap">
        <canvas id="game-canvas"></canvas>
        <div id="win-banner" hidden>
          <p>You Win!</p>
          <button id="keep-playing-button" type="button">Keep Going</button>
        </div>
        <div id="game-over-overlay" hidden>
          <p>Game Over!</p>
          <button id="game-over-new-game-button" type="button">New Game</button>
        </div>
      </div>
    </div>
  </div>
`;

async function loadMain(): Promise<void> {
  vi.resetModules();
  await import("./main");
}

/** Dispatches a touchstart/touchend pair on the canvas simulating a drag of (dx, dy) pixels. */
function fireSwipe(
  canvas: HTMLCanvasElement,
  dx: number,
  dy: number
): TouchEvent {
  const startX = 100;
  const startY = 100;

  canvas.dispatchEvent(
    new TouchEvent("touchstart", {
      touches: [
        { identifier: 1, target: canvas, clientX: startX, clientY: startY },
      ] as unknown as Touch[],
      cancelable: true,
    })
  );

  const touchend = new TouchEvent("touchend", {
    changedTouches: [
      {
        identifier: 1,
        target: canvas,
        clientX: startX + dx,
        clientY: startY + dy,
      },
    ] as unknown as Touch[],
    cancelable: true,
  });
  canvas.dispatchEvent(touchend);

  return touchend;
}

function setUpViewport(): void {
  Object.defineProperty(window, "innerWidth", { value: 800, writable: true });
  Object.defineProperty(window, "innerHeight", { value: 800, writable: true });
  Object.defineProperty(window, "devicePixelRatio", {
    value: 1,
    writable: true,
  });
}

describe("main", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    engineMocks.initialState = null;
  });

  it("sizes the canvas on load and re-sizes it on window resize", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas")!;
    expect(canvas.style.width).toBe("600px");

    Object.defineProperty(window, "innerWidth", { value: 300, writable: true });
    Object.defineProperty(window, "innerHeight", {
      value: 300,
      writable: true,
    });
    window.dispatchEvent(new Event("resize"));

    expect(canvas.style.width).toBe("240px");
  });

  it("throws if the canvas element is missing", async () => {
    document.body.innerHTML = "";

    await expect(loadMain()).rejects.toThrow("#game-canvas");
  });

  it("throws if the score, best score, or new game elements are missing", async () => {
    document.body.innerHTML =
      '<div id="app"><canvas id="game-canvas"></canvas></div>';

    await expect(loadMain()).rejects.toThrow("#score-value");
  });

  it("throws if the theme select is missing", async () => {
    document.body.innerHTML = GAME_MARKUP.replace(
      '<select id="theme-select" aria-label="Theme"></select>',
      ""
    );
    setUpViewport();

    await expect(loadMain()).rejects.toThrow("#theme-select");
  });

  it("consumes arrow key presses as Moves but leaves other keys alone", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const moveKey = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      cancelable: true,
    });
    window.dispatchEvent(moveKey);
    expect(moveKey.defaultPrevented).toBe(true);

    const otherKey = new KeyboardEvent("keydown", {
      key: "a",
      cancelable: true,
    });
    window.dispatchEvent(otherKey);
    expect(otherKey.defaultPrevented).toBe(false);
  });

  it("consumes a swipe on the canvas as a Move but leaves a short drag (tap) alone", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas")!;

    const swipe = fireSwipe(canvas, -60, 0);
    expect(swipe.defaultPrevented).toBe(true);

    const tap = fireSwipe(canvas, 3, -2);
    expect(tap.defaultPrevented).toBe(false);
  });

  it("updates Score on a swipe Merge, just like a keyboard Move", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    engineMocks.initialState = {
      tiles: [
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 2, row: 0, col: 1 },
      ],
      score: 0,
      hasWon: false,
    };
    vi.spyOn(Math, "random").mockReturnValue(0);

    await loadMain();

    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas")!;
    fireSwipe(canvas, -60, 0);

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    expect(scoreValueEl.textContent).toBe("4");
  });

  it("respects the animation-lock, ignoring a second swipe made before the first Move's animation finishes", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    engineMocks.initialState = {
      tiles: [
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 2, row: 0, col: 1 },
        { id: 3, value: 2, row: 0, col: 2 },
        { id: 4, value: 2, row: 0, col: 3 },
      ],
      score: 0,
      hasWon: false,
    };
    vi.spyOn(Math, "random").mockReturnValue(0);

    await loadMain();

    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas")!;
    // First swipe merges [2,2,2,2] -> [4,4] for +8, and a Tile spawns.
    fireSwipe(canvas, -60, 0);
    // Fired synchronously, before the first Move's animation frame runs: if the
    // lock didn't hold, this would merge the two 4s into an 8 for +8 more.
    fireSwipe(canvas, -60, 0);

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    expect(scoreValueEl.textContent).toBe("8");
  });

  it("prevents the page from scrolling while a swipe is in progress on the canvas", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas")!;
    canvas.dispatchEvent(
      new TouchEvent("touchstart", {
        touches: [
          { identifier: 1, target: canvas, clientX: 100, clientY: 100 },
        ] as unknown as Touch[],
        cancelable: true,
      })
    );

    const move = new TouchEvent("touchmove", {
      touches: [
        { identifier: 1, target: canvas, clientX: 80, clientY: 100 },
      ] as unknown as Touch[],
      cancelable: true,
    });
    canvas.dispatchEvent(move);

    expect(move.defaultPrevented).toBe(true);
  });

  it("ignores a second finger landing on the canvas mid-gesture, tracking only the first", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    engineMocks.initialState = {
      tiles: [
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 2, row: 0, col: 1 },
      ],
      score: 0,
      hasWon: false,
    };
    vi.spyOn(Math, "random").mockReturnValue(0);

    await loadMain();

    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas")!;

    // First finger starts a leftward swipe.
    canvas.dispatchEvent(
      new TouchEvent("touchstart", {
        touches: [
          { identifier: 1, target: canvas, clientX: 100, clientY: 100 },
        ] as unknown as Touch[],
        cancelable: true,
      })
    );
    // A second finger (e.g. an accidental palm touch) lands nearby.
    canvas.dispatchEvent(
      new TouchEvent("touchstart", {
        touches: [
          { identifier: 1, target: canvas, clientX: 100, clientY: 100 },
          { identifier: 2, target: canvas, clientX: 150, clientY: 150 },
        ] as unknown as Touch[],
        cancelable: true,
      })
    );
    // The second finger lifts first, right where it landed — should not be
    // read as the end of the first finger's gesture.
    canvas.dispatchEvent(
      new TouchEvent("touchend", {
        changedTouches: [
          { identifier: 2, target: canvas, clientX: 150, clientY: 150 },
        ] as unknown as Touch[],
        cancelable: true,
      })
    );
    // The first finger then lifts after actually swiping left.
    const touchend = new TouchEvent("touchend", {
      changedTouches: [
        { identifier: 1, target: canvas, clientX: 40, clientY: 100 },
      ] as unknown as Touch[],
      cancelable: true,
    });
    canvas.dispatchEvent(touchend);

    expect(touchend.defaultPrevented).toBe(true);
    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    expect(scoreValueEl.textContent).toBe("4");
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

    const bestScoreValueEl =
      document.querySelector<HTMLElement>("#best-score-value")!;
    expect(bestScoreValueEl.textContent).toBe("4096");
  });

  it("updates Score immediately on a Merge and raises a surpassed Best Score, persisting it", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    engineMocks.initialState = {
      tiles: [
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 2, row: 0, col: 1 },
      ],
      score: 0,
      hasWon: false,
    };
    vi.spyOn(Math, "random").mockReturnValue(0);

    await loadMain();

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true })
    );

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    const bestScoreValueEl =
      document.querySelector<HTMLElement>("#best-score-value")!;
    expect(scoreValueEl.textContent).toBe("4");
    expect(bestScoreValueEl.textContent).toBe("4");
    expect(window.localStorage.getItem("2048:best-score")).toBe("4");
  });

  it("lists every Theme in the theme select, defaulting to Midnight", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const themeSelect =
      document.querySelector<HTMLSelectElement>("#theme-select")!;
    expect([...themeSelect.options].map((option) => option.value)).toEqual(
      THEMES.map((theme) => theme.id)
    );
    expect(themeSelect.value).toBe("midnight");
  });

  it("selects a persisted Theme on start", async () => {
    window.localStorage.setItem("2048:theme", "ocean");
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const themeSelect =
      document.querySelector<HTMLSelectElement>("#theme-select")!;
    expect(themeSelect.value).toBe("ocean");
    expect(
      document.documentElement.style.getPropertyValue("--panel-background")
    ).toBe(findTheme("ocean").ui.panelBackground);
  });

  it("persists and applies the chosen Theme when the theme select changes", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const themeSelect =
      document.querySelector<HTMLSelectElement>("#theme-select")!;
    themeSelect.value = "ocean";
    themeSelect.dispatchEvent(new Event("change"));

    expect(window.localStorage.getItem("2048:theme")).toBe("ocean");
    expect(
      document.documentElement.style.getPropertyValue("--panel-background")
    ).toBe(findTheme("ocean").ui.panelBackground);
  });

  it("resets the Grid and Score, but keeps the Best Score, when New Game is clicked", async () => {
    window.localStorage.setItem("2048:best-score", "999");
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    document.querySelector<HTMLButtonElement>("#new-game-button")!.click();

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    const bestScoreValueEl =
      document.querySelector<HTMLElement>("#best-score-value")!;
    expect(scoreValueEl.textContent).toBe("0");
    expect(bestScoreValueEl.textContent).toBe("999");
  });

  it("shows the You Win banner the first time a 2048 Tile appears, and play continues", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    engineMocks.initialState = {
      tiles: [
        { id: 1, value: 1024, row: 0, col: 0 },
        { id: 2, value: 1024, row: 0, col: 1 },
      ],
      score: 0,
      hasWon: false,
    };
    vi.spyOn(Math, "random").mockReturnValue(0);

    await loadMain();

    const winBanner = document.querySelector<HTMLElement>("#win-banner")!;
    expect(winBanner.hidden).toBe(true);

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true })
    );

    expect(winBanner.hidden).toBe(false);

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    expect(scoreValueEl.textContent).toBe("2048");

    const anotherMove = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      cancelable: true,
    });
    window.dispatchEvent(anotherMove);
    expect(anotherMove.defaultPrevented).toBe(true);
  });

  it("does not show the Win banner again once dismissed, even on later Moves", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    engineMocks.initialState = {
      tiles: [
        { id: 1, value: 1024, row: 0, col: 0 },
        { id: 2, value: 1024, row: 0, col: 1 },
      ],
      score: 0,
      hasWon: false,
    };
    vi.spyOn(Math, "random").mockReturnValue(0);

    await loadMain();

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true })
    );

    const winBanner = document.querySelector<HTMLElement>("#win-banner")!;
    expect(winBanner.hidden).toBe(false);

    document.querySelector<HTMLButtonElement>("#keep-playing-button")!.click();
    expect(winBanner.hidden).toBe(true);

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true })
    );
    expect(winBanner.hidden).toBe(true);
  });

  it("shows the Game Over overlay when the Grid is full with no possible Merges", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    engineMocks.initialState = {
      tiles: gameOverTiles(),
      score: 0,
      hasWon: false,
    };

    await loadMain();

    const gameOverOverlay =
      document.querySelector<HTMLElement>("#game-over-overlay")!;
    expect(gameOverOverlay.hidden).toBe(false);
  });

  it("does not show the Game Over overlay while Moves are still possible", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const gameOverOverlay =
      document.querySelector<HTMLElement>("#game-over-overlay")!;
    expect(gameOverOverlay.hidden).toBe(true);
  });

  it("lets a New Game start from the Game Over overlay", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    engineMocks.initialState = {
      tiles: gameOverTiles(),
      score: 42,
      hasWon: false,
    };

    await loadMain();

    document
      .querySelector<HTMLButtonElement>("#game-over-new-game-button")!
      .click();

    const gameOverOverlay =
      document.querySelector<HTMLElement>("#game-over-overlay")!;
    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    expect(gameOverOverlay.hidden).toBe(true);
    expect(scoreValueEl.textContent).toBe("0");
  });

  it("persists the in-progress game state after a Move", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();
    engineMocks.initialState = {
      tiles: [
        { id: 1, value: 2, row: 0, col: 0 },
        { id: 2, value: 2, row: 0, col: 1 },
      ],
      score: 0,
      hasWon: false,
    };
    vi.spyOn(Math, "random").mockReturnValue(0);

    await loadMain();
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true })
    );

    const saved = JSON.parse(window.localStorage.getItem("2048:game-state")!);
    expect(saved.score).toBe(4);
    expect(saved.hasWon).toBe(false);
    expect(saved.hasShownWinBanner).toBe(false);
    expect(saved.tiles).toEqual(expect.any(Array));
  });

  it("restores a saved game state on load, including Tiles, Score, and Win flag", async () => {
    window.localStorage.setItem(
      "2048:game-state",
      JSON.stringify({
        tiles: [{ id: 1, value: 8, row: 2, col: 2 }],
        score: 128,
        hasWon: false,
        hasShownWinBanner: false,
      })
    );
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    expect(scoreValueEl.textContent).toBe("128");
  });

  it("does not re-show the Win banner on restore when it was already shown before reload", async () => {
    window.localStorage.setItem(
      "2048:game-state",
      JSON.stringify({
        tiles: [{ id: 1, value: 2048, row: 0, col: 0 }],
        score: 2048,
        hasWon: true,
        hasShownWinBanner: true,
      })
    );
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const winBanner = document.querySelector<HTMLElement>("#win-banner")!;
    expect(winBanner.hidden).toBe(true);
  });

  it("starts a fresh game when there is no saved state", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    expect(scoreValueEl.textContent).toBe("0");
  });

  it("starts a fresh game when the saved state is corrupted", async () => {
    window.localStorage.setItem("2048:game-state", "not-json{");
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const scoreValueEl = document.querySelector<HTMLElement>("#score-value")!;
    expect(scoreValueEl.textContent).toBe("0");
  });

  it("replaces the saved in-progress state with a fresh game, but keeps the Best Score, when New Game is clicked", async () => {
    window.localStorage.setItem("2048:best-score", "999");
    window.localStorage.setItem(
      "2048:game-state",
      JSON.stringify({
        tiles: [{ id: 1, value: 8, row: 2, col: 2 }],
        score: 128,
        hasWon: false,
        hasShownWinBanner: false,
      })
    );
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();
    document.querySelector<HTMLButtonElement>("#new-game-button")!.click();

    const saved = JSON.parse(window.localStorage.getItem("2048:game-state")!);
    expect(saved.score).toBe(0);
    expect(saved.hasWon).toBe(false);
    expect(saved.hasShownWinBanner).toBe(false);
    expect(window.localStorage.getItem("2048:best-score")).toBe("999");
  });

  it("persists a freshly created game immediately, before any Move is made", async () => {
    document.body.innerHTML = GAME_MARKUP;
    setUpViewport();

    await loadMain();

    const saved = JSON.parse(window.localStorage.getItem("2048:game-state")!);
    expect(saved.score).toBe(0);
    expect(saved.hasWon).toBe(false);
    expect(saved.hasShownWinBanner).toBe(false);
    expect(saved.tiles).toEqual(expect.any(Array));
  });
});
