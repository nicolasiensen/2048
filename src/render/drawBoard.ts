import { GRID_SIZE } from "../engine";
import type { Theme } from "../theme/themes";
import { tileColor } from "./palette";
import type { RenderTile } from "./renderTile";

const CORNER_RADIUS = 6;
const GAP_RATIO = 0.03;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The Grid's gap/cellSize in CSS pixels for one `cssSize`, shared by every Cell/Tile position calculation. */
interface Layout {
  gap: number;
  cellSize: number;
}

/**
 * Draws the Grid background and every Tile onto `context`, in the CSS-pixel
 * coordinate space `applyCanvasSize` pre-scales the context for. Redraws the
 * whole board from scratch every call — no incremental diffing. Each
 * `RenderTile`'s row/col may be mid-tween (floats, not just Cell-aligned
 * integers) and carries its own scale/opacity, so a caller driving an
 * animation loop can redraw every frame with this same function.
 */
export function drawBoard(
  context: CanvasRenderingContext2D,
  cssSize: number,
  tiles: RenderTile[],
  theme: Theme
): void {
  const layout = computeLayout(cssSize);

  context.clearRect(0, 0, cssSize, cssSize);
  fillRoundedRect(
    context,
    { x: 0, y: 0, width: cssSize, height: cssSize },
    theme.board.background
  );

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      fillRoundedRect(context, cellRect(row, col, layout), theme.board.cell);
    }
  }

  for (const tile of tiles) {
    drawTile(context, tile, layout, theme);
  }
}

function computeLayout(cssSize: number): Layout {
  const gap = cssSize * GAP_RATIO;
  const cellSize = (cssSize - gap * (GRID_SIZE + 1)) / GRID_SIZE;
  return { gap, cellSize };
}

function cellRect(row: number, col: number, { gap, cellSize }: Layout): Rect {
  return {
    x: gap + col * (cellSize + gap),
    y: gap + row * (cellSize + gap),
    width: cellSize,
    height: cellSize,
  };
}

function drawTile(
  context: CanvasRenderingContext2D,
  tile: RenderTile,
  layout: Layout,
  theme: Theme
): void {
  if (tile.opacity <= 0) return;

  const rect = scaleRectFromCenter(
    cellRect(tile.row, tile.col, layout),
    tile.scale
  );
  const { background, text } = tileColor(theme, tile.value);

  context.save();
  context.globalAlpha = tile.opacity;

  fillRoundedRect(context, rect, background);

  context.fillStyle = text;
  context.font = `bold ${Math.round(layout.cellSize * fontScale(tile.value) * tile.scale)}px system-ui, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    String(tile.value),
    rect.x + rect.width / 2,
    rect.y + rect.height / 2
  );

  context.restore();
}

/** Scales a Rect around its own center, used to draw a Tile's pop/bounce animation without shifting its position. */
function scaleRectFromCenter(rect: Rect, scale: number): Rect {
  if (scale === 1) return rect;
  const width = rect.width * scale;
  const height = rect.height * scale;
  return {
    x: rect.x + (rect.width - width) / 2,
    y: rect.y + (rect.height - height) / 2,
    width,
    height,
  };
}

/** Shrinks the digits so a Tile's value stays inside its Cell as it grows from 2 to five digits. */
function fontScale(value: number): number {
  const digits = String(value).length;
  if (digits <= 2) return 0.5;
  if (digits === 3) return 0.4;
  return 0.32;
}

function fillRoundedRect(
  context: CanvasRenderingContext2D,
  rect: Rect,
  color: string
): void {
  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.width, rect.height, CORNER_RADIUS);
  context.fillStyle = color;
  context.fill();
}
