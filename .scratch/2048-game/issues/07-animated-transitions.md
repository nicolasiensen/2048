# 07 — Animated tile slide/merge transitions

**What to build:** Replace instant redraws with animated Tile slide/merge transitions, and lock input while an animation is in flight so rapid input can't corrupt state.

**Blocked by:** 06 — Full in-progress game persistence & restore

**Status:** ready-for-agent

- [ ] Tiles visibly slide from their old position to their new position on each Move
- [ ] Merging Tiles animate combining into the resulting Tile
- [ ] Animation is implemented via a hand-rolled `requestAnimationFrame` loop (no animation library / new runtime dependency)
- [ ] Keyboard input during an in-flight animation is ignored until the animation completes
