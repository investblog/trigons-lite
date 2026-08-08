---
type: note
status: active
tags: [adr]
project: trigons-lite
---

# Decisions (ADR)

One file per decision: `NNN-short-slug.md`, numbered, never renumbered. A decision records
**why** — context, the decision, alternatives considered, and dead-ends — not only what.

Frontmatter: `type: decision` · `status: active|archived` · `tags: [...]` · `project:`.

Candidates for this project: adding any runtime dependency (breaks the zero-dependency
promise), moving the source off ES5/IIFE, or adding a test framework.

- [001 — trigons-lite.min.js is generated, never committed](001-min-js-generated-not-committed.md)
- [002 — package author is 301ST; DeeThemes stays in Credits](002-author-301st.md)
- [003 — v1.1 ships pattern() + lines mode at a 3.25 KB budget](003-size-budget-325kb.md)
