# 06 — Full in-progress game persistence & restore

**What to build:** Persist the complete in-progress game state (Tiles, Score, Win flag) to `localStorage` and restore it on page load, now that the full state shape (including the Win flag from ticket 05) is settled.

**Blocked by:** 05 — Win banner & Game Over overlay

**Status:** ready-for-agent

- [ ] The in-progress game state (Tiles, Score, Win flag) is saved to `localStorage` automatically as the game changes
- [ ] Reloading the page restores the game exactly where it was left off, including whether the Win banner has already been shown
- [ ] A first visit with no saved state starts a fresh game rather than showing a broken or empty board
- [ ] Starting a New Game clears the saved in-progress state without touching the stored Best Score
