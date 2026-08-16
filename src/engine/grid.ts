import type { Direction } from "./types";

export const GRID_SIZE = 4;

export interface Cell {
  row: number;
  col: number;
}

export function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

const ASCENDING = [0, 1, 2, 3];
const DESCENDING = [3, 2, 1, 0];

/**
 * The Grid's rows or columns for `direction`, each ordered from the wall
 * Tiles slide towards to the far edge — the order the slide/merge algorithm
 * must walk them in.
 */
export function linesForDirection(direction: Direction): Cell[][] {
  const lines: Cell[][] = [];

  if (direction === "left" || direction === "right") {
    const cols = direction === "left" ? ASCENDING : DESCENDING;
    for (const row of ASCENDING) {
      lines.push(cols.map((col) => ({ row, col })));
    }
  } else {
    const rows = direction === "up" ? ASCENDING : DESCENDING;
    for (const col of ASCENDING) {
      lines.push(rows.map((row) => ({ row, col })));
    }
  }

  return lines;
}
