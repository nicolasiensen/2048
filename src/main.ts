import "./style.css";
import { applyCanvasSize } from "./canvas/applyCanvasSize";

function main(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  if (!canvas) {
    throw new Error("Canvas element #game-canvas not found");
  }

  applyCanvasSize(canvas);
  window.addEventListener("resize", () => applyCanvasSize(canvas));
}

main();
