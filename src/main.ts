import "./style.css";
import { applyCanvasSize } from "./canvas/applyCanvasSize";
import { applyMove, createGame } from "./engine";
import type { GameState } from "./engine";
import { directionForKey } from "./input/keyMap";
import { drawBoard } from "./render/drawBoard";

function main(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  if (!canvas) {
    throw new Error("Canvas element #game-canvas not found");
  }

  let state: GameState = createGame();
  let cssSize = applyCanvasSize(canvas).cssSize;

  const render = (): void => {
    const context = canvas.getContext("2d");
    if (!context) return;
    drawBoard(context, cssSize, state.tiles);
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
    render();
  });

  render();
}

main();
