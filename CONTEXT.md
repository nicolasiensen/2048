# 2048

A single-player, client-only puzzle game played on a fixed grid, rendered with HTML canvas.

## Language

**Grid**:
The fixed 4×4 board of Cells that holds the current game state.
_Avoid_: Board, matrix

**Cell**:
A single position in the Grid, either empty or occupied by one Tile.
_Avoid_: Square, spot, slot

**Tile**:
A numbered game piece (2, 4, 8, 16, …) occupying a Cell.
_Avoid_: Block, number, piece

**Move**:
A player action (arrow key or swipe) that shifts every Tile as far as possible in one direction, merging equal Tiles that collide. A new Tile spawns after every Move that changes the Grid.
_Avoid_: Turn, swipe, shift

**Merge**:
The combination of two equal Tiles sliding into each other during a Move, producing one Tile worth double the value.
_Avoid_: Combine, join

**Score**:
The running total of all Tile values produced by Merges during the current game.
_Avoid_: Points

**Best Score**:
The highest Score achieved across all past games on this device, persisted in `localStorage` and shown alongside the current Score.
_Avoid_: High score

**Win**:
The state reached the first time a Tile of value 2048 appears on the Grid. Triggers a one-time banner but does not end the game — play continues.
_Avoid_: Game won, victory

**Game Over**:
The state reached when the Grid is full and no Move would produce a Merge in any direction.
_Avoid_: Loss, defeat
