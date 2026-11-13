# macOS local package

For repeatable signed packaging and GitHub draft automation, use the [macOS release workflow](macos-release.md). The artifacts and checks below remain historical evidence for their exact builds.

The current package targets Apple Silicon (arm64), macOS 11 or later. The official local package is signed with Developer ID Application: Popcode (`C42XKG5G6X`), notarized by Apple and accepted by Gatekeeper. The earlier ad-hoc test build is retained separately. For the newest build with Sentry and the tldraw trial, use the Sentry-enabled evaluation package below.

## Original signed package

- Installer: `src-tauri/target/release/bundle/signed/dmg/Métis_0.1.0_aarch64.dmg`
- Standalone app: `src-tauri/target/release/bundle/signed/macos/Métis.app`

Open the signed DMG and drag Métis into Applications. Close a running copy of Métis before replacing it. The package is version 0.1.0, for Apple Silicon; no Intel build is included.

The DMG is 23,115,501 bytes, with SHA-256 `32b7db71611c91154a15651915d197a8f8f98ebb96d5a5b705108052948f6975`. Both the app and DMG received Apple's `Accepted` result without issues, have valid stapled tickets and passed Gatekeeper assessment. The mounted app matched the signed standalone app. No personal vaults were opened for verification.

Public download distribution still awaits the whiteboard vendor license. Signing and notarization are complete; that separate prerequisite remains recorded in `release-record.md`.

## Licensed evaluation package — 2026-11-13

A separate, freshly compiled Apple Silicon package now includes a tldraw evaluation license. The SDK verified its signature and returned `licensed`; its encoded expiry is **2026-11-27**. This is not the hobby license required for continued public distribution after the trial. The key is stored outside Git in `~/.config/metis/licensing/tldraw.env` with mode 0600 and was passed to the build as `VITE_TLDRAW_LICENSE_KEY`. Future builds must load that value explicitly; the previously signed package and installed application were not replaced.

- Installer: `src-tauri/target/release/bundle/evaluation/dmg/Métis_0.1.0_aarch64_avaliacao.dmg`
- App: `src-tauri/target/release/bundle/evaluation/macos/Métis.app`
- DMG: 23,117,380 bytes; SHA-256 `bf1aebc92a021cfa2eafe5a687fcd9afe6e426fc2dfc15dba6f3dbc80a02fa83`.

The new app and DMG are signed by Popcode, notarized by Apple with `Accepted` and no issues, stapled and accepted by Gatekeeper. Independent review repeated signature/ticket checks, queried Apple's results, mounted the image read-only, compared its contents, and verified the exact licensed frontend blobs inside the native executable. The old signed DMG checksum remains unchanged. The new evaluation package has not been installed or published.

Validation also passed 18 whiteboard tests and 59 telemetry tests. A disposable Chromium session rendered the real whiteboard, observed its actual licensed state, created a rectangle and saved a snapshot without a license gate or external requests. That smoke test is a browser test, not a launch of the new native package. Sanitized build/package evidence is retained in `src-tauri/target/metis-local-package/tldraw-evaluation-2026-11-13/`; [the integration audit](integrations-audit.md) records telemetry behavior and remaining account decisions.

## Sentry-enabled evaluation package — 2026-11-13

The newest local package adds Popcode-owned React and Rust error-reporting destinations, release/environment metadata and matching uploaded source maps/native symbols. Error reporting still requires the user's opt-in. It retains the tldraw evaluation license expiring on **2026-11-27**; continued public distribution awaits the appropriate license.

- Installer: `src-tauri/target/release/bundle/sentry-evaluation/dmg/Métis_0.1.0_aarch64_sentry_avaliacao.dmg`
- App: `src-tauri/target/release/bundle/sentry-evaluation/macos/Métis.app`
- DMG: 23,986,223 bytes; SHA-256 `adf593d813551a0a7233d39ab7f9c53ef3ad2ba67efc8bf6d2ce84fcee55fe0b`.

Both the app and DMG were signed with Popcode's existing Developer ID, notarized with `Accepted` and no issues, stapled and accepted by Gatekeeper. The mounted payload matched the signed app. Exact configuration-bearing frontend blobs and the native DSN/release were verified inside the executable without printing their values. Temporary verification triggers and public source maps are absent from the shipped build. This is an arm64 package for macOS 11 or later; no installation, public upload or launch against personal data occurred. Older packages remain unchanged.

See [Sentry setup](sentry-setup.md) for the build/upload workflow, verified React and Rust events, and test limitations. Sanitized production evidence is in `src-tauri/target/metis-sentry-verification/`; signing records are in `src-tauri/target/metis-local-package/sentry-evaluation-artifact.URqfGy/`.

## Build and verify an ad-hoc test package

Run from the repository root with Rust's cargo binary available in PATH. Keep Apple notarization credentials out of the local ad-hoc build environment. The tested workflow builds sources first and then packages the resulting executable:

