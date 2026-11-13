# Automated macOS release plan

**Goal:** Generate, sign, notarize and validate an Apple Silicon Métis installer, then upload it only to a GitHub draft release.

**Architecture:** One Node orchestration command shared by this Mac and a standard GitHub macOS ARM runner. Tauri signs the app using a local or ephemeral CI keychain. The script notarizes/staples the app, creates and signs its DMG, notarizes/staples that DMG, then validates its mounted payload. Uploaded Sentry assets must match the packaged executable exactly.

**Scope:** `scripts/macos-release{,.test}.mjs`, `scripts/macos-release-keychain{,.test}.mjs`, `.github/workflows/release-macos.yml`, `src-tauri/tauri.macos-release.conf.json`, package command, release documentation and a private one-time credential wizard outside Git. Keep historical calendar-version tooling intact.

## Constraints

- Target `aarch64-apple-darwin`, macOS 11+, product Métis, bundle ID `io.github.hdoria.metis`, Apple team `C42XKG5G6X`.
- SemVer `v0.1.0` initially; require tag/package/Cargo/Tauri versions to agree and source to be clean.
- Preserve crash-reporting consent and private tldraw configuration; no app telemetry policy changes.
- Current tldraw key is an evaluation license expiring 2026-11-27. Binaries remain draft-only; no public Actions artifact, published release or landing download promise.
- Standard public macOS runner only. No paid runner, cache service, updater activation or certificate revocation.
- GitHub secrets receive an encrypted project-owned certificate, dedicated Sentry org CI token and notary credential. No secrets in Git, logs or chat. Existing local Keychain stays local.

## Work

1. Validate versions/ref and define `plan`, `build`, `draft` interfaces. Test invalid tags, version mismatch, dirty source, wrong repository and published-release protection.
2. Build frontend with hidden maps, inject/upload maps, remove maps and hash assets; compile Rust without rebuilding frontend; upload UUID-matched native symbols.
3. Bundle/sign app, notarize/staple, construct DMG, sign/notarize/staple. Verify architecture, version, team, resources, legal notices, signatures, tickets and mounted binary equality.
4. Add disposable CI keychain setup/cleanup, preserving the original search list. Test failure cleanup and secret-safe errors using fake native commands.
5. Add pinned macOS workflow on version tags/manual dispatch. Gate trusted source and successful quality CI; publish only expected checksum-verified files to the same-commit draft.
6. Reuse project-local credentials that can be transferred safely. Have the user enter only missing private values through a local Terminal wizard.
7. Obtain independent review, run meaningful tests/static workflow checks, and validate the real pipeline. Record actual outcomes and limitations before reporting completion.

## Stop condition

Finish when the versioned automation is published and a real signed/notarized DMG has passed validation and reached its expected private draft. If a required credential remains unavailable, preserve concrete tested work, identify the exact missing input and keep hosted/signing results explicitly unverified. Public distribution remains a separate license-dependent step.
