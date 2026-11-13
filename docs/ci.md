# Continuous integration

## Plan and acceptance

Use GitHub Actions with standard Ubuntu runners for this public repository. Run the existing lint, locale validation, root test command, CodeScene hook tests and frontend build. Keep dependencies pinned by the lockfile and actions pinned by commit SHA. Complete setup only after independent review and a successful hosted run.

Scope: `.github/workflows/ci.yml` and contributor/integration documentation. Application code and dependency versions are outside this change. Full-stack prerequisites are present: React/Tauri source, Vitest configuration and Playwright configuration. The first pipeline runs the existing non-browser test command; native packaging and browser E2E remain explicit local checks.

## Workflow

The [CI workflow](../.github/workflows/ci.yml) runs on pushes to `main`, pull requests and manual dispatch. A newer run for the same ref cancels the obsolete run. All steps must pass; tests are not retried automatically.

One standard `ubuntu-24.04` job uses Node.js 26 and the package manager pinned in `package.json` (pnpm 10.33.0). It installs with `--frozen-lockfile`, then runs:

```sh
pnpm lint
pnpm l10n:validate
pnpm test
pnpm codescene:test
pnpm build
```

`pnpm test` includes frontend Vitest tests, release/AppImage script tests, the site verifier, web configuration tests, server tests with their existing coverage thresholds, and development mock tests. CI enables frontend coverage and selects separate frontend/server output directories; [Codacy setup](codacy.md) documents the report scope and unchanged thresholds. Frontend workers are limited to two and test timeout is 30 seconds to accommodate shared runner capacity. The complete job times out after 30 minutes. After tests and build pass, trusted main runs upload both LCOV reports to Codacy.

The hook tests use a fake CLI and disposable Git repositories; they need no CodeScene login. The actual Code Health pre-push check remains local; see [CodeScene setup](codescene.md).

## Permissions and cost

The workflow requires only `contents: read` and does not persist checkout credentials. The Codacy upload step uses the repository secret `CODACY_PROJECT_TOKEN` only on trusted main runs. Pull requests use `pull_request`, so fork code is not executed with privileged `pull_request_target` access and PR runs do not receive this secret. Changes to these permissions need review.

Standard GitHub-hosted runners are free for public repositories, according to [GitHub billing documentation](https://docs.github.com/en/billing/concepts/product-billing/github-actions). Larger runners and storage beyond included allowances can be billed. This workflow uses a standard runner, disables automatic package-manager caching and uploads no artifacts. It does not provision paid services or modify billing settings. Reassess cost before changing repository visibility or adding runners/storage.

CI reports failures in GitHub Actions and PR checks. Branch protection/required checks are separate repository settings; this setup does not prevent direct pushes to `main`.

## Local reproduction

Install the pinned package manager, run `pnpm install --frozen-lockfile`, then run the commands above with `CI=true`, `VITEST_MAX_WORKERS=2` and `VITEST_TEST_TIMEOUT_MS=30000`. Git must be available because tests create disposable repositories. Do not load local signing, telemetry or licensing files into CI.
