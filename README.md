# TrigonsLite

[![npm](https://img.shields.io/npm/v/trigons-lite)](https://www.npmjs.com/package/trigons-lite)
[![license](https://img.shields.io/npm/l/trigons-lite)](LICENSE)

Lightweight animated triangulated backgrounds for the web. Zero dependencies, ~3KB gzip.

**Live demo →** https://investblog.github.io/trigons-lite/

## Features

- Two render modes: filled low-poly mesh (`fill`) and line art with a light sweep (`lines`)
- 4 entrance/exit animation effects × 6 stagger directions
- Static seamless SVG pattern for CSS — no canvas at all
- Deterministic mesh with `seed`; stable across resizes either way
- Sharp on retina (DPR-aware rendering, capped at `maxDpr`)
- Fake directional lighting via cross-product normals
- Reads CSS custom properties for colors; accepts hex, `rgb()`, `rgba()`
- Proper lifecycle: `destroy()` removes the canvas and every listener
- No dependencies

## Install

```
npm install trigons-lite
```

Or straight from the CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/trigons-lite@1/trigons-lite.min.js"></script>
```

There is no module build — it is a browser script exposing a single global,
`TrigonsLite`. `main` points at the unminified source; ship `trigons-lite.min.js`.

## Quick Start

```html
<div id="bg" style="position:fixed;inset:0;z-index:0"></div>

<script src="trigons-lite.min.js"></script>
<script>
  TrigonsLite.init('#bg', {
    colors: ['#0a0a0f', '#1a1a24', '#8e7cff'],
    size: 'auto',
    depth: 0.4,
    startVisible: false
  }).animateIn({
    effect: 'scale',
    direction: 'top',
    duration: 2000
  });
</script>
```

## Modes

**fill** (default) — filled low-poly triangles with fake directional lighting.
A static painting: nothing runs between animations.

**lines** — the same triangulated mesh drawn as strokes, with a soft light band
sweeping diagonally across the edges. Runs a `requestAnimationFrame` loop
(paused automatically when the tab is hidden; `stop()` pauses it manually).

```javascript
var tg = TrigonsLite.init('#bg', {
  mode: 'lines',
  colors: ['#33417c', '#6478da', '#b3bfff'],
  hot: '#e4e9ff',   // sweep color
  sweep: 1,         // sweep speed; 0 = static line art, no loop
  weight: 1,        // line width multiplier
  glow: true        // wide dim stroke under the bright one
});
tg.stop();          // park the loop
tg.start();         // resume
```

In lines mode `animateIn`/`animateOut` fade the whole layer (per-triangle
effects apply to fill mode).

## API

### `TrigonsLite.init(element, options)`

Returns `{ render, animateIn, animateOut, start, stop, destroy, canvas }`,
or `null` if the element is not found.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | `string` | `'fill'` | `'fill'` or `'lines'` |
| `colors` | `string[]` | `['#1a1a2e','#16213e','#0f3460']` | 2-3 colors (hex or rgb) |
| `colorVars` | `string[]` | — | CSS custom property names to read |
| `size` | `number\|'auto'` | `'auto'` | Triangle cell size in px. `'auto'` = viewport / 7 |
| `chaos` | `number` | `0.6` | Point jitter amount (0.01 - 1) |
| `depth` | `number` | `0.35` | Fake lighting intensity (0 - 0.8), fill mode |
| `seed` | `number` | — | Pins the mesh: same seed ⇒ same triangles, every load |
| `startVisible` | `boolean` | `true` | Show immediately before any animation |
| `maxDpr` | `number` | `2` | Device pixel ratio cap |
| `hot` | `string` | `'#e4e9ff'` | Sweep color (lines) |
| `sweep` | `number` | `1` | Sweep speed; `0` disables the loop (lines) |
| `speed` | `number` | `1` | Global animation rate (lines) |
| `weight` | `number` | `1` | Line width multiplier (lines) |
| `glow` | `boolean` | `true` | Soft under-stroke on the sweep (lines) |

### `.animateIn(options)` / `.animateOut(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `effect` | `string` | `'scale'` | `'fade'` `'scale'` `'spin'` `'fly'` (fill mode) |
| `direction` | `string` | `'top'` | `'top'` `'bottom'` `'left'` `'right'` `'center'` `'random'` |
| `duration` | `number` | `1500` | Animation duration in ms |
| `stagger` | `number` | `0.6` | Stagger spread (0 - 0.9) |
| `easing` | `string` | `'ease-out'` | `'linear'` `'ease-in'` `'ease-out'` `'ease-in-out'` |
| `onComplete` | `function` | — | Callback when animation finishes |

### `.render()`

Redraw with a new random pattern (unless `seed` was set — then the mesh is
pinned and `render()` only re-reads colors). Resizing never reshuffles the
mesh; it just extends it.

### `.start()` / `.stop()`

Resume / pause the lines-mode loop. No-ops in fill mode.

### `.destroy()`

Stop everything, remove the canvas and all listeners. Call it before
re-initializing (e.g. on theme switch).

## Static pattern — no canvas at all

`TrigonsLite.pattern()` returns a seamless SVG tile as a CSS `url(...)` value:

```javascript
document.body.style.backgroundImage =
  TrigonsLite.pattern({ size: 24, color: '#8e7cff', opacity: 0.12 });
```

| Option | Default | Description |
|--------|---------|-------------|
| `size` | `24` | Cell size in px |
| `color` | `'#8fa2ff'` | Stroke color |
| `opacity` | `0.12` | Stroke opacity (the contrast knob) |
| `weight` | `1` | Stroke width |
| `background` | `null` | Optional solid fill behind the lines |
| `raw` | `false` | Return bare `<svg>` markup instead of `url(...)` |

## Deterministic rendering

Pass `seed` to get the exact same mesh on every load — useful for visual
regression tests or matching a design comp:

```javascript
TrigonsLite.init('#bg', { seed: 301 });
```

Without a seed each instance draws a random mesh once and keeps it stable
across resizes. Animation randomness (spin angles, `direction: 'random'`)
is not seeded — determinism covers the geometry.

## Effects

**fade** - Simple opacity transition

**scale** - Scale from zero with slight rotation per triangle

**spin** - Scale + aggressive rotation (low-poly explosion)

**fly** - Triangles fly in from the specified direction

## Using CSS Custom Properties

Read colors directly from your site's design tokens:

```javascript
TrigonsLite.init('#bg', {
  colorVars: ['--color-bg', '--color-surface', '--color-accent']
});
```

The element's computed styles are checked first, then `:root`.

## Dark / Light Theme Switching

```javascript
var tg = TrigonsLite.init('#bg', { colors: darkColors, startVisible: false });
tg.animateIn({ effect: 'scale', direction: 'top' });

// On theme change:
tg.animateOut({
  effect: 'fade',
  duration: 800,
  onComplete: function() {
    tg.destroy();
    tg = TrigonsLite.init('#bg', { colors: lightColors, startVisible: false });
    tg.animateIn({ effect: 'fade', duration: 800 });
  }
});
```

## Reduced Motion

Respect user preferences:

```javascript
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  tg.animateIn({ effect: 'scale', direction: 'top' });
}
```

## Performance

| | Size |
|---|---|
| Minified | ~6 KB |
| **Gzip** | **~3.2 KB** |

- Canvas rendering (no SVG DOM overhead)
- Grid triangulation (no Delaunay algorithm)
- Lines mode: edges batched into ~11 stroke calls per frame, cached gradient,
  loop parked when the tab is hidden
- Debounced resize handler; DPR-capped backing store

## The family — 3 · 6 · 8

TrigonsLite is the origin of a small family of zero-dependency polygon
backgrounds, one per shape:

- **3 — [trigons-lite](https://github.com/investblog/trigons-lite)** (this library): triangles, filled low-poly + line art
- **6 — [hexagons-lite](https://github.com/investblog/hexagons)**: honeycombs with a brand-aware auto-palette
- **8 — [octagons](https://github.com/investblog/octagons)**: octagon line art in pseudo-3D depth

Same API spirit everywhere: one global, `init()` / `pattern()`, zero
dependencies, a few KB each.

## Browser Support

All modern browsers. Canvas 2D API required.

## Credits

Built by [301ST](https://301.st).

Inspired by **Trigons** by **DeeThemes** — a feature-rich D3.js/SVG
triangulation plugin with 15+ animation effects, gradient color modes,
responsive SVG, and PNG export. If you need the full power (Delaunay
triangulation, HCL/Lab color spaces, multiple color build modes, SVG output,
and the complete animation library), look for the original on
Envato/CodeCanyon. TrigonsLite is a ground-up rewrite focused on minimal
footprint: Canvas instead of SVG, grid triangulation instead of Delaunay,
fake normals instead of D3 color math. Different tool, same visual DNA.

## License

MIT © [301ST](https://301.st)
