import type { Tile } from "../engine";

/**
 * A Tile as `drawBoard` actually paints it: a Cell position that may be
 * mid-tween (hence floats, not the Grid's integer row/col), plus a scale and
 * opacity for pop/fade effects. Static boards (no animation in flight) use
 * `toRenderTiles` to lift plain Tiles into this shape at rest.
 */
export interface RenderTile {
  id: number;
  value: number;
  row: number;
  col: number;
  scale: number;
  opacity: number;
}

/** Lifts a Grid's Tiles into `RenderTile`s at rest — full scale, fully opaque, no tween in flight. */
export function toRenderTiles(tiles: Tile[]): RenderTile[] {
  return tiles.map((tile) => ({ ...tile, scale: 1, opacity: 1 }));
}
