Status: ready-for-agent

# 2048 Game

## Problem Statement

Players want to play a game of 2048 in their browser without installing anything, creating an account, or needing an internet connection after the page loads. They want their progress and best score to survive a page reload, and they want the game to feel polished (smooth tile movement) rather than static.

## Solution

A single-player 2048 game, built with TypeScript and rendered via HTML canvas, that runs entirely client-side with no backend. The Grid, Tiles, and their slide/merge animations are drawn on canvas; Score, Best Score, and controls are regular HTML/CSS around it. The in-progress game and the all-time Best Score are saved to `localStorage` so a reload resumes play rather than losing it. The game supports both keyboard and touch input.

## User Stories

1. As a player, I want to move all Tiles in a chosen direction using arrow keys, so that I can play the game via keyboard.
2. As a player, I want to move all Tiles via swipe gestures on a touchscreen, so that I can play the game on mobile.
3. As a player, I want two adjacent Tiles of equal value to Merge into one Tile of double the value when they collide during a Move, so that I can build up higher-value Tiles.
4. As a player, I want only one Merge per Tile per Move (a Tile that just merged doesn't merge again in the same Move), so that scoring and movement stay predictable.
5. As a player, I want a new Tile (value 2 or 4, weighted 90%/10%) to appear in a random empty Cell after every Move that changes the Grid, so that the game keeps challenging me.
6. As a player, I want a Move that wouldn't change the Grid (nothing can slide or Merge in that direction) to be ignored — no new Tile spawned, no Score change — so that I don't lose a turn for nothing.
7. As a player, I want to see my current Score update immediately as Merges happen, so that I can track my progress.
8. As a player, I want each Merge to increase my Score by the value of the resulting Tile, so that scoring matches standard 2048 rules.
9. As a player, I want to see my Best Score alongside my current Score, so that I have a target to beat.
10. As a player, I want my Best Score to persist across page reloads and browser sessions, so that it isn't lost when I close the tab.
11. As a player, I want my Best Score to update automatically the moment my current Score surpasses it, so that I don't have to do anything manually.
12. As a player, I want to see a one-time "You Win" banner the first time a 2048 Tile appears on the Grid, so that I'm celebrated for reaching the classic milestone.
13. As a player, I want to keep playing after the Win banner appears, so that I can keep going for higher Tiles.
14. As a player, I want the Win banner to not reappear on later Moves in the same game once shown, so that it doesn't get in my way for the rest of the session.
15. As a player, I want to see a Game Over state when the Grid is full and no Move would produce a Merge in any direction, so that I know the game has ended.
16. As a player, I want to start a new game at any time via a "New Game" button, so that I can restart without reloading the page.
17. As a player, when I start a new game, I want my current Score reset to zero but my Best Score preserved, so that my all-time best isn't lost.
18. As a player, I want Tiles to visually slide and Merge with animation when I make a Move, so that the game feels responsive and polished.
19. As a player, I want my input to be ignored while a Move's animation is still playing, so that rapid key presses or swipes don't corrupt the board state.
20. As a player, I want the game canvas to render sharply on high-DPI/retina screens, so that Tiles and numbers aren't blurry.
21. As a player, I want the game canvas to resize responsively to fit my viewport, so that the game is comfortably playable on both desktop and mobile screen sizes.
22. As a player, I want my in-progress game (Grid and current Score) saved automatically as I play, so that refreshing the page doesn't lose my progress.
23. As a player, I want my in-progress game restored automatically when I reload the page, so that I can pick up exactly where I left off.
24. As a player, I want a fresh game to start automatically when there's no saved in-progress game (e.g. my first visit), so that I'm never shown an empty or broken board.
25. As a player, I want each Tile to display its numeric value clearly, so that I can read the board at a glance.
26. As a player, I want different Tile values to be visually distinguished (e.g. by color), so that I can quickly scan the board for Merge opportunities.
27. As a player, I want the entire game to work with no network or backend calls, so that I can play offline and my data stays on my device.
28. As a developer, I want the game engine (Move/Merge/spawn/Win/Game-Over logic) to be a pure, framework-free module, so that it can be unit tested without a DOM or canvas.
29. As a developer, I want each Tile to carry a stable unique id across Moves, so that the renderer can animate Tile identity correctly, including through Merges (see ADR-0001).
30. As a developer, I want game state to be plain, JSON-serializable data, so that saving to and restoring from `localStorage` requires no custom serialization logic.

## Implementation Decisions

- **Grid**: fixed 4×4, not configurable.
- **Engine module**: a pure, framework-free module (no DOM/canvas dependency) exposing functions to create a fresh game, apply a Move, and query Win/Game Over status. Functions return new state rather than mutating their input (ADR-0001).
- **State shape**: the Grid is represented as a collection of Tiles (`Tile[]`), not `number[][]`. Each Tile has a stable unique id (assigned at spawn, preserved across Moves), a value, and a position. This is deliberate per ADR-0001 — plain number grids can't unambiguously track identity through a Merge.
- **`applyMove` contract**: given the current state and a direction, returns the resulting Tiles (with updated positions/ids), which Tiles merged into which resulting Tile, the Score gained this Move, the newly spawned Tile (if any), and whether the Grid changed at all (a Move that doesn't change the Grid is a no-op — see User Story 6).
- **Win detection**: a `hasWon` flag on game state, set the first time a Tile with value 2048 exists, and never unset afterward. The engine only exposes the flag; showing/dismissing the one-time banner is a rendering concern, not an engine concern.
- **Game Over detection**: derived from current state — true when the Grid is full and no Move in any of the four directions would produce a change (slide or Merge).
- **Scoring**: Score increases by the resulting Tile's value on every Merge; a single Move can trigger multiple Merges, each contributing independently.
- **Spawn rule**: after any Move that changes the Grid, exactly one new Tile spawns in a random empty Cell — value 2 with 90% probability, value 4 with 10% probability.
- **Rendering split**: canvas renders only the Grid and Tiles (position, value, color) and their slide/Merge animations, driven by a hand-rolled `requestAnimationFrame` tween loop (no animation library, keeping runtime dependencies at zero). Score, Best Score, the New Game button, and the Win/Game-Over overlays are HTML/CSS elements positioned around or over the canvas — not drawn on it.
- **Canvas sizing**: responsive to the viewport and scaled for `devicePixelRatio` so rendering stays sharp on high-DPI screens.
- **Input handling**: both keyboard arrow keys and touch/swipe gestures map to the same four Move directions consumed by the engine. Input is ignored while a Move's animation is still in flight, so the board can't be corrupted by rapid input.
- **Persistence**: `localStorage` stores two things — the Best Score (a number) and the full in-progress game state (current Tiles/Grid, current Score). On load, the saved game is restored if present; otherwise a fresh game starts. Starting a "New Game" resets the saved in-progress state but never touches the stored Best Score.
- **Tooling**: TypeScript, built and served via Vite (dev dependency only). Zero/minimal runtime dependencies. `npm run build` produces static output; no hosting is wired up as part of this spec.

## Testing Decisions

- Good tests here assert on the engine's external behavior — given a state and a Move direction, what state comes back (Tiles, Score gained, moved flag, Win/Game-Over flags) — never on internal helper functions or how the engine gets there internally.
- **Seam under test**: the engine module only, per ADR-0001's pure-function design. This is the single seam for this feature — canvas rendering, animation timing, input event wiring, and `localStorage` glue are not unit tested; they're thin/pass-through (state is already plain JSON-serializable data) or require visual/manual verification and are checked by running the game during implementation.
- Test runner: Vitest, colocated with the engine module.
- Coverage to include: sliding/merging in all four directions, chained-Merge scenarios, one-Merge-per-Tile-per-Move enforcement, no-op Moves (User Story 6), spawn value distribution (via an injectable/seeded random source rather than asserting on true randomness), first-time-only Win detection, and Game-Over detection (full Grid with no legal Merge in any direction).
- No prior art exists in this repo yet — this is a from-scratch project, so this test suite sets the precedent for future modules.

## Out of Scope

- Undo/redo of Moves.
- Sound effects.
- Configurable grid size (only 4×4).
- Multiplayer, leaderboards, accounts, or any server-side/backend persistence of scores.
- Hosting/deployment automation (only a local `npm run build` is in scope).

## Further Notes

- `docs/adr/0001-pure-engine-with-tile-identity.md` explains why the engine uses stable Tile ids instead of a plain number grid — read it before touching the engine module.
- `CONTEXT.md` defines the canonical vocabulary (Grid, Cell, Tile, Move, Merge, Score, Best Score, Win, Game Over). Use these terms consistently in code, tests, and commit/PR descriptions — avoid the synonyms it explicitly avoids.
- This is a from-scratch build: there is no existing `src/` tree, no `package.json`, and the repo is not yet git-initialized.
