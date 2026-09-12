import type { MoveResult, Tile } from "../engine";

export type TileFrameKind = "move" | "consumed" | "spawn";

/**
 * One Tile's slide/merge/spawn transition for a single Move, from its
 * position before the Move to its position after. Built from the engine's
 * plain `MoveResult` so the animator can tween without knowing anything
 * about Move/Merge semantics itself.
 */
export interface TileFrame {
  id: number;
  value: number;
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  kind: TileFrameKind;
  /** True when this Tile is the surviving half of a Merge — it pops once it reaches its destination. */
  isMergeSurvivor: boolean;
}

/**
 * Builds the per-Tile animation frames for one Move, from the Grid before
 * the Move (`previousTiles`) and the engine's `MoveResult` for it. Pure and
 * framework-free, like the engine itself (see ADR-0001) — this is the seam
 * under automated test for the animation feature; the `requestAnimationFrame`
 * loop that plays these frames back is a rendering concern checked manually.
 *
 * - Tiles that moved (merged or not) get a "move" frame from their old Cell
 *   to their new one; Merge survivors are flagged so they can pop on arrival.
 * - Tiles consumed by a Merge get a "consumed" frame sliding into the same
 *   destination Cell as their survivor, so the animator can fade them out.
 * - A newly spawned Tile gets a "spawn" frame with no movement (from and to
 *   are the same Cell), so the animator can pop it in after the slide.
 */
export function buildAnimationPlan(
  previousTiles: Tile[],
  result: MoveResult
): TileFrame[] {
  const previousById = new Map(previousTiles.map((tile) => [tile.id, tile]));
  const resultById = new Map(result.state.tiles.map((tile) => [tile.id, tile]));
  const survivorIds = new Set(result.merges.map((merge) => merge.survivorId));

  const frames: TileFrame[] = [];

  for (const tile of result.state.tiles) {
    if (result.spawnedTile && tile.id === result.spawnedTile.id) continue;
    const previous = previousById.get(tile.id);
    if (!previous) continue;

    frames.push({
      id: tile.id,
      value: tile.value,
      fromRow: previous.row,
      fromCol: previous.col,
      toRow: tile.row,
      toCol: tile.col,
      kind: "move",
      isMergeSurvivor: survivorIds.has(tile.id),
    });
  }

  for (const merge of result.merges) {
    const consumed = previousById.get(merge.consumedId);
    const survivor = resultById.get(merge.survivorId);
    if (!consumed || !survivor) continue;

    frames.push({
      id: consumed.id,
      value: consumed.value,
      fromRow: consumed.row,
      fromCol: consumed.col,
      toRow: survivor.row,
      toCol: survivor.col,
      kind: "consumed",
      isMergeSurvivor: false,
    });
  }

  if (result.spawnedTile) {
    frames.push({
      id: result.spawnedTile.id,
      value: result.spawnedTile.value,
      fromRow: result.spawnedTile.row,
      fromCol: result.spawnedTile.col,
      toRow: result.spawnedTile.row,
      toCol: result.spawnedTile.col,
      kind: "spawn",
      isMergeSurvivor: false,
    });
  }

  return frames;
}
