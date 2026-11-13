# Automated macOS draft releases

This workflow prepares an Apple Silicon installer for macOS 11 or later. It signs with Popcode's existing Developer ID, uploads matching Sentry debug information, notarizes the app and DMG, and attaches the validated installer to a **draft** GitHub release. It never publishes a release or enables app updates.

The configured tldraw key is an evaluation license expiring on 2026-11-27. Keep binary distribution private until the appropriate continued license is configured. GitHub draft assets are visible only to repository users with write access. The workflow does not upload public Actions artifacts. The landing's license-pending notice remains appropriate until an actual distributable public release exists.

## Source and version policy

The first version is `v0.1.0`. The tag's SemVer must match `package.json`, `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`. A checkout must be clean. If the tag exists, it must point to the checkout's exact commit. Draft creation additionally requires the `hdoria/metis` repository, source on main history and a successful `ci.yml` run for that same commit.

Historical calendar-version scripts are retained for their existing callers. This workflow uses the separate `scripts/macos-release.mjs` commands. An existing published release is immutable to this automation. Replacement of attachments is allowed only on a draft with the same tag and exact source SHA.

## Commands

```sh
pnpm release:macos plan v0.1.0
pnpm release:macos build v0.1.0
pnpm release:macos draft v0.1.0
```

`plan` validates source/version and prints non-secret metadata. `build` requires an Apple Silicon Mac, Node 26, Rust and Sentry CLI 0.49.0. It creates outputs under `src-tauri/target/metis-release/<tag>-<source-sha-prefix>/`. Existing output directories are preserved rather than silently overwritten. Keep the source checkout at the build's SHA when running `draft`.

Local builds read only the Métis files `~/.config/metis/observability/sentry.env` and `~/.config/metis/licensing/tldraw.env`. Signing uses the existing Popcode identity in Keychain and the `metis-popcode` notarization profile. Add `~/.cargo/bin` to the command's PATH if needed. Existing signed packages and installed applications are not replaced.

## CI setup

The workflow is `.github/workflows/release-macos.yml`. It runs on version-tag pushes or manual dispatch from main. Wait for the normal quality CI on the source commit to pass, then open GitHub Actions → macOS draft release → Run workflow and enter the matching version tag. It uses a standard `macos-15` ARM runner, pinned Node/Rust/Sentry tooling, no external cache and no Actions artifacts.

The runner needs these repository secrets:

| Secret | Purpose |
| --- | --- |
| `METIS_APPLE_CERTIFICATE` | Base64-encoded, password-encrypted project Developer ID PKCS#12 |
| `METIS_APPLE_CERTIFICATE_PASSWORD` | Password for that PKCS#12 |
| `METIS_APPLE_NOTARY_PASSWORD` | App-specific password for the documented Popcode Account Holder |
| `METIS_SENTRY_AUTH_TOKEN` | Dedicated Popcode organization `org:ci` token |
| `METIS_SENTRY_DESKTOP_DSN` | Existing frontend error-reporting destination |
| `METIS_SENTRY_NATIVE_DSN` | Existing native error-reporting destination |
| `METIS_TLDRAW_LICENSE_KEY` | The currently authorized whiteboard key |

Only the last two missing interactive credentials need manual entry on this Mac. The private helper `~/.config/metis/signing/configurar-release-ci.command` guides Apple app-specific password entry and Sentry reauthorization/token creation. Values go directly to GitHub secrets and a private recovery file outside Git. Never paste them in chat or source files. Existing certificates are reused; no Fastlane nuke/revocation is part of release setup.

The CI creates a disposable keychain and notarization profile. Cleanup runs even on failure and restores the prior keychain search list. The local Keychain database and local OAuth refresh credentials are not copied to GitHub. Apple identity/team are fixed to Popcode team `C42XKG5G6X`.

## Build and verification sequence

1. Build the frontend with hidden source maps. Sentry injects debug IDs and uploads the corresponding maps. Remove maps from the shipped frontend and hash its assets.
2. Compile the native binary without rerunning Vite. Locate the dSYM whose arm64 UUID matches that binary and upload it with source information. Fail if the frontend changed after its upload.
3. Use Tauri to bundle/sign the app only. Copy it into the release output, verify bundle ID, version, arm64 architecture, Popcode team, hardened runtime and actual MCP/docs/legal resources.
4. Submit a ZIP of that app using notarytool, require `Accepted`, retrieve its log, staple and validate the ticket.
5. Create the DMG from the stapled app and Applications shortcut. Sign it, notarize it independently, staple and validate its ticket. Assess app and DMG with Gatekeeper.
6. Mount the DMG read-only, verify the actual packaged app, its ticket and matching executable, then detach it.
7. Write `manifest.json` and `SHA256SUMS`. Only the installer and these two provenance files are attached to the validated draft. No source maps, credentials or diagnostic archives are attached.

Both uploads retain the existing crash-reporting opt-in. Sentry releases include source/version metadata so each executable can resolve against its own uploaded symbols. See [Sentry setup](sentry-setup.md).

## Failure handling

A failed phase stops the pipeline. A notarization timeout does not cancel Apple's processing; preserve the submission ID and consult its status/log before resubmitting. Existing output directories intentionally block an accidental new build into a partially completed release. Preserve or remove only that build's generated output before an explicit retry.

Inspect the workflow's failed phase first. Re-enter missing/expired credentials through the private helper or GitHub secret settings. Never bypass signing, notarization, ticket validation or quality CI to obtain a draft. The draft's manifest identifies the exact source and installer checksum. Public release and a landing download CTA are separate follow-up work after the continued tldraw license is resolved.

References: [Tauri macOS signing](https://v2.tauri.app/distribute/sign/macos/), [Apple notarization](https://developer.apple.com/documentation/security/customizing-the-notarization-workflow), [Sentry CLI source maps](https://cli.sentry.dev/commands/sourcemap/), [GitHub draft visibility](https://docs.github.com/en/rest/releases/releases#list-releases).
