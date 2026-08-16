import { cellKey, linesForDirection } from "./grid";
import type { Direction, Merge, Tile } from "./types";

export interface SlideResult {
  tiles: Tile[];
  moved: boolean;
  scoreGained: number;
  merges: Merge[];
}

/**
 * Slides and merges `tiles` one Move in `direction`, without spawning a new
 * Tile. The surviving Tile of a Merge keeps the id/position of whichever
 * Tile in the pair was further along the slide (per ADR-0001, since a
 * Merge's result can't otherwise recover which input Tile it "is").
 */
export function computeMove(tiles: Tile[], direction: Direction): SlideResult {
  const byCell = new Map(tiles.map((tile) => [cellKey(tile.row, tile.col), tile]));
  const resultTiles: Tile[] = [];
  const merges: Merge[] = [];
  let scoreGained = 0;
  let moved = false;

  for (const line of linesForDirection(direction)) {
    const lineTiles = line
      .map((cell) => byCell.get(cellKey(cell.row, cell.col)))
      .filter((tile): tile is Tile => tile !== undefined);

    const slid: { tile: Tile; merged: boolean }[] = [];
    for (const tile of lineTiles) {
      const last = slid[slid.length - 1];
      if (last && !last.merged && last.tile.value === tile.value) {
        const value = last.tile.value * 2;
        merges.push({ survivorId: last.tile.id, consumedId: tile.id });
        scoreGained += value;
        slid[slid.length - 1] = { tile: { ...last.tile, value }, merged: true };
      } else {
        slid.push({ tile, merged: false });
      }
    }

    slid.forEach(({ tile, merged }, index) => {
      const cell = line[index];
      if (tile.row !== cell.row || tile.col !== cell.col || merged) moved = true;
      resultTiles.push({ ...tile, row: cell.row, col: cell.col });
    });
  }

  return { tiles: resultTiles, moved, scoreGained, merges };
}
