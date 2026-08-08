---
type: decision
status: active
tags: [size, features]
project: trigons-lite
---

# 003 — v1.1 ships pattern() + lines mode at a 3.25 KB budget

## Context

v1.0 was ~2.0 KB min+gzip. The v1.1 plan added `pattern()`, `mode: 'lines'`, DPR, seed,
and `destroy()` under a ≤3 KB (3072 B) budget with trim levers (drop glow, drop the
line gradient, drop pattern `background`). Measured after implementation: **3214 B**,
with per-feature costs measured — not estimated — by stripping each and re-gzipping:
`pattern()` 279 B, gradient 80 B, glow 24 B. Structural trims (shared helpers, edges as
arrays because property names survive mangling) had already been applied and bought only
~40 B: gzip absorbs textual repetition, so only real feature deletion moves the number.

## Decision

Keep all features; the budget is **≤ 3328 B (3.25 KB)**. Hitting 3072 required deleting
`pattern()` (a headline feature) or gutting lines-mode visuals for ~100 B — a bad trade
against a self-imposed number. 3214 B remains ~15% under octagons (3776 B) and the
"lite" claim stays honest at "~3.2 KB gzip".

## Dead-end recorded

Hexagons' lesson holds here: "gzip beats clever — trim only by measurement." Helper
extraction and array-ification looked like ~100 B wins in raw source and delivered ~5-20 B
gzipped each.
