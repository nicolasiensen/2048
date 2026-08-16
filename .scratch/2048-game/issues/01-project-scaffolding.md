# 01 — Project scaffolding & responsive canvas skeleton

**What to build:** A TypeScript + Vite + Vitest project skeleton with zero runtime dependencies, and a `<canvas>` element that renders responsively and is scaled for `devicePixelRatio`. Nothing meaningful needs to be drawn on it yet — this ticket establishes the sizing math every later rendering ticket builds on.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `npm install` sets up a TypeScript + Vite + Vitest project with zero runtime dependencies
- [ ] `npm run dev` serves a page with a `<canvas>` element visible in the browser
- [ ] `npm run build` produces static output with no errors
- [ ] `npm test` runs successfully (a trivial smoke test is acceptable at this stage)
- [ ] The canvas resizes responsively to fit the viewport
- [ ] The canvas is scaled for `devicePixelRatio` so rendering stays sharp on high-DPI screens
