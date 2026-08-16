# 03 — Playable grid on canvas via keyboard

**What to build:** Wire the engine from ticket 02 to the canvas skeleton from ticket 01 so the game is playable via keyboard, redrawing the Grid/Tiles instantly on every Move. No animation yet — this ticket makes the game genuinely playable, just without smooth motion.

**Blocked by:** 02 — Core game engine (Move/Merge/Score/spawn)

**Status:** ready-for-agent

- [ ] Arrow key presses call the engine's `applyMove` and redraw the board
- [ ] Tiles render with their numeric value clearly visible
- [ ] Different Tile values are visually distinguished (e.g. by color)
- [ ] A full game is playable start to finish via keyboard alone (moves, merges, spawns all visible)
