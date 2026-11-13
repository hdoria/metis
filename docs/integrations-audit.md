# Integration audit, 2026-11-13

This document describes the independent repository's tracked integrations and local operation. Account-wide SaaS installations are outside this audit. The [development guide](GETTING-STARTED.md#local-validation) contains the commands to run before publishing changes.

## Repository tooling

The repository reset removed the inherited CI workflows, Git hooks, Codacy, CodeScene, Verity and Lara configuration, dependencies and dedicated commands. The obsolete mobile OTA publishing scripts and repository-service ADRs were also removed. Local lint, builds, tests, localization validation and performance tools remain available through `package.json`.

CodeScene has since been configured for the independent Métis project **87759**, with OAuth access, a project-scoped Codex MCP server and an opt-in local pre-push hook. The hook checks the actual pushed commit ranges and excludes four generated outputs. [CodeScene setup](codescene.md) documents installation, cloud exclusions and limitations. It supplies no GitHub-side Code Health enforcement and does not run application tests or builds.

[GitHub Actions CI](ci.md) now runs lint, locale validation, application/configuration tests, CodeScene hook tests and the frontend build. It uses standard Ubuntu runners for this public repository, no secrets, no cache and no uploaded artifacts. Other removed analysis/CI services remain unconfigured.

Translation edits now happen directly in `src/lib/locales/*.json`, with `en.json` as the canonical keyset and `pnpm l10n:validate` as the local structural check. The manual Todoist commands and legacy network demo server were removed earlier. Future service integrations need their own configuration and validation.

## Retained product and hosting integrations

| Integration | Current operation | Required configuration |
| --- | --- | --- |
| Desktop Sentry | Configured in Popcode's `metis-desktop` and `metis-native` projects. Crash reporting still requires user opt-in. Local source-map and symbol upload precedes packaging. | See [Sentry setup](sentry-setup.md). Credentials remain outside Git. |
| Desktop PostHog | Runtime integration remains optional and unconfigured. Autocapture, pageviews and session recording are disabled by the app. | A project key and user analytics opt-in would be required. |
| Mobile telemetry | Runtime support remains; analytics and crash reporting default to false. | No mobile project is provisioned by repository cleanup. |
| Mobile OTA | Runtime/profile isolation and fingerprint validation remain; updates default to disabled. Publishing automation has been removed. | A Métis-owned EAS project, accepted native runtime and a separately validated publication process. |
| Desktop updater | Signed automatic updates remain disabled. | A Métis-owned release service and updater signing configuration. |
| Web Sentry | Separate build configuration and manual source-map uploader remain. | See [web telemetry](web/telemetry.md); desktop Sentry configuration does not configure the web target. |
| Apple signing | Existing Popcode Developer ID and local Keychain notarization profile support the documented Mac procedure. | See [local macOS packaging](macos-local-build.md). |
| Landing hosting | Vercel project `popcode/metis-landing`, domain `metisapp.com.br`, Cloudflare DNS. Deployment uses the CLI. | See [hosting](hosting/vercel.md); GitHub autodeployment is not connected. |
| Landing analytics | No Sentry/PostHog initialization or analytics script is present in landing source. Hosting access logs are separate. | No product-analytics configuration. |

Sentry setup verification and its test-event evidence are recorded in [Sentry setup](sentry-setup.md). Previously generated packages keep their build-time configuration; changing the repository does not update an installed package.

## tldraw evaluation telemetry

The provided key was cryptographically validated by the installed SDK 4.5.10 as an evaluation license expiring on 2026-11-27. The key remains outside Git. tldraw describes license keys as public, client-validated values in its [license documentation](https://tldraw.dev/community/license).

With the supplied evaluation license, the installed SDK's `LicenseManager` sends a licensing request in production HTTPS environments to `https://cdn.tldraw.com/4.5.10/watermarks/watermark-track.svg`. Its query fields are `version`, `license_type`, `license_id`, `sku`, `url` and `environment`. `license_id` is the ID encoded in the license; `url` is the full `window.location.href`, including any query or fragment. The actual installed source is authoritative for these fields; the general documentation describes trial collection more broadly. This request is independent of the Métis Sentry/PostHog switches.

A controlled execution of the unmodified SDK observed `licensed` for both `tauri://localhost` and an HTTPS production origin. It classified the Tauri origin as development and produced no licensing request there; the HTTPS case attempted the request above. The test intercepted transport and did not send the request externally. An isolated real `TldrawWhiteboard` browser smoke test also produced no external HTTP/WebSocket requests. These checks do not replace a native network capture.

## Remaining release work

Automated signed releases, desktop update delivery, mobile OAuth/EAS provisioning and a continued tldraw license require separate work. The repository cleanup does not provision those services or change users' telemetry consent. The installed pre-push hook supplies only its Code Health validation result; the CI supplies the documented build/test results. Native packaging and browser/mobile checks remain separate.
