---
type: note
status: active
tags: [brand, mark]
project: trigons-lite
---

# The trigons-lite mark

A low-poly gem: 10 vertices, 11 filled facets, one blue ramp, hairline seams.

| File | What |
|---|---|
| `mark.svg` | The mark, 64 × 64 viewBox. Generated — do not edit by hand. |
| `mark.mjs` | Its single source: `node docs/brand/mark.mjs > docs/brand/mark.svg` |

**Origin.** The library does not draw this mark; it renders to canvas and gives no SVG back. It was drawn by
hand as the library's icon in the wpps.ru catalog (2026-11-18), from the library's own default colors. That copy
lives in `wpps.ru/src/brand/libs/trigons-lite.svg` and is byte-identical to `mark.svg`.

## The recipe

### 1. Geometry: an irregular gem, three rows deep

Ten points on a 64-unit square, in loose rows: a crown (`a b c`), a girdle (`d e`), a pavilion (`f g h`) and a
culet (`i j`). The hull reaches 4…60, filling the square without touching it.

```
a(6,10)      b(30,4)        c(58,12)
     d(20,30)      e(44,28)
f(4,50)       g(32,46)       h(60,44)
     i(16,60)        j(48,60)
```

Keep it irregular. Equal spacing reads as a tiled pattern, which `pattern()` already is; a few units of jitter
make it read as a cut stone. The top edge also tilts: `b` is the highest point and `a`, `c` drop away from it.

### 2. Palette: one ramp from the library's own defaults

| Step | Color | Source |
|---|---|---|
| 0 | `#16213e` | `colors` default, middle |
| 1 | `#0f3460` | `colors` default, last |
| 2 | `#1f4f8a` | between, by eye |
| 3 | `#2a4f8f` | between, by eye |
| 4 | `#3d6fc0` | between, by eye |
| 5 | `#5b7fd6` | between, by eye |
| 6 | `#6f8ee8` | between, by eye |
| 7 | `#8fa2ff` | `pattern()` stroke default |

The ends tie the mark to the library: a user who keeps the defaults gets a background in the same family as the
icon. Only steps 2–6 are invented.

### 3. Light: from the top centre

Assign a ramp step to each facet as if the light falls from above the crown's apex:

| Facet | Step | Why |
|---|---|---|
| `b e d` | 7 | right under the apex — the highlight |
| `d e g` | 6 | the table, facing the viewer |
| `b c e`, `g h j` | 5 | right side, turned toward the light |
| `a b d`, `f g i` | 4 | left side, turned toward the light |
| `d g f` | 3 | left flank |
| `e h g` | 2 | right flank |
| `c h e`, `g j i` | 1 | the right edge and the culet, in shadow |
| `a d f` | 0 | the left edge, the deepest shadow |

Two rules make it read as a stone rather than a mosaic:

- **No two neighbours share a step, and most differ by three or more.** Of the 14 shared edges, 11 jump three
  steps or more; the three one-step pairs (`b e d`/`d e g`, `c h e`/`e h g`, `d g f`/`f g i`) are held apart by
  the seam. Facets equal in value merge into one flat shape.
- **The darkest facets are on the silhouette, the brightest inside it.** That gives the volume. Flip it and the
  gem looks hollow.

### 4. Seams: a hairline in the brightest color

`stroke="#8fa2ff"`, `stroke-width=".6"`, `stroke-linejoin="round"` on every facet. It echoes the `lines`
mode's edge glow, and it keeps the dark facets separate where two shadows meet.

## Variations

- **Another brand.** Replace step 0–1 with the user's `colors` and step 7 with their accent, then interpolate
  2–6. Keep the facet → step table: the light, not the hues, makes the shape.
- **Favicon size (16–32 px).** Drop the seams. Below ~32 px a 0.6-unit stroke turns to mush, and the steps
  alone still separate the facets.
- **One color.** Use the steps as opacity of a single color (step / 7, with a floor of ~0.25) on a transparent
  background.
- **Light backgrounds** need no change: the ramp's dark end is the silhouette there, too.

## Constraints

No `<style>`, no `class`, no `currentColor`, no text and no animation. The mark is used where those break: inside
an SVG sprite `<symbol>` (a `<style>` there is global CSS for the whole page) and rasterised by resvg for social
cards. Plain fills and strokes render the same in a browser, in a sprite and in resvg.
