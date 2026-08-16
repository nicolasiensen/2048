# 02 — Core game engine (Move/Merge/Score/spawn)

**What to build:** The pure, framework-free game engine module described in ADR-0001 — Move/Merge/Score/spawn/Win/Game-Over logic for the fixed 4×4 Grid, with Tiles carrying stable unique ids and state kept as plain, JSON-serializable data. No DOM or canvas dependency; this is the single seam under automated test per the spec.

**Blocked by:** 01 — Project scaffolding & responsive canvas skeleton

**Status:** ready-for-agent

- [ ] `createGame` returns a fresh 4×4 Grid state with two spawned Tiles
- [ ] `applyMove` slides and merges Tiles correctly in all four directions
- [ ] Each Tile merges at most once per Move
- [ ] A Move that would not change the Grid is a no-op (no spawn, no Score change)
- [ ] Score increases by the resulting Tile's value on every Merge
- [ ] A new Tile (value 2 with 90% probability, value 4 with 10%) spawns in a random empty Cell after any Move that changes the Grid
- [ ] Tile ids remain stable across Moves, including through Merges
- [ ] Win is detected (a flag on state) the first time a 2048 Tile exists, and never unset afterward
- [ ] Game Over is detected when the Grid is full and no Move in any direction would change it
- [ ] Vitest unit tests cover all of the above per the spec's Testing Decisions, using an injectable/seeded random source for spawn tests rather than asserting on true randomness
