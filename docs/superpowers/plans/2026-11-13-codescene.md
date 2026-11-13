# CodeScene setup implementation plan

**Goal:** Connect Métis to CodeScene project 87759 and reject newly introduced Code Health findings before a local push.

**Architecture:** A native Git pre-push hook passes the actual remote/local commit IDs to the authenticated CodeScene CLI. Generated outputs are excluded through an explicit file list. Project-scoped Codex configuration connects the MCP server without storing credentials.

**Scope:** `.githooks/pre-push`, `.codex/config.toml`, `codescene.config.json`, `scripts/codescene-pre-push{,.test}.mjs`, package commands, and existing contributor/integration documentation. No application behavior or dependencies change.

**Acceptance:** Healthy commits pass; regressions, unavailable authentication, incomplete reports and missing comparison objects block the push. Multiple refs and commits, new branches, deleted refs, generated-only changes and dirty working trees receive explicit coverage. Existing hooks are preserved during setup.

## Implementation

- [x] Add executable hook, range selection, generated-file filtering and strict CLI result handling.
- [x] Exercise the hook against disposable Git repositories and a controlled CLI double; prove healthy and degraded changes with the real CLI.
- [x] Register project-scoped MCP and verify the connection to project 87759.
- [x] Document installation, exclusions, limitations and recovery; update stale integration statements.
- [x] Obtain independent review and run required local checks.
- [ ] Commit and push through the installed hook; record publication in the task completion report.
- [ ] After the user saves cloud exclusions, trigger and inspect a fresh cloud analysis. Otherwise report that cloud step as pending.

## Stop condition

Stop after the verified commit reaches `main`, local hook/MCP setup is confirmed, and the cloud analysis outcome or its specific remaining dependency is reported. Local hooks do not enforce GitHub-side policy and do not replace tests or builds.

## Local evidence, 2026-11-13

`pnpm codescene:test`: 18 passed. `pnpm lint` and `pnpm build`: passed (existing large-chunk and module-import warnings). Independent review approved the change. CLI 1.0.58 scored the hook script and tests 10 with no findings. A real healthy push to a disposable bare remote passed; a deliberately degraded change (10 → 6.73) was rejected, preserving the remote commit. A truncated-scope regression test failed before the count check and passed after it. MCP confirmed project 87759 and tracking disabled. Cloud exclusions were saved by the maintainer; a fresh analysis follows publication.
