---
type: plan
status: active
created: 2026-08-09
project: trigons-lite
goal: Publish trigons-lite to npm as the flagship of the 301.st background-library family
---

# trigons-lite → npm (v1.1.0)

## Context (recon summary, 2026-08-09)

Three sibling libraries, one family, promoting https://301.st:

| | trigons-lite (this) | octagons (`W:\Projects\octagons-lite`) | hexagons-lite (`W:\Projects\hexagons`) |
|---|---|---|---|
| npm | **not published** (tag v1.0.0, GH release only; npm/unpkg docs deliberately removed in `ae393cc`) | published: 0.1.0–0.1.2 | not published, no remote yet |
| Modes | 1 (filled mesh + animateIn/Out) | `field`, `lattice`, static `pattern()` | `field`, `hive`, `fill` (ported FROM trigons), `pattern()`, auto-palette |
| Lifecycle | `render/animateIn/animateOut` only; **resize listener leaks**, no `destroy()`, no DPR (blurry on retina), mesh re-randomises on resize | full: `set/get/start/stop/step/seed/destroy`, IO+visibility sleep, DPR cap | same as octagons + pins/`get()` |
| Tooling | terser via npx, no devDeps, no lint script, no CI; min.js **committed** | eslint 9 + ci.yml + release.yml (OIDC) + bootstrap-publish; min.js gitignored, `prepublishOnly` | same, `prepack`, cross-platform `size.mjs`; no CI yet |
| 301.st promo | none (author still "DeeThemes") | author 301st, README credits, demo nav with 301 logo, theme+i18n | author 301st, README + demo credits |

Publishing lessons already paid for by siblings (hexagons `AGENTS.md`, octagons ADR 003 + `docs/TODO.md`):
configure npm **Trusted Publisher before the first tag**; octagons shipped 3 releases via a
bootstrap `NPM_TOKEN` and never migrated — all provenance-less, token still in secrets, every tag
leaves a failed release run. Known failure catalogue: `is not a legal HTTP header value`, `EOTP`,
`404 masking 403`.

## Decisions (proposed)

