---
type: note
status: active
tags: [architecture, overview]
project: trigons-lite
---

# trigons-lite — dev source of truth

Docs for developers and agents. The user-facing docs are the root
[README.md](../README.md); the live demo is [index.html](../index.html)
(also the GitHub Pages site: https://investblog.github.io/trigons-lite/).

Contract-first: change the doc here **before** the code, then code.

## What it is

A zero-dependency browser library that renders an animated triangulated (low-poly)
background into a container element — filled (`fill`) or line-art with a light sweep
(`lines`) — plus a static seamless SVG tile (`TrigonsLite.pattern()`).
Size budget: <= 3328 B min+gzip, gated in CI (see decisions/003).

## Layout

| Path | Role |
|------|------|
| `trigons-lite.js` | The source. The only file you edit. |
| `trigons-lite.min.js` | **Generated** by `prepack` (terser). Gitignored; ships via the npm tarball and release assets only (see decisions/001). |
| `index.html` | Manual verification surface and the Pages site: modes, effects, themes, pattern swatches. |
| `.github/workflows/ci.yml` | Lint + build + size gate on push/PR. |
| `.github/workflows/release.yml` | OIDC npm publish (provenance) + GitHub release on tag. |
| `.github/workflows/bootstrap-publish.yml` | One-time prerelease publish to create the package on npm. |

## Public API

```js
var tg = TrigonsLite.init('.bg', { colors: [...], size: 100 });   // null if not found
tg.animateIn({ effect: 'scale', direction: 'top', duration: 2000 });
tg.animateOut({ effect: 'fade', direction: 'right', duration: 1500 });
tg.destroy();                                    // canvas + all listeners removed
document.body.style.backgroundImage = TrigonsLite.pattern({ size: 24 });
```

- **modes** — `fill` (default) | `lines` (adds `hot`, `sweep`, `speed`, `weight`,
  `glow` options and `start()`/`stop()`; animateIn/Out fade the whole layer)
- **effects** — `fade` | `scale` | `spin` | `fly` (fill mode)
- **directions** — `top` | `bottom` | `left` | `right` | `center` | `random`
- **size** — number (px) or `'auto'` (viewport / 7)
- **colors** — hex, `rgb()`, `rgba()`; `colorVars` reads CSS custom properties
- **seed** — pins the mesh (geometry only, not animation randomness); without it
  the mesh is random per instance but stable across resizes
- **maxDpr** — backing-store DPR cap, default 2

## Constraints

- **Zero dependencies** is a product promise, not an accident. Adding a runtime
  dependency is a decision that belongs in [decisions/](decisions/).
- The source is **ES5, IIFE, `sourceType: 'script'`** — not a module. The ESLint config
  encodes this; do not "modernize" it without a recorded decision.

## Commands

| Command | What |
|---------|------|
| `npm run build` | Minify source → `trigons-lite.min.js` |
| `npm run size` | Print gzip size of the minified output (cross-platform, node zlib) |
| `npm run lint` | Lint (also runs in the pre-commit gate) |

## See also

- [TODO.md](TODO.md) — backlog index
- [decisions/](decisions/) — ADRs (why, not just what)
- `../.agents/REGISTRY.md` — why the agent environment is set up the way it is
