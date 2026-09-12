import type { Direction } from "../engine";

/** Shortest drag distance, in CSS pixels, that counts as a swipe rather than a tap. */
const MIN_SWIPE_DISTANCE = 24;

export interface Point {
  x: number;
  y: number;
}

/**
 * Maps the start/end points of a touch gesture to the Move Direction it
 * represents, or null if the gesture is too short to count as a swipe. The
 * larger of the horizontal/vertical deltas decides the axis.
 */
export function directionForSwipe(start: Point, end: Point): Direction | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.abs(dx) < MIN_SWIPE_DISTANCE && Math.abs(dy) < MIN_SWIPE_DISTANCE) {
    return null;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}
