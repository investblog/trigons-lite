# TrigonsLite

Lightweight animated triangulated backgrounds for the web. Zero dependencies, ~2KB gzip.

![demo](https://raw.githubusercontent.com/nicsuspended/trigons-lite/main/preview.png)

## Features

- Canvas-based triangulated low-poly backgrounds
- 4 entrance/exit animation effects
- 6 stagger directions
- Fake directional lighting via cross-product normals
- Auto-sizing per viewport
- Reads CSS custom properties for colors
- Accepts hex, `rgb()`, `rgba()`
- Responsive with debounced resize
- No dependencies

## Install

**CDN:**
```html
<script src="https://unpkg.com/trigons-lite@1.0.0/trigons-lite.min.js"></script>
```

**npm:**
```bash
npm install trigons-lite
```

**Copy:**

Download `trigons-lite.min.js` (3.8KB, ~2KB gzip) and include it.

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

## API

### `TrigonsLite.init(element, options)`

Returns `{ render, animateIn, animateOut, canvas }`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `colors` | `string[]` | `['#1a1a2e','#16213e','#0f3460']` | 2-3 colors (hex or rgb) |
| `colorVars` | `string[]` | — | CSS custom property names to read |
| `size` | `number\|'auto'` | `'auto'` | Triangle cell size in px. `'auto'` = viewport / 7 |
| `chaos` | `number` | `0.6` | Point jitter amount (0.01 - 1) |
| `depth` | `number` | `0.35` | Fake lighting intensity (0 - 0.8) |
| `startVisible` | `boolean` | `true` | Show triangles immediately before animation |

### `.animateIn(options)` / `.animateOut(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `effect` | `string` | `'scale'` | `'fade'` `'scale'` `'spin'` `'fly'` |
| `direction` | `string` | `'top'` | `'top'` `'bottom'` `'left'` `'right'` `'center'` `'random'` |
| `duration` | `number` | `1500` | Animation duration in ms |
| `stagger` | `number` | `0.6` | Stagger spread (0 - 0.9) |
| `easing` | `string` | `'ease-out'` | `'linear'` `'ease-in'` `'ease-out'` `'ease-in-out'` |
| `onComplete` | `function` | — | Callback when animation finishes |

### `.render()`

Regenerate and redraw (new random pattern).

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
var tg = TrigonsLite.init('#bg', {
  colors: darkColors,
  startVisible: false
});
tg.animateIn({ effect: 'scale', direction: 'top' });

// On theme change:
tg.animateOut({
  effect: 'fade',
  duration: 800,
  onComplete: function() {
    // Re-init with new colors
    tg = TrigonsLite.init('#bg', {
      colors: lightColors,
      startVisible: false
    });
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

## Size Guide

| Viewport | `'auto'` size | Triangles |
|----------|---------------|-----------|
| 375px (mobile) | ~54px | ~50 |
| 768px (tablet) | ~110px | ~100 |
| 1920px (desktop) | ~274px | ~100 |
| 2560px (4K) | ~366px | ~100 |

Consistent visual density across all screen sizes.

## Performance

| | Size |
|---|---|
| Source | 7.8 KB |
| Minified | 3.8 KB |
| **Gzip** | **~2 KB** |

- Canvas rendering (no SVG DOM overhead)
- Grid triangulation (no Delaunay algorithm)
- `requestAnimationFrame` for animations
- Debounced resize handler

## Browser Support

All modern browsers. Canvas 2D API required.

## Credits

Inspired by [Trigons](https://codecanyon.net/item/trigons-d3js-svg-triangles/24889498) by [DeeThemes](https://codecanyon.net/user/DeeThemes) — a feature-rich D3.js/SVG triangulation plugin with 15+ animation effects, gradient color modes, responsive SVG, and PNG export. If you need the full power (Delaunay triangulation, HCL/Lab color spaces, multiple color build modes, SVG output, and the complete animation library), check out the original.

TrigonsLite is a ground-up rewrite focused on minimal footprint: Canvas instead of SVG, grid triangulation instead of Delaunay, fake normals instead of D3 color math. Different tool, same visual DNA.

## License

MIT
