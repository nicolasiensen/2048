import "./style.css";
import { applyCanvasSize } from "./canvas/applyCanvasSize";
import { applyMove, createGame } from "./engine";
import type { GameState } from "./engine";
import { directionForKey } from "./input/keyMap";
import { drawBoard } from "./render/drawBoard";
import { loadBestScore, saveBestScore } from "./storage/bestScore";

function main(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  if (!canvas) {
    throw new Error("Canvas element #game-canvas not found");
  }
  const scoreValueEl = document.querySelector<HTMLElement>("#score-value");
  if (!scoreValueEl) {
    throw new Error("Score element #score-value not found");
  }
  const bestScoreValueEl = document.querySelector<HTMLElement>("#best-score-value");
  if (!bestScoreValueEl) {
    throw new Error("Best Score element #best-score-value not found");
  }
  const newGameButton = document.querySelector<HTMLButtonElement>("#new-game-button");
  if (!newGameButton) {
    throw new Error("New Game button #new-game-button not found");
  }

  let state: GameState = createGame();
  let bestScore = loadBestScore(window.localStorage);
  let cssSize = applyCanvasSize(canvas).cssSize;

  const render = (): void => {
    const context = canvas.getContext("2d");
    if (context) drawBoard(context, cssSize, state.tiles);

    scoreValueEl.textContent = String(state.score);
    bestScoreValueEl.textContent = String(bestScore);
  };

  window.addEventListener("resize", () => {
    cssSize = applyCanvasSize(canvas).cssSize;
    render();
  });

  window.addEventListener("keydown", (event) => {
    const direction = directionForKey(event.key);
    if (!direction) return;
    event.preventDefault();

    const result = applyMove(state, direction);
    if (!result.moved) return;

    state = result.state;
    if (state.score > bestScore) {
      bestScore = state.score;
      saveBestScore(window.localStorage, bestScore);
    }
    render();
  });

  newGameButton.addEventListener("click", () => {
    state = createGame();
    render();
  });

  render();
}

main();
