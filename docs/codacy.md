# Codacy

Status on 2026-11-13: quality analysis is active. Generated-output exclusions were published in `37cba2b` and Codacy confirmed the configuration, generated theme and 60 agent-documentation files ignored. Coverage configuration is prepared locally; publishing it and validating an authenticated upload await the repository secret `CODACY_PROJECT_TOKEN`.

## Scope and acceptance

The independent `hdoria/metis` repository is connected to Codacy. Complete coverage setup when the CI generates valid frontend/server LCOV reports, uploads both for the pushed commit and Codacy reports coverage for that commit. Preserve existing test thresholds and keep tokens outside Git. Only generated outputs are excluded from code-quality analysis.

Implementation scope: `.codacy.yml`, the CI workflow, Vitest coverage configuration and integration documentation. No runtime application behavior, dependency versions or analysis-rule thresholds change. Independent review and actual report/upload results are required before declaring completion.

## Analysis

`.codacy.yml` excludes the same four generated outputs documented in [CodeScene setup](codescene.md). Their generators, tests, fixtures and application source remain included. Codacy reads this configuration from the default branch. It supersedes UI ignored-file settings; maintain exclusions in Git. See [configuration documentation](https://docs.codacy.com/repositories-configure/codacy-configuration-file/).

The initial connected repository showed grade A, 30% complexity and 18% duplication. These are starting measurements. Do not hide maintained source to improve those numbers. The screenshot's empty coverage field means Codacy has not received a coverage report; it does not mean the repository has no tests.

## Coverage generation

The existing `pnpm test` command is retained. In CI, `METIS_CI_COVERAGE=1` enables frontend V8 coverage and `VITEST_COVERAGE_DIR=coverage/frontend` selects its output directory. Server coverage already runs by default; it now also writes LCOV, with `METIS_SERVER_COVERAGE_DIR=coverage/server` selecting its CI directory.

Frontend thresholds remain 72% for lines, statements, branches and functions. Server thresholds remain 90% for lines/statements/functions and 80% for branches. Test failures and threshold failures still fail CI; the upload runs only after tests and build succeed.

The reports cover `src/`, `apps/server/src/` and the server-tested shared packages. They do not measure native Rust, mobile, landing-page or MCP-server coverage. Vitest's existing source/test exclusions are retained. Codacy coverage uses uploaded report contents, separately from `.codacy.yml` quality exclusions. See [coverage documentation](https://docs.codacy.com/coverage-reporter/).

Shared packages can appear in both reports. Codacy [combines covered lines without double counting](https://docs.codacy.com/coverage-reporter/uploading-coverage-in-advanced-scenarios/#uploading-multiple-coverage-reports-for-the-same-language). Each report is uploaded in a separate partial invocation, then finalized, so a failed individual upload cannot be hidden by another successful report.

## Repository token

In Codacy, open **metis → Settings → API tokens → Create API token**, name it `metis-ci` and select an expiration. Use a repository token, which is limited to this repository. Store it directly as the GitHub Actions repository secret `CODACY_PROJECT_TOKEN`, for example using the interactive Terminal command:

```sh
gh secret set CODACY_PROJECT_TOKEN --repo hdoria/metis
```

Paste the token only into that prompt, not into command arguments, chat, logs or tracked files. Record its expiration in the team's credential manager and replace the secret before it expires. No account-wide API token is needed. See [Codacy tokens](https://docs.codacy.com/codacy-api/api-tokens/).

The CI uploads `coverage/frontend/lcov.info` and `coverage/server/lcov.info` using `scripts/upload-codacy-coverage.sh`. It downloads the official helper at a fixed commit, verifies its SHA-256 and selects reporter version 14.1.3, whose binary checksum the helper verifies. Download, checksum, report and finalization failures propagate to CI. The token is read from the environment, not command arguments.

It uploads only on trusted `main` push/manual runs. PRs generate and validate coverage without receiving the upload token; PR coverage comparisons are not configured. Missing/expired credentials or failed uploads must fail the main run.

The workflow stores no GitHub artifacts/cache. Coverage data is sent to Codacy; the normal public-runner cost policy in [CI setup](ci.md) still applies. Enabling Codacy does not enable telemetry inside Métis.

## Local verification

Frontend: 6,401 tests passed, one skipped; line coverage 89.70%, branch coverage 77.34%. Server: 1,033 passed, two skipped; line coverage 95.82%, branch coverage 88.96%. Both pass their existing thresholds. Lint and frontend build passed. Three offline uploader failure tests passed; independent review also exercised report/final failure propagation. All LCOV paths resolve to tracked files: frontend 943, server 72, with 25 shared files combined by Codacy.

Authenticated upload, coverage displayed by Codacy and a hosted run with this coverage configuration remain unverified until the secret is available. The pre-existing non-coverage CI configuration remains on remote main until then.