```sh
APPLE_SIGNING_IDENTITY=- pnpm tauri build --no-bundle
APPLE_SIGNING_IDENTITY=- pnpm tauri bundle --bundles app,dmg
codesign --verify --deep --strict --verbose=2 'src-tauri/target/release/bundle/macos/Métis.app'
hdiutil verify 'src-tauri/target/release/bundle/dmg/Métis_0.1.0_aarch64.dmg'
```

Outputs:

- `src-tauri/target/release/bundle/macos/Métis.app`
- `src-tauri/target/release/bundle/dmg/Métis_0.1.0_aarch64.dmg`

Open the DMG and drag Métis into Applications to install the local test build. macOS may require an explicit approval for this app in Privacy & Security because the signature is ad-hoc. Signature integrity alone does not mean Apple notarization or Gatekeeper approval.

The packaging check mounts the DMG read-only, compares the packaged application with its source, and checks the icon, credits and license. Launching against personal vaults is not part of that verification.

## Apple distribution requirements

To prepare a Developer ID-signed and notarized package, provide these through the local development setup:

- Active Apple Developer Program membership and the intended team.
- A valid Developer ID Application certificate and its private key in Keychain Access. A certificate without the matching private key is insufficient.
- Authentication for notarization: an App Store Connect API key, or Apple ID with an app-specific password and Team ID. Keep credentials in the local environment or a Keychain profile, outside Git and chat.

The current Mac has a valid Popcode Developer ID Application identity and the `metis-popcode` notarization profile in Keychain. Future packages must be signed, submitted for notarization, stapled and assessed again; the completed 0.1.0 checks do not apply to later builds.

See [Tauri macOS signing](https://v2.tauri.app/distribute/sign/macos/) and [Apple Developer ID](https://developer.apple.com/developer-id/). Public distribution also awaits the whiteboard vendor license already recorded in `release-record.md`.

## Popcode signing setup

The Apple Developer portal confirms Popcode's team ID as `C42XKG5G6X`. App Store Connect confirms `contato@popcode.com.br` is its Account Holder. Use that account to create Developer ID Application certificates: the existing iOS account `iosdev@popcode.com.br` has Admin access, which is insufficient for this operation. The existing iOS project's team and API-key issuer also differ from Popcode's; do not copy its certificate storage or API credentials into this workflow.

Fastlane 2.241.2 is installed and explicitly pinned outside the repository at `~/.local/share/metis-fastlane/fastlane`. Its wrapper isolates Ruby gems and selects `/Applications/Xcode.app/Contents/Developer` only for its subprocess. Version and `cert --help` checks passed. The holder completed authentication, certificate creation and notarization credential setup locally.

The initially reused version, 2.237.0, failed before authentication with `Service key is empty`: Apple's old public configuration endpoint returns HTTP 404. Updating to the official 2.241.2 release fixes that lookup. A credential-free test reproduced the old failure, then verified that the new version obtains the current public widget key using a HEAD request without cookies or redirects. No private session or hardcoded key was used. See [the upstream fix](https://github.com/fastlane/fastlane/pull/30206).

The local interactive setup is `~/.config/metis/signing/configurar-assinatura.command`. It waits for user input before running:

```sh
env -u CERT_API_KEY -u CERT_API_KEY_PATH -u DELIVER_API_KEY -u DELIVER_API_KEY_PATH \
  -u APP_STORE_CONNECT_API_KEY -u APP_STORE_CONNECT_API_KEY_PATH \
  -u FASTLANE_SESSION -u SPACESHIP_SESSION -u FASTLANE_PASSWORD \
  FASTLANE_DONT_STORE_PASSWORD=1 ~/.local/share/metis-fastlane/fastlane cert \
  --username contato@popcode.com.br --team_id C42XKG5G6X \
  --type developer_id_application --platform macos --force false \
  --skip_set_partition_list true \
  --output_path ~/.config/metis/signing

xcrun notarytool store-credentials metis-popcode \
  --apple-id contato@popcode.com.br --team-id C42XKG5G6X
```

The first command requires the normal Apple ID password and any requested two-factor verification. The second requires an app-specific password and saves it in macOS Keychain. Keep passwords out of chat, shell arguments and Git. The local setup clears inherited API-key options so the Apple ID flow cannot silently use another project's issuer. Its signing directory is private to the current user.

`cert` creates a Developer ID Application G2 certificate if needed and never revokes existing certificates. No `match nuke` is needed. The certificate's private key stays in the local signing directory and Keychain; retain a secure backup before deleting that directory. Because automatic keychain partition changes are disabled, macOS may ask for permission when `codesign` first uses the key.

After setup on another Mac, verify that `security find-identity -v -p codesigning` lists a Developer ID Application identity for `C42XKG5G6X`, then sign, notarize, staple and assess a fresh package. The original ad-hoc artifacts remain unsigned by Developer ID; use the separate `bundle/signed/` outputs above for installation. See [Fastlane cert](https://docs.fastlane.tools/actions/cert/) and [Fastlane authentication](https://docs.fastlane.tools/getting-started/ios/authentication/).
