# Changelog

## 1.1.0 — unreleased

First npm release.

### Added
- `TrigonsLite.pattern(opts)` — static seamless SVG triangle tile for CSS backgrounds,
  no canvas (`size`, `color`, `opacity`, `weight`, `background`, `raw`).
- `mode: 'lines'` — stroke-only line art on the same mesh with a Gaussian light sweep
  (`hot`, `sweep`, `speed`, `weight`, `glow`) and `start()` / `stop()` on the instance.
- `seed` option — deterministic mesh; without it the mesh is random per instance but
  stable across resizes (resize no longer reshuffles triangles).
- `maxDpr` option (default 2) — sharp rendering on high-DPI displays.
- `destroy()` — removes the canvas and all listeners; fixes a `resize` listener leak
  where every `init()` left a permanent `window` handler behind.
- Package metadata for npm: homepage, bugs, keywords; `prepack` build; ESLint + CI.

### Changed
- `init()` returns `null` (not `undefined`) when the selector matches nothing.
- `trigons-lite.min.js` is no longer committed — it is built by `prepack` and shipped
  in the npm tarball / GitHub release only.
- `author` corrected to 301ST; DeeThemes remains credited in the README as the
  inspiration for the original Trigons plugin.

## 1.0.0 — 2026-04-02

Initial release (GitHub only): canvas triangulated backgrounds, 4 entrance/exit
effects × 6 stagger directions, fake directional lighting, CSS custom property
colors, auto sizing, debounced resize.
