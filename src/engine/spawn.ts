import { GRID_SIZE, cellKey } from "./grid";
import type { RandomSource, Tile } from "./types";

export interface SpawnResult {
  tiles: Tile[];
  spawnedTile: Tile | null;
}

function nextTileId(tiles: Tile[]): number {
  return tiles.reduce((max, tile) => Math.max(max, tile.id), 0) + 1;
}

/** Spawns one Tile (value 2 with 90% probability, 4 with 10%) in a random empty Cell. */
export function spawnRandomTile(tiles: Tile[], random: RandomSource): SpawnResult {
  const occupied = new Set(tiles.map((tile) => cellKey(tile.row, tile.col)));
  const emptyCells: { row: number; col: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!occupied.has(cellKey(row, col))) emptyCells.push({ row, col });
    }
  }

  if (emptyCells.length === 0) return { tiles, spawnedTile: null };

  const cell = emptyCells[Math.floor(random() * emptyCells.length)];
  const value = random() < 0.9 ? 2 : 4;
  const spawnedTile: Tile = { id: nextTileId(tiles), value, row: cell.row, col: cell.col };

  return { tiles: [...tiles, spawnedTile], spawnedTile };
}
