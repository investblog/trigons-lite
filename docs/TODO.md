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

- **Post-release tidy-up (v1.1.0 shipped 2026-08-09 with provenance).**
  Remaining small item: `npm deprecate trigons-lite@1.1.0-bootstrap.31298579336
  "bootstrap publish only"` (needs npm login, or the version page on the website).
  bootstrap-publish.yml already deleted — OIDC is proven. Released plan:
  [`../.agents/plans/done/2026-08-09-npm-release.md`](../.agents/plans/done/2026-08-09-npm-release.md)

## Noted, not scheduled

- **No test suite.** The library has no automated tests; `index.html` is manual-only, and
  the push gate has nothing to run. The browser self-test pages used for v1.1.0 were
  session-scratch and not kept. `seed` + deterministic mesh now make a frame-hash test
  cheap to build — worth a decision before adding a framework.
- **No type-check.** `tsc` is absent, so the push gate skips it. Intentional for a plain
  ES5 library — see `../.agents/REGISTRY.md`.
