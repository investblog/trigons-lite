---
type: decision
status: active
tags: [build, release]
project: trigons-lite
---

# 001 — trigons-lite.min.js is generated, never committed

## Context

Until v1.1.0 both `trigons-lite.js` and `trigons-lite.min.js` were committed, and the
project rules carried a standing incident note: change the source, forget the build, and
a stale minified file ships silently (both were in `package.json` `files`).

## Decision

The minified file is gitignored and produced by `prepack` (so `npm pack`/`npm publish`
always rebuild it). It still ships — via the npm tarball and the GitHub release assets —
but never lives in git. The release and bootstrap workflows assert the tarball actually
contains it, because a broken prepack would otherwise only surface for whoever installs
the package.

## Alternatives

- **Keep committing it, add a CI staleness check** — more moving parts, and the failure
  mode (forgot to rebuild) still lands in history before CI complains.
- **Commit it via a pre-commit hook rebuild** — couples every commit to terser and hides
  build output in diffs.

Sibling repos (octagons, hexagons) already use the generated-artifact model; this aligns
the family.
