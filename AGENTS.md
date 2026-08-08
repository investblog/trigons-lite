# trigons-lite — AGENTS.md

Zero-dependency browser library: animated triangulated backgrounds (`trigons-lite.js`,
~2KB gzip). No build backend, no server, no framework. `demo.html` is the manual
verification surface; `npm run build` produces `trigons-lite.min.js` via terser.

## Pointer (where to look, in priority order)
- Rules: first `./.agents/rules/`, then the library `~/.agents/rules/`.
- Skills/agents: first `./.agents/`, then the library.
- Links and MCP configs: first the local `./.agents/map.yaml` + `./.agents/mcp-configs.yaml`;
  `~/.agents/...` — only to deploy a new rule. The build snapshot — in
  `./.agents/generated/.agents.lock.yaml`.
- Adaptation registry: `./.agents/REGISTRY.md` — WHY something was added/changed
  (the WHAT graph — in `map.yaml`, do not duplicate).
- **[CRITICAL] Plans, docs, and work-artifacts live ONLY in this project** —
  `./.agents/plans/{active,done}`, `./docs/`, the project tree. **NEVER write them to
  `~/.claude/`, `~/.codex/`, `~/.config/opencode/`, or any home/global agent folder**
  (see `project-docs`). Scratch/temp → session scratchpad or a gitignored project dir.
- On conflict the project wins (more specific overrides more general).

## Behavioral rules (base seed — expand as you work)
- **Think before coding.** State assumptions; if uncertain, ask. Present competing
  interpretations — don't pick silently. Name what's unclear and stop. Push back when a
  simpler path exists.
- **Simplicity first.** Minimum code that solves the problem — no speculative features,
  abstractions, flexibility, or error handling for impossible cases. 200 lines that could
  be 50 → rewrite.
- **Surgical changes.** Touch only what the request needs; every changed line traces to
  it. Match existing style; don't refactor what isn't broken or delete pre-existing dead
  code (mention it). Remove only the orphans your change created.
- **Goal-driven + verify.** Turn the task into a verifiable goal; brief plan, per-step
  verification; confirm by an independent check, not assertion (see `proof-loop`,
  `code-review`).
- **Chat answers: structured and plain.** Lead with the answer, then the why. Short
  paragraphs, a list or small table when it helps. No buzzwords; a genuine technical term
  is fine when it is the precise word.
- **Workspace hygiene — clean up when done.** Don't start or restart servers or spawn
  background processes unless asked; when finished, kill what you started and remove
  temp/scratch files.
- **Don't block on a slow tool.** If a tool / MCP / index / server doesn't answer within a
  few seconds, proceed without it and say so.

### Project-specific (append only after a real incident)
- **`trigons-lite.min.js` is generated — never hand-edit it.** Change
  `trigons-lite.js`, then run `npm run build`. Both files are committed and shipped
  (`package.json` `files`), so a stale minified build ships silently.

## Self-configuration (adapt and explain)
`~/.agents` provides a minimal shared baseline. Adapting to the project is standard work.
The ladder, when the project needs a tool/skill/rule:
1. Local in `./.agents/` — already there? use it.
2. No → in the baseline `~/.agents/`? pull the chain (`cp` the rule + linked
   skills/agents/MCP), append to the local `./.agents/map.yaml` and to the pointer.
   The trigger for "something new in the baseline" — an explicit user request or a
   one-shot scan `find ~/.agents/rules/ -type f` (not a constant diff).
3. Not anywhere → escalation: the `research` domain (websearch → fetch → browser)
   to compare/find, install/attach into the project, append to the local map.

**Activate an agent by running it.** An agent entering this project that has no native
config of its own renders its own part from the chain — its hooks/MCP into its own file
(Claude → `.claude/settings.json` + the `CLAUDE.md` pointer; codex → `.codex/config.toml`;
opencode → `opencode.json` + `.opencode/plugin/`), logged in REGISTRY. No agent sets up
another agent's environment.

Accounting: `./.agents/map.yaml` = WHAT is attached (the graph). `./.agents/REGISTRY.md`
= WHY (change log: what, version/source, date, rationale). Write ONLY changes.

Autonomy boundaries:
- adapting the PROJECT (layers 1–3) — without asking, standard;
- changing the BASELINE `~/.agents` — only by agreement with the user.

[CRITICAL] Any attach/install/replace — with an explanation in REGISTRY.md.

## Attached at initialization
- Library version: `b45a587` (`~/.agents`), attached 2026-07-18
- Domains: `coding` (always-on `base` included on top)
- Rules: rule-format, env-setup, project-docs, proof-loop, secrets, git-discipline,
  quality-py, quality-js, quality-bash, quality-perl, quality-cpp, code-search,
  code-review, user-docs
- Agents: docs, searcher, reviewer
- Skills: — (none in this chain)
- Hooks: secrets-guard (PreToolUse), light-lint (PostToolUse), git-quality-gate
  (pre-commit / pre-push)
- MCP: — (no project-bound MCP)

Do not duplicate the contents of `map.yaml` — links are taken from `./.agents/map.yaml`
via the pointer.
