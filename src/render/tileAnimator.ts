import type { TileFrame } from "./animationPlan";
import type { RenderTile } from "./renderTile";

/** How long Tiles take to slide from their old Cell to their new one. */
const SLIDE_MS = 120;
/** How long the "pop" (Merge survivor bounce / spawn scale-in) plays after the slide lands. */
const POP_MS = 90;
const TOTAL_MS = SLIDE_MS + POP_MS;

/** How far a Merge survivor's scale bounces above 1 at the peak of its pop. */
const SURVIVOR_BOUNCE = 0.18;

export type AnimationFrameCallback = (renderTiles: RenderTile[]) => void;
export type AnimationDoneCallback = () => void;

/**
 * Plays an `AnimationPlan` back via a hand-rolled `requestAnimationFrame`
 * loop — no animation library, per the spec. Only one animation can be in
 * flight at a time; `start` cancels whatever was already playing. `main.ts`
 * consults `animating` to ignore input while a Move's animation is still
 * playing, so rapid input can't corrupt the board.
 */
export class TileAnimator {
  private rafId: number | null = null;

  get animating(): boolean {
    return this.rafId !== null;
  }

  start(
    frames: TileFrame[],
    onFrame: AnimationFrameCallback,
    onDone: AnimationDoneCallback
  ): void {
    this.cancel();
    const startTime = performance.now();

    const step = (now: number): void => {
      const elapsed = now - startTime;
      onFrame(frames.map((frame) => renderTileAt(frame, elapsed)));

      if (elapsed >= TOTAL_MS) {
        this.rafId = null;
        onDone();
        return;
      }
      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  /** Stops whatever animation is in flight without running its `onDone` callback. */
  cancel(): void {
    if (this.rafId === null) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}

function renderTileAt(frame: TileFrame, elapsedMs: number): RenderTile {
  const slideT = easeOutQuad(clamp01(elapsedMs / SLIDE_MS));
  const popT = clamp01((elapsedMs - SLIDE_MS) / POP_MS);

  return {
    id: frame.id,
    value: frame.value,
    row: lerp(frame.fromRow, frame.toRow, slideT),
    col: lerp(frame.fromCol, frame.toCol, slideT),
    scale: scaleFor(frame, popT),
    opacity: opacityFor(frame, slideT, popT),
  };
}

function scaleFor(frame: TileFrame, popT: number): number {
  if (frame.kind === "spawn") return easeOutBack(popT);
  if (frame.isMergeSurvivor)
    return 1 + SURVIVOR_BOUNCE * Math.sin(popT * Math.PI);
  return 1;
}

function opacityFor(frame: TileFrame, slideT: number, popT: number): number {
  if (frame.kind === "consumed") return 1 - slideT;
  if (frame.kind === "spawn") return popT > 0 ? 1 : 0;
  return 1;
}

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/** Overshoots past 1 before settling — gives a spawned Tile a little "pop" as it appears. */
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