1. **Name stays `trigons-lite`** — matches repo, free of the CodeCanyon "Trigons" trademark, mirrors `hexagons-lite`.
2. **Version → 1.1.0** — v1.0.0 tag/release already exists; new API surface is additive.
3. **Author → `301st (https://301.st)`** — current `"author": "DeeThemes"` is wrong (they made the *inspiration*, not this code); DeeThemes stays in README Credits.
4. **`trigons-lite.min.js` becomes gitignored, built by `prepack`** — sibling pattern; removes the stale-minified-build hazard recorded in AGENTS.md. Ship via `files` + tarball assertion in CI.
5. **Size budget: ≤ 3.0 KB gzip** after new features (now ~2.0 KB). Measure per hexagons' rule: "gzip beats clever — trim only by measurement".
6. **Skip** (not-scheduled, recorded here deliberately): auto-palette (≈+1.5 KB, hexagons' differentiator — keep it theirs), IntersectionObserver sleeping (trigons runs rAF only during entrance animations — nothing to sleep), i18n in demo.

## Phase 1 — package & repo hygiene

- `package.json`: author 301st; `homepage`, `bugs`; keywords widened to the family set
  (`triangles, triangle, low-poly, background, canvas, animation, generative, generative-art,
  geometric, pattern, hero-background, background-animation, zero-dependencies, vanilla-js`);
  `files` + `CHANGELOG.md`; scripts: `lint`, `prepack: npm run build`, cross-platform `size`
  (copy `scripts/size.mjs` from hexagons — current `| gzip | wc -c` is bash-only).
- devDependencies: `terser`, `eslint` pinned; commit `package-lock.json`.
- `.gitignore` += `trigons-lite.min.js`, `node_modules/`; delete tracked min.js.
- `eslint.config.js` already exists — add `lint` script, verify it matches siblings (ES5, script, browser globals, ignore `*.min.js`).
- `.github/workflows/ci.yml` (copy from octagons): lint + build + size report on push/PR.
- `CHANGELOG.md` (new): backfill 1.0.0, open 1.1.0 section.

## Phase 2 — library fixes (bugs found in recon)

- **DPR**: render at `min(maxDpr=2, devicePixelRatio)` — biggest visual win, retina is currently blurry.
- **`destroy()`** + fix the resize-listener leak (each `init()` adds a permanent `window` listener; re-init for theme switching — the documented pattern! — stacks them).
- **Stable mesh on resize**: jitter as a pure hash of grid position (hexagons' watertight-jitter trick) so resize doesn't visibly reshuffle; gives `seed` almost for free.
- `seed` option (mulberry32, family-standard) — enables deterministic/offline rendering and future frame-hash tests.
- Return `null` on missing selector (family convention; today returns `undefined` silently).

## Phase 3 — the extra mode (the octagons borrow)

- **`Trigons.pattern(opts)`** — static seamless SVG triangle tile (`size, color, opacity, weight,
  background, raw`), API-identical to siblings. Cheap (~0.4 KB), completes the family triad of
  `pattern()`s, gives a no-canvas usage story for docs/blogs.
- **`mode: 'lines'`** (recommended second mode): same triangulated mesh, stroke-only line art with
  the octagons-style Gaussian light sweep (bucketed strokes, `sweep`, `hot` color). Reuses the
  existing mesh generator; visually ties trigons to the family's line-art identity. Estimate
  ~0.6–0.8 KB gzip. Entrance animations keep working in both modes.
- If the budget bursts 3 KB: `pattern()` stays, `lines` gets cut to v1.2.

## Phase 4 — README, demo, 301.st promo

- README: npm-version + license badges; **Install** restored as `npm i trigons-lite` + jsDelivr
  `trigons-lite@1` CDN snippet (was removed pre-npm in `ae393cc` — restore only in the release
  commit); **Family** section — "3 · 6 · 8": trigons / hexagons-lite / octagons cross-links,
  trigons presented as the origin ("тройка — основа": 301 starts with 3);
  Credits → "Built by [301ST](https://301.st)" + keep the DeeThemes inspiration paragraph;
  License → "MIT © 301ST".
- Demo → GitHub Pages: rename `demo.html` → `index.html` as the site index (octagons pattern),
  add top nav with the 301 logotype link, theme toggle reusing 301-ui tokens, footer
  "Made in 301", OG/description meta (octagons has none — do better here), favicon.
  Existing Animation-Lab controls stay; add mode switch + pattern swatches when Phase 3 lands.
- Cross-promo backlink: add trigons to octagons'/hexagons' README family sections (separate
  commits in those repos, after publish).

## Phase 5 — release

1. Land Phases 1–4, `npm pack` locally, verify tarball (js, min.js, README, LICENSE, CHANGELOG, package.json).
2. `release.yml`: extend the current GH-release workflow with the octagons OIDC publish job
   (tag↔version guard, lint, build, tarball assert, `npm publish --provenance --access public`).
3. First publish: bootstrap path (one-shot `workflow_dispatch` with a granular token, octagons'
   `bootstrap-publish.yml`) → immediately configure **Trusted Publisher** on npm → delete the
   token secret and the bootstrap workflow **in the same sitting** (do not repeat octagons' drift).
4. Tag `v1.1.0`, verify GH release + npm + jsDelivr, flip the README install section live.
5. Log everything in `CHANGELOG.md`; ADRs for decisions 3–5 in `docs/decisions/`.

## Verification

- `npm run lint` clean; `npm run size` ≤ 3072 B.
- demo (`index.html`): both modes × 4 effects × 6 directions eyeballed; retina sharpness at DPR 2;
  theme-switch re-init loop run 10× → no listener growth (DevTools `getEventListeners(window)`).
- Seed determinism: same seed ⇒ identical mesh after resize back to the same dimensions.
- `npm pack` tarball contents asserted in CI; post-publish `npm i trigons-lite@1.1.0` smoke in a scratch dir.
