# CodeScene

Métis uses [CodeScene project 87759](https://codescene.io/projects/87759) for repository analysis and a local pre-push hook for new Code Health findings. The hook compares the commits actually being pushed. It does not use the dashboard's aggregate score as a threshold.

## Local setup

Install the [CodeScene CLI](https://codescene.io/docs/cli/index.html) and [CodeHealth MCP server](https://github.com/codescene-oss/codehealth-mcp). The validated versions are CLI **1.0.58** and MCP **1.5.21**. Both native macOS arm64 archives were verified against their published SHA-256 checksums before installation. Keep `cs-mcp` on `PATH`; the hook also finds `cs` in `~/.local/bin`.

```sh
cs-mcp auth
cs auth status --client mcp
pnpm codescene:setup
pnpm codescene:test
```

Authenticate in the browser using the account with access to the Métis project. OAuth credentials remain in the user's CodeScene credential store outside this repository. Never paste tokens into tracked config or commit them. The CLI shares this login through `CS_OAUTH_CLIENT=mcp`; an explicitly supplied client setting is respected.

Setup configures `core.hooksPath=.githooks` for this clone only. It is idempotent and refuses to replace another hooks directory or disable existing hooks. If hooks already exist, integrate the invocation from `.githooks/pre-push` into the existing pre-push hook and propagate failures. Each new clone needs setup; `pnpm install` does not silently change Git settings.

The project-scoped `.codex/config.toml` registers `cs-mcp` with project 87759. Codex loads it in trusted Métis workspaces; reopen the project/session after adding it. Verify with `codex mcp get codescene --json`. The default project does not affect other repositories.

The hook and project MCP set `CS_DISABLE_TRACKING=1` to disable optional CodeScene usage tracking. OAuth, license validation and project API requests still require network access. Local analysis runs in the CLI; its results become available to the AI client when using MCP. The Cloud dashboard separately accesses the authorized GitHub repository. This developer tooling does not initialize telemetry in the Métis application or landing page. See the [versioned tracking implementation](https://github.com/codescene-oss/codehealth-mcp/blob/MCP-1.5.21/src/tracking.rs).

## Push behavior

For an existing remote ref, the hook compares its remote commit with the proposed local commit from Git's pre-push input, including all commits between them. It checks every non-deleted ref in a multi-ref push. It does not analyze the current index or uncommitted edits instead of the pushed commits.

For a new branch or commit tag, the base is its merge-base with the named remote's tracked `main`. Fetch that remote first. A missing comparison object, an unrelated history or a non-commit ref blocks the push with an explanation. Ref deletions and changes consisting only of deleted/generated files need no code analysis.

The CLI receives an explicit NUL-separated changed-file list. New Code Health findings, CLI/authentication failures, timeouts, invalid reports and an incomplete eligible-file analysis block the push. Existing debt unchanged by the push does not become an arbitrary new blocker. Files unsupported by CodeScene are reported as zero eligible files; this is not a substitute for their linters/tests.

For a manual check of committed changes:

```sh
git fetch origin
pnpm codescene:check origin/main HEAD
```

To recover from a failed check, fix the reported findings or restore the CLI/network/login and retry. `cs-mcp auth` renews the interactive login. `METIS_CODESCENE_BIN` can select an alternative CLI executable; it is used by the isolated hook tests.

This is a **local** check. Git can bypass local hooks, and GitHub web edits or other clones do not run it. There is no server-side CI or required PR check in this setup. Continue running the build, lint and tests in the [development guide](GETTING-STARTED.md#local-validation).

## Generated output exclusions

`codescene.config.json` is the source of truth for local exclusions:

| Output | Maintained source or generator |
| --- | --- |
| `apps/mobile/assets/diagram-renderer.html` | `apps/mobile/scripts/build-diagram-renderer.ts` |
| `apps/mobile/src/components/workspace/MobileWysiwygTentapEditorHtml.ts` | `apps/mobile/scripts/build-wysiwyg-editor-html.mjs` |
| `apps/mobile/src/ui/theme/desktopThemes.generated.json` | `apps/mobile/scripts/generate-desktop-themes.ts` |
| `src-tauri/resources/agent-docs/` | `scripts/build-agent-docs.mjs` and `site/` |

The generators, application sources, tests, fixtures, patches and starter-vault code remain included.

Cloud analysis has **separate** settings. In project Configuration → Exclusions & Filters → Exclude Content, append these patterns, preserving existing exclusions:

```text
metis/apps/mobile/assets/diagram-renderer.html;metis/apps/mobile/src/components/workspace/MobileWysiwygTentapEditorHtml.ts;metis/src-tauri/resources/agent-docs/**;metis/apps/mobile/src/ui/theme/desktopThemes.generated.json
```

CodeScene's [path-pattern documentation](https://codescene.io/docs/configuration/project-config/index.html#exclude-specific-files-and-folders-from-an-analysis) requires the repository-root prefix and semicolon separators. The public [Cloud API](https://api.codescene.io/v2/docs/codescene.json) does not expose configuration editing; changing the local JSON does not update the dashboard. Save the cloud settings, run a fresh analysis, and verify the scope before comparing scores.

The initial imported commit provides very little history for hotspot, ownership and delivery trends. Treat the first dashboard as a starting point, not proof that every part of the application is healthy.

## Setup verification, 2026-11-13

Implementation commit `fc371d1` passed the installed hook on its push to `main`. All 18 hook tests, lint and application build passed; independent review approved the setup. A real CLI test accepted a healthy push and rejected an introduced regression without changing the disposable remote.

After the cloud exclusions were saved, [analysis 8419369](https://codescene.io/projects/87759/jobs/8419369/results) completed with status `ok` and included that implementation commit. All four pages of its file listing were checked: 3,732 files, no paths matching the four generated-output exclusions. Average Code Health was 9.98; hotspot Code Health was 9.9.
