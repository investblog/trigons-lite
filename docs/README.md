---
type: note
status: active
tags: [architecture, overview]
project: trigons-lite
---

# trigons-lite — dev source of truth

Docs for developers and agents. The user-facing docs are the root
[README.md](../README.md); the live demo is [demo.html](../demo.html).

Contract-first: change the doc here **before** the code, then code.

## What it is

A zero-dependency browser library that renders an animated triangulated (low-poly)
background into a container element. Target: ~2KB gzip.

## Layout

| Path | Role |
|------|------|
| `trigons-lite.js` | The source. The only file you edit. |
| `trigons-lite.min.js` | **Generated** by `npm run build` (terser). Committed and shipped — never hand-edit. |
| `demo.html` | Manual verification surface: effects, directions, colors. |
| `.github/workflows/release.yml` | Release automation. |

Both JS files are listed in `package.json` `files`, so a stale minified build ships
silently. Rebuild whenever the source changes.

## Public API

```js
var tg = TrigonsLite.init('.bg', { colors: [...], size: 100 });
tg.animateIn({ effect: 'scale', direction: 'top', duration: 2000 });
tg.animateOut({ effect: 'fade', direction: 'right', duration: 1500 });
```

- **effects** — `fade` | `scale` | `spin` | `fly`
- **directions** — `top` | `bottom` | `left` | `right` | `center` | `random`
- **size** — number (px) or `'auto'` (viewport / 7)
- **colors** — hex, `rgb()`, `rgba()`

## Constraints

- **Zero dependencies** is a product promise, not an accident. Adding a runtime
  dependency is a decision that belongs in [decisions/](decisions/).
- The source is **ES5, IIFE, `sourceType: 'script'`** — not a module. The ESLint config
  encodes this; do not "modernize" it without a recorded decision.

## Commands

| Command | What |
|---------|------|
| `npm run build` | Minify source → `trigons-lite.min.js` |
| `npm run size` | Report gzip size of the minified output |
| `npx eslint .` | Lint (also runs in the pre-commit gate) |

## See also

- [TODO.md](TODO.md) — backlog index
- [decisions/](decisions/) — ADRs (why, not just what)
- `../.agents/REGISTRY.md` — why the agent environment is set up the way it is
