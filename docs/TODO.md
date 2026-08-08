---
type: note
status: active
tags: [backlog]
project: trigons-lite
---

# Backlog

The single list of open work. Each item links to its plan in `../.agents/plans/active/`
once one exists. An item is dropped when its plan moves to `plans/done/`.

## Open

- **npm release v1.1.0 — code done, awaiting the publish steps.** Everything through the
  release pipeline is implemented and committed; what remains needs npm account access:
  NPM_TOKEN secret → bootstrap-publish workflow → configure Trusted Publisher
  (investblog/trigons-lite, release.yml) → delete+revoke token → tag `v1.1.0` → push.
  Then: enable GitHub Pages (main / root), add trigons to the family sections of
  octagons' and hexagons' READMEs. Plan:
  [`../.agents/plans/active/2026-08-09-npm-release.md`](../.agents/plans/active/2026-08-09-npm-release.md)

## Noted, not scheduled

- **No test suite.** The library has no automated tests; `demo.html` is manual-only, and
  the push gate has nothing to run. Worth a decision on whether that is acceptable for a
  library of this size before adding a framework.
- **No type-check.** `tsc` is absent, so the push gate skips it. Intentional for a plain
  ES5 library — see `../.agents/REGISTRY.md`.
