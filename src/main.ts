import "./style.css";
import {
  trackGameOver,
  trackNewBestScore,
  trackNewGame,
} from "./analytics/analytics";
import { applyCanvasSize } from "./canvas/applyCanvasSize";
import { applyMove, createGame, isGameOver } from "./engine";
import type { Direction, GameState } from "./engine";
import { directionForKey } from "./input/keyMap";
import { directionForSwipe } from "./input/swipe";
import type { Point } from "./input/swipe";
import { buildAnimationPlan } from "./render/animationPlan";
import { drawBoard } from "./render/drawBoard";
import { toRenderTiles } from "./render/renderTile";
import { TileAnimator } from "./render/tileAnimator";
import { loadBestScore, saveBestScore } from "./storage/bestScore";
import {
  clearGameState,
  loadGameState,
  saveGameState,
} from "./storage/gameState";
import { loadTheme, saveTheme } from "./storage/theme";
import { applyTheme } from "./theme/applyTheme";
import { THEMES } from "./theme/themes";
import type { Theme } from "./theme/themes";

function main(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  if (!canvas) {
    throw new Error("Canvas element #game-canvas not found");
  }
  const scoreValueEl = document.querySelector<HTMLElement>("#score-value");
  if (!scoreValueEl) {
    throw new Error("Score element #score-value not found");
  }
  const bestScoreValueEl =
    document.querySelector<HTMLElement>("#best-score-value");
  if (!bestScoreValueEl) {
    throw new Error("Best Score element #best-score-value not found");
  }
  const newGameButton =
    document.querySelector<HTMLButtonElement>("#new-game-button");
  if (!newGameButton) {
    throw new Error("New Game button #new-game-button not found");
  }
  const winBannerEl = document.querySelector<HTMLElement>("#win-banner");
  if (!winBannerEl) {
    throw new Error("Win banner #win-banner not found");
  }
  const keepPlayingButton = document.querySelector<HTMLButtonElement>(
    "#keep-playing-button"
  );
  if (!keepPlayingButton) {
    throw new Error("Keep Playing button #keep-playing-button not found");
  }
  const gameOverEl = document.querySelector<HTMLElement>("#game-over-overlay");
  if (!gameOverEl) {
    throw new Error("Game Over overlay #game-over-overlay not found");
  }
  const gameOverNewGameButton = document.querySelector<HTMLButtonElement>(
    "#game-over-new-game-button"
  );
  if (!gameOverNewGameButton) {
    throw new Error(
      "Game Over New Game button #game-over-new-game-button not found"
    );
  }
  const themeSelect =
    document.querySelector<HTMLSelectElement>("#theme-select");
  if (!themeSelect) {
    throw new Error("Theme select #theme-select not found");
  }

  const savedGameState = loadGameState(window.localStorage);
  let state: GameState = savedGameState ?? createGame();
  let hasShownWinBanner = savedGameState?.hasShownWinBanner ?? false;
  let bestScore = loadBestScore(window.localStorage);
  let theme: Theme = loadTheme(window.localStorage);
  let cssSize = applyCanvasSize(canvas).cssSize;
  const animator = new TileAnimator();

  for (const candidate of THEMES) {
    const option = document.createElement("option");
    option.value = candidate.id;
    option.textContent = candidate.name;
    themeSelect.append(option);
  }
  themeSelect.value = theme.id;

  const persistGameState = (): void => {
    saveGameState(window.localStorage, { ...state, hasShownWinBanner });
  };

  const drawStaticBoard = (): void => {
    const context = canvas.getContext("2d");
    if (context) drawBoard(context, cssSize, toRenderTiles(state.tiles), theme);
  };

  const updateHud = (): void => {
    scoreValueEl.textContent = String(state.score);
    bestScoreValueEl.textContent = String(bestScore);

    if (state.hasWon && !hasShownWinBanner) {
      hasShownWinBanner = true;
      winBannerEl.hidden = false;
    }
    gameOverEl.hidden = !isGameOver(state);
  };

  const render = (): void => {
    drawStaticBoard();
    updateHud();
  };

  window.addEventListener("resize", () => {
    cssSize = applyCanvasSize(canvas).cssSize;
    render();
  });

  const dispatchMove = (direction: Direction): void => {
    if (animator.animating) return;

    const previousTiles = state.tiles;
    const result = applyMove(state, direction);
    if (!result.moved) return;

    state = result.state;
    if (state.score > bestScore) {
      bestScore = state.score;
      saveBestScore(window.localStorage, bestScore);
      trackNewBestScore(bestScore);
    }
    if (isGameOver(state)) {
      trackGameOver(state.score);
    }
    updateHud();
    persistGameState();

    const plan = buildAnimationPlan(previousTiles, result);
    animator.start(
      plan,
      (renderTiles) => {
        const context = canvas.getContext("2d");
        if (context) drawBoard(context, cssSize, renderTiles, theme);
      },
      drawStaticBoard
    );
  };

  themeSelect.addEventListener("change", () => {
    theme =
      THEMES.find((candidate) => candidate.id === themeSelect.value) ?? theme;
    saveTheme(window.localStorage, theme);
    applyTheme(theme);
    if (!animator.animating) drawStaticBoard();
  });

  window.addEventListener("keydown", (event) => {
    const direction = directionForKey(event.key);
    if (!direction) return;
    event.preventDefault();
    dispatchMove(direction);
  });

  // Tracks the one finger whose gesture we're following, by touch identifier,
  // so a second finger landing on the canvas (e.g. an accidental palm touch)
  // can't be mistaken for the end of the first finger's swipe.
  let activeTouch: (Point & { id: number }) | null = null;

  const findTouch = (touches: TouchList, id: number): Touch | null =>
    Array.from(touches).find((touch) => touch.identifier === id) ?? null;

  canvas.addEventListener(
    "touchstart",
    (event) => {
      if (activeTouch) return;
      const touch = event.touches[0];
      if (!touch) return;
      activeTouch = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
      };
    },
    { passive: true }
  );

  canvas.addEventListener(
    "touchmove",
    (event) => {
      if (activeTouch && findTouch(event.touches, activeTouch.id)) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  canvas.addEventListener("touchend", (event) => {
    if (!activeTouch) return;
    const touch = findTouch(event.changedTouches, activeTouch.id);
    if (!touch) return;

    const start = activeTouch;
    activeTouch = null;

    const direction = directionForSwipe(start, {
      x: touch.clientX,
      y: touch.clientY,
    });
    if (!direction) return;
    event.preventDefault();
    dispatchMove(direction);
  });

  canvas.addEventListener("touchcancel", (event) => {
    if (activeTouch && findTouch(event.changedTouches, activeTouch.id)) {
      activeTouch = null;
    }
  });

  const startNewGame = (): void => {
    animator.cancel();
    state = createGame();
    hasShownWinBanner = false;
    winBannerEl.hidden = true;
    clearGameState(window.localStorage);
    render();
    persistGameState();
    trackNewGame();
  };

  newGameButton.addEventListener("click", startNewGame);
  gameOverNewGameButton.addEventListener("click", startNewGame);

  keepPlayingButton.addEventListener("click", () => {
    winBannerEl.hidden = true;
  });

  applyTheme(theme);
  render();
  persistGameState();
}

main();
