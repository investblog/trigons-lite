---
type: decision
status: active
tags: [package, credits]
project: trigons-lite
---

# 002 — package author is 301ST; DeeThemes stays in Credits

## Context

`package.json` shipped with `"author": "DeeThemes"` since v1.0.0. DeeThemes made the
original **Trigons** CodeCanyon plugin that inspired this library, but wrote none of this
code — TrigonsLite is a ground-up rewrite (Canvas vs SVG, grid vs Delaunay). Publishing
to npm with a third party in the `author` field would misattribute both ways: it credits
them for code they never saw, and it makes them answerable for it.

## Decision

`author` is `301st (https://301.st)` — matching octagons and hexagons-lite. The README
Credits section keeps the full DeeThemes inspiration paragraph, including the pointer to
the original plugin for people who need the bigger feature set.
