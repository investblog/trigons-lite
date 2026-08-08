# REGISTRY — project adaptation log

WHY something was added/changed. The WHAT graph lives in `map.yaml` — not duplicated here.

## 2026-07-18 — attached the `~/.agents` library (migration mode)

Existing repo (`.git` present, no `AGENTS.md`, no `.agents/`) → classified **partial/manual**,
so the fresh-project bootstrap was not run: the project's own files (`trigons-lite.js`,
`package.json`, `README.md`, `.github/`) were left untouched, and `.gitattributes` /
`.editorconfig` were **not** created (they are fresh-`git init` only, and this repo already
has its own conventions — a `.gitattributes` already existed upstream in the library repo,
not here).

- **Domains:** `coding` (user choice). `web` was declined — it drags the whole Cloudflare
  set (cf-wrangler, cf-auth, edge-compat, cf-free-tier) which is meaningless for a
  standalone zero-dependency browser library.
- **Rules:** base ∪ coding — see `.agents/generated/.agents.lock.yaml`.
- **MCP:** none. No project-bound MCP exists for this project, so no `./.mcp.json` was
  written. `playwright` stays machine-level global infra (never rendered per-project).
- **Claude config:** only `./.claude/settings.json` (committed chain hooks). No
  `settings.local.json` — the project has no permission overrides worth pinning.
- **`./CLAUDE.md`:** a real symlink → `./AGENTS.md`. Git Bash `ln -s` silently **copied**
  the file (MSYS fallback); the working link was made with PowerShell
  `New-Item -ItemType SymbolicLink`. Use that on this machine, not `ln -s`.
- **`.gitignore`:** merged the 23 missing baseline lines (secrets, caches, build output)
  into the existing file — appended under a marked section, nothing clobbered. `secrets`
  is base/[CRITICAL], so the secret ignores must exist before anything else.

### Hook shell path (native Windows)
Hook commands in `.claude/settings.json` are rendered with the absolute
`W:\Program Files\Git\bin\bash.exe`, **not** bare `bash`. Bare `bash` on this machine can
resolve to `C:\Windows\System32\bash.exe` (the WSL launcher) and fail where no distro is
installed — a hook that fails open is worse than no hook.

### Added: scoped `.gitattributes` (deviation from the canon — deliberate)
The canon creates `.gitattributes` only on a fresh `git init`, to avoid overriding an
existing repo's convention. Added here anyway, but **scoped to `*.sh` and the two git-hook
entrypoints only**: this repo had no `.gitattributes`, so the POSIX hook scripts would be
checked out with CRLF and die with `$'\r': command not found` — a clone would silently
lose the quality gate. Verified with `git ls-files --eol`: the scripts are `eol=lf`,
`trigons-lite.js` is untouched (no attribute). The project's own source keeps whatever
convention it had.

### Added: `eslint.config.js` (not from the library)
`git-quality-gate` dispatches JS projects to `npx eslint .`, and ESLint 9 hard-fails
without a flat config — so **every commit was blocked** until this existed (verified: the
gate failed, then passed). Minimal on purpose, matching the code as written:

- `ecmaVersion: 5`, `sourceType: 'script'` — the source is an ES5 IIFE, not a module.
- CommonJS (`module.exports`) — `package.json` has no `"type": "module"`.
- Browser globals declared by hand instead of adding the `globals` package — the project
  is advertised as zero-dependency; adding a devDependency for four names is not worth it.
- `ignores: ['trigons-lite.min.js']` — generated output.

`tsc` is absent, so the push gate skips type-check and says so. That is correct for a
plain-JS library; do not add TypeScript just to satisfy the gate.
