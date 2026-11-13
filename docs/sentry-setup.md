# Métis desktop error reporting

## Account and scope

Desktop error reporting uses Sentry organization `popcode`, team `popcode-mobile-solutions`, with two owned projects:

| Project | Platform | Build configuration |
| --- | --- | --- |
| `metis-desktop` | React | `VITE_SENTRY_DSN`, `VITE_SENTRY_RELEASE`, `VITE_SENTRY_ENVIRONMENT` |
| `metis-native` | Rust | `SENTRY_DSN`, `SENTRY_RELEASE`, `SENTRY_ENVIRONMENT` |

Both paths retain the user's crash-reporting opt-in. Provisioning a project or embedding a DSN does not grant consent. Default PII collection remains disabled and existing redaction remains in place. This setup does not enable PostHog, Replay, tracing or log ingestion, and does not configure the mobile app, landing page or separate web deployment. Existing SDK versions are retained.

The local Sentry CLI authenticates to `https://sentry.io` as Hugo's Popcode account. Authentication stays in the CLI credential store. Project DSNs and routing are in `~/.config/metis/observability/sentry.env`, mode 0600; no auth token is copied into the repository. The tldraw configuration is separate, at `~/.config/metis/licensing/tldraw.env`.

## Production build workflow

A normal `pnpm build` does not load these private files or upload symbols. For an instrumented desktop package, load the two local environment files into a dedicated build subprocess without printing their values. Provide all six configuration variables above and explicitly set `TAURI_PLATFORM=macos`. Keep inherited Apple, Fastlane and notarization credentials out of this initial build; use `APPLE_SIGNING_IDENTITY=-` until signing a separate copy.

Use a unique release for each changed executable. The verified package uses `metis-desktop@0.1.0+sentry.20261113` and `metis-native@0.1.0+sentry.20261113`, with environment `production`. React accepts the owned desktop release format and previous release formats. Rust retains its calendar release fallback when no override is provided. With no compiled native environment override, the SDK retains its runtime environment/build-mode fallback.

Run these stages sequentially from the repository root with that build environment:

1. `pnpm exec tsc -b`, then `pnpm exec vite build --sourcemap hidden`.
2. `SENTRY_ORG=popcode SENTRY_PROJECT=metis-desktop sentry sourcemap upload dist --release "$VITE_SENTRY_RELEASE" --json`. The authenticated CLI injects debug IDs and uploads the matching source maps. Stop if it fails.
3. Move every `*.map` from `dist` into a local ignored archive, preserving relative paths. Record hashes of the remaining assets. Do not rebuild or otherwise change the JavaScript after upload.
4. `pnpm tauri build --no-bundle --config '{"build":{"beforeBuildCommand":"pnpm bundle-mcp && pnpm agent-docs"}}'`. This builds the native executable and resources while retaining the exact uploaded frontend. Rust must receive its DSN, release and environment at compile time.
5. Use `xcrun dwarfdump --uuid src-tauri/target/release/metis` to identify the executable. Find the matching `metis.dSYM` under `src-tauri/target/release/build/metis/`. Verify its UUID, then upload that exact path using `SENTRY_ORG=popcode SENTRY_PROJECT=metis-native sentry debug-files upload <matching-dSYM> --include-sources --wait --json`. Confirm both debug and source bundles are processed successfully. Cargo emits debug information only for the Métis package.
6. `pnpm tauri bundle --bundles app`, still with the same build environment. Verify that the expected configuration and frontend assets are embedded, and no verification-only triggers remain.
7. Sign a separate copy, notarize and staple both app and DMG, then validate the mounted payload and Gatekeeper. Follow [macOS packaging](macos-local-build.md). Rebuilding invalidates prior signatures and symbol matches.

The executed local pipeline and sanitized evidence are under `src-tauri/target/metis-sentry-verification/`. The CLI uses its existing authentication for both uploads; a legacy `SENTRY_AUTH_TOKEN` is unnecessary for this local flow. No automatic CI upload or new GitHub secrets were configured.

## Verified events — 2026-11-13

- [React production event: METIS-DESKTOP-2](https://popcode.sentry.io/issues/7846822529/), event `5805babfd9d74db9aea826107f7cd1d3`: the full application initialized telemetry through its normal hook, and a real UI handler threw an identifiable test error. Sentry resolved the original function `throwMetisSentryProductionSmoke`, `harness/metisSentryProductionSmoke.tsx:17:9`, with source context using the uploaded debug ID; processing errors were empty. This used a disposable Chromium production build with environment `verification` and 1,568 uploaded JavaScript/source-map pairs.
- [Rust panic: METIS-NATIVE-1](https://popcode.sentry.io/issues/7846821455/): a temporary branch at the start of Tauri setup initialized the existing telemetry path, raised `Metis Sentry native verification 20261113-setup`, flushed successfully and exited before vault, window or MCP startup. Matching dSYM and source bundles resolved `metis_lib::setup_app::{closure#0}`, `lib.rs:258`, with the original panic source context. Release `metis-native@0.1.0+verification.20261113`, environment `verification`.

Consent was enabled only in disposable test settings. The native fixture's settings hash stayed unchanged and its vault remained empty. The temporary native branch was removed before the final production build; the browser verification module only existed in the isolated test build. No installed app or personal vault was used. The native test verifies Rust panic reporting, not operating-system crash capture such as SIGSEGV. The React test ran in Chromium, not the packaged macOS WebView.

Validation passed 66 frontend telemetry tests across four suites and 17 Rust telemetry tests, including release/environment fallbacks. Independent source review confirmed the existing consent path and absence of temporary triggers. Final artifact and signing results are recorded in [the release record](../release-record.md).

References: [Sentry agent setup](https://docs.sentry.io/ai/agent-setup/get-started/), [JavaScript source maps](https://docs.sentry.io/platforms/javascript/sourcemaps/), [Rust source context](https://docs.sentry.io/platforms/rust/source-context/).
