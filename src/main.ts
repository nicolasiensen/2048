import "./style.css";
import { applyCanvasSize } from "./canvas/applyCanvasSize";
import { applyMove, createGame, isGameOver } from "./engine";
import type { GameState } from "./engine";
import { directionForKey } from "./input/keyMap";
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

  const savedGameState = loadGameState(window.localStorage);
  let state: GameState = savedGameState ?? createGame();
  let hasShownWinBanner = savedGameState?.hasShownWinBanner ?? false;
  let bestScore = loadBestScore(window.localStorage);
  let cssSize = applyCanvasSize(canvas).cssSize;
  const animator = new TileAnimator();

  const persistGameState = (): void => {
    saveGameState(window.localStorage, { ...state, hasShownWinBanner });
  };

  const drawStaticBoard = (): void => {
    const context = canvas.getContext("2d");
    if (context) drawBoard(context, cssSize, toRenderTiles(state.tiles));
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

  window.addEventListener("keydown", (event) => {
    const direction = directionForKey(event.key);
    if (!direction) return;
    event.preventDefault();
    if (animator.animating) return;

    const previousTiles = state.tiles;
    const result = applyMove(state, direction);
    if (!result.moved) return;

    state = result.state;
    if (state.score > bestScore) {
      bestScore = state.score;
      saveBestScore(window.localStorage, bestScore);
    }
    updateHud();
    persistGameState();

    const plan = buildAnimationPlan(previousTiles, result);
    animator.start(
      plan,
      (renderTiles) => {
        const context = canvas.getContext("2d");
        if (context) drawBoard(context, cssSize, renderTiles);
      },
      drawStaticBoard
    );
  });

  const startNewGame = (): void => {
    animator.cancel();
    state = createGame();
    hasShownWinBanner = false;
    winBannerEl.hidden = true;
    clearGameState(window.localStorage);
    render();
    persistGameState();
  };

  newGameButton.addEventListener("click", startNewGame);
  gameOverNewGameButton.addEventListener("click", startNewGame);

  keepPlayingButton.addEventListener("click", () => {
    winBannerEl.hidden = true;
  });

  render();
  persistGameState();
}

main();
