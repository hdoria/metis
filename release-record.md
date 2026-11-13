# Métis verification record

Current repository operation uses local validation, with no CI workflows, Git hooks or repository analysis services. See [Getting Started](docs/GETTING-STARTED.md#local-validation) and the [integration audit](docs/integrations-audit.md). Entries below record earlier builds and investigations; their old commit IDs and CI runs belong to the archived repository. They are not validation evidence for the independent repository.

## Initial identity verification

Date: 2026-11-12. Source baseline: `7ed4e6c7d11a736f78bc2379c0294b3b345112d0`.

## Delivered

Independent Métis identity across desktop, web, mobile, MCP, documentation, starter notes and package identifiers. The icon depicts one profile within another in pine green and ivory. Runtime storage, native bundle IDs and MCP ports are distinct from other applications. Automatic updates, mobile OTA and telemetry have no inherited service configuration. Onboarding uses a bundled starter vault with no remote Git dependency.

The initial identity work preserved LICENSE and applicable dependency notices. The independent repository now starts with its own history; earlier commit references in this record are historical evidence.

## Local verification

| Check | Result |
| --- | --- |
| Frozen pnpm install | Passed |
| ESLint | Passed, zero errors or warnings |
| Desktop TypeScript/frontend build | Passed |
| Web build | Passed |
| Documentation build | Passed |
| Landing page build | Passed |
| Locale validation | 21 catalogs, 1,362 English keys |
| Frontend Vitest suite | 678 files, 6,394 passed, 1 skipped |
| Server/packages suite | 48 files, 1,033 passed, 2 skipped; 95.82% line coverage |
| Mobile typecheck and suite | Passed; 461 files, 2,773 tests passed |
| Rust library suite | 1,194 passed, 2 intentionally ignored subprocess helpers |
| Native integration suite | 5 passed: Git remote configuration and web/desktop persistence parity |
| MCP suite | 73 passed |
| Release/AppImage script tests | 16 passed |
| Pages verification script | Passed all checks |
| Development vault mock tests | 4 passed |
| Mobile update isolation | 3 passed |
| Playwright Chrome smoke | 12 passed: creation, onboarding, autosave and note switching |
| macOS debug bundle | Built successfully: Métis.app, 104.02 MiB |
| Native launch | Observed Métis menus and welcome screen in the prior local build |
| Independent review | Follow-up approved; starter resolves 12 guides, manifest hashes valid, 71 icon files checked |

The final native/web builds include the retained whiteboard and opaque icon. The final native UI reinspection could not run because the computer-use connection closed; native launch was observed before that final packaging pass. Playwright used the installed Chrome browser because installation of the pinned Chromium did not finish. Smoke tests used disposable fixtures, not personal vaults.

## Distribution status and limits

The whiteboard is retained, with vendor license enforcement unchanged. Public application distribution awaits a free tldraw license and configuration of VITE_TLDRAW_LICENSE_KEY. No signed release, website deployment, app-store publication or OTA update was produced.

The macOS bundle is a local debug build. Windows/Linux packaging, physical iOS/Android behavior, notarization and signing are unverified. Mobile GitHub login requires a Métis-owned OAuth client; local folders remain usable. Optional AI services and hosting may have separate costs. These results apply only to the listed build and checks.

## Git handoff

Rebrand commit: `31ab0159589f6a3fa36df87b380814199d807a7a`, pushed to main in https://github.com/hdoria/metis. The remote main SHA was confirmed with git ls-remote. Pre-commit ESLint and pre-push build, locale and mobile isolation gates passed.

## Landing and credits follow-up (2026-11-12)

Project provenance is now centralized in site/landing/public/creditos.html. The separate provenance documents were removed and inbound links updated. The root license and dependency notices are unchanged. The native bundle includes the credits page and LICENSE.txt; byte comparisons against their sources passed. Native package metadata and the demo persona now use the independent project identity.

The Portuguese landing contains an interactive note demonstration, accent-insensitive search, related-note navigation, FAQ and real repository links. It has its own local test command. Verification: landing TypeScript/build and explicit ESLint passed; 3 interaction tests passed; 23 focused mock tests passed; docs and macOS debug package builds passed. HTTP checks returned 200 for the landing, credits and license.

Independent review at that time found no remaining issue after the dedicated landing checks were added. The reviewer verified keyboard navigation, search, empty-state recovery, FAQ and links in installed Chrome, and no horizontal overflow at widths 320, 375, 390, 768 and 1440. Two 375px screenshots were inspected. The CUA host was unavailable; no WebKit or deployed-session visual inspection is claimed.

Hosted private preview: https://metis-segundo-cerebro.blackonyx2.chatgpt.site. The Sites deployment returned succeeded. Public application distribution is still pending the whiteboard license.

The earlier CI run exposed stale fixture expectations after an EOF blank line was removed. The source note is 455 bytes. The index golden now records that size, and the Markdown/Yjs snapshot no longer lists the removed blank-line difference. Two failures were reproduced before correction; 205 package tests and the focused Rust golden test passed afterward. No production logic changed for this correction.

## Vercel landing migration (2026-11-12)

Hugo selected the Popcode team. Production deployment `dpl_2cwVAWc8pfhRF85yGbaWsidr2biF` reached READY at https://metis-landing-roan.vercel.app. It publishes the landing built from main commit `e804c65102fa90fd75a5337fffcc767172e5627f`. The Vercel production build passed; unauthenticated HTTP requests returned 200 for the landing, credits, license, JavaScript, CSS, icon and font. Published HTML, credits and license matched their local artifacts byte for byte. No remote browser inspection is claimed.

Both metisapp.com.br and www.metisapp.com.br are attached to popcode/metis-landing, with ownership verified. DNS is still pending; the authoritative .br delegation now names Cloudflare. Exact CNAME recommendations are recorded in docs/hosting/vercel.md. Custom-domain HTTPS and the live www redirect remain unverified until those DNS records are applied.

The former Sites domain binding was removed, and listing its custom domains returned an empty array. Its owner-private preview remains available as historical fallback. The Sites manifest was archived. GitHub integration rejected the repository connection; deployments currently use the documented CLI workflow.

## Custom-domain activation (2026-11-12)

After Hugo applied DNS, Vercel verified both hostnames as `configured-correctly`. Public resolvers 1.1.1.1 and 8.8.8.8 returned the expected Vercel addresses, and www returned the recommended CNAME. The initial HTTPS handshake had no certificate; `vercel certs issue metisapp.com.br www.metisapp.com.br --scope popcode` successfully issued the managed certificate for both names. TLS 1.3 and hostname validation then passed for both domains.

HTTPS requests for the landing, credits and license returned 200 and matched local artifacts. A request to `https://www.metisapp.com.br/creditos.html?check=domain` returned 308 to `https://metisapp.com.br/creditos.html?check=domain`, preserving path and query. These checks used public DNS addresses with curl's `--resolve`, without disabling certificate validation. The local system resolver still did not resolve the hostnames at verification time; universal propagation is not claimed. No application code or deployed artifact changed.

## Maintainer identity follow-up (2026-11-12)

Current-owner examples, demo notes, fixtures, mock data, design files and package author metadata now use Hugo Dória. The person fixture and its references use hugo-doria. Historical approvals keep their original context through the label upstream maintainer. Credits identify Hugo as the Métis maintainer and author of modifications; provenance, the original source revision and the link to its original trademark policy remain. LICENSE and Git history are unchanged.

The targeted scan found no remaining former-maintainer full name, personal slugs or account handles in tracked current source. Unrelated people and dependency authors are unchanged. Test results: 1,396 desktop tests, 233 mobile tests plus 37 after mention-prefix adjustments, 276 server/package tests, 3 web/index parity tests, 1,194 Rust library tests (2 ignored), 4 Rust parity tests and 3 landing tests passed. Mobile typecheck and landing build passed. UTF-8 fixture sizes, word counts and snippets were regenerated with the normal test harness.

Independent source review found no blocking issue, checked all 35 demo golden entries against physical files and 38 parity byte sizes, and found no behavioral changes beyond example and QA data. Native artifacts and live-site publication are recorded separately after verification.

## Local macOS release package and site update (2026-11-12)

Source commit `c80411d365072e4e1e0749fe1f428b1e5a91aa70` was pushed to main after ESLint and pre-push build, locale and mobile-isolation gates passed. The final native release build included the completed identity changes and regenerated MCP and agent documentation resources. Apple Silicon artifacts are in `src-tauri/target/release/bundle`: `macos/Métis.app` (42,254,738 bytes) and `dmg/Métis_0.1.0_aarch64.dmg` (23,116,257 bytes).

The DMG SHA-256 is `03d02f228b148c17cb7dd795f871f637b8c1d967a9e3d0de17ad6d849abeab07`. `codesign --verify --deep --strict` passed for the original app and the mounted copy. `hdiutil verify` passed; all 69 app files in the mounted DMG matched the source hashes. Credits, LICENSE and icon matched the repository. The binary is arm64 with minimum macOS 11.0; Info.plist retains the framework's default minimum of 10.13. No personal vaults were opened and no native runtime smoke test is claimed.

The signature is ad-hoc. No valid Apple signing identity is installed, notarization was not attempted, and `spctl` rejected the package as expected for this distribution state. The DMG is a local test artifact, not a public release. `docs/macos-local-build.md` records the installation workflow and Apple credentials needed for the next step.

Independent artifact review repeated signature, checksum, read-only mounting and all 69 file comparisons without discrepancies. It confirmed the packaged identity, license, credits and icon, and detached the volume afterward.

Vercel deployment `dpl_8XAnnF5HtAWH9GRg5bnYf7S13wrc` reached READY at https://metisapp.com.br. Its updated credits returned HTTPS 200 with certificate validation enabled and matched the current source byte for byte, including Hugo Dória as maintainer. The former personal identity is absent from that page. The public site does not distribute the local application package.

## License presentation follow-up (2026-11-12)

LICENSE includes a Métis notice naming Hugo Dória for modifications and new branding. The complete AGPL document, including its own copyright, remains byte-for-byte identical. Independent review confirmed the scoped notice and unchanged license body. A new file commit records the current maintainer's actual change without rewriting previous authorship.

GitHub's license detector rejected the notice when placed before the GNU text. Independent reproduction with Licensee 9.20.0 and 10.1.0 found 95.831% similarity for that layout and an exact AGPL-3.0 match when the same notice follows the complete original document. The notice was moved to that footer position to preserve automatic license detection.

The local app and DMG were repackaged with the updated license, retaining the same release executable and ad-hoc signing. The app's strict signature check passed and its bundled LICENSE.txt matched the source. The updated DMG is 23,116,285 bytes with SHA-256 `734e8873fe8d88548e1ebdad12a1118f1de18adf9f544c822ce6c3115fbea916`, superseding the earlier package hashes. Apple signing and notarization remain pending.

The footer correction was pushed as `5b3ceb2e5dcb563876f17da6139ed50dadb56ba7`. Independent checks confirmed an exact AGPL-3.0 match locally and AGPL-3.0 through GitHub's API, with Hugo Dória / hdoria as the latest LICENSE commit author. The updated Vercel production deployment reached READY; `https://metisapp.com.br/LICENSE.txt` returned HTTP 200 with valid TLS and matched the source SHA-256 `2e898d290812c00ec4bb138a4e58290d2d34ece0cad1f5b6e9ae9b617dbba695`.

## Popcode Apple signing preparation (2026-11-12)

The signed-in Apple Developer portal confirms Popcode team `C42XKG5G6X`; no Developer ID Application certificate appeared in its certificate list. App Store Connect confirmed a different API-key issuer from the existing iOS project's configuration. No corresponding Popcode private API key was found in the inspected local locations, and no existing code-signing identity is installed.

Fastlane 2.237.0 is available in an isolated local installation. Its certificate command, explicitly selecting the Popcode team and Developer ID Application type, reached the Apple ID password prompt. It was stopped without authentication, certificate creation or revocation. An interactive local setup now covers Apple ID authentication and the `metis-popcode` notarization credential profile. The user must complete the local prompts before official signing can proceed. The existing local DMG remains ad-hoc; no notarized package or public binary release is claimed.

The user's first local attempt exposed `Service key is empty` before authentication. The old Apple configuration endpoint returned HTTP 404, matching upstream Fastlane issue 30199 and fix 30206. The isolated installation was updated and pinned to official Fastlane 2.241.2; the client source matches that release byte for byte. A fresh client without credentials reproduced the 2.237.0 failure. The corrected public HEAD lookup returned a nonempty service key, with no cookies, authorization, redirects or cache writes. Version/help checks and the unchanged G2/Popcode certificate configuration passed. The interactive setup can now be retried; official signing remains pending authentication.

The next attempt authenticated successfully, but Apple rejected certificate creation because it requires the Account Holder. App Store Connect's People page confirms `iosdev@popcode.com.br` is Admin and `contato@popcode.com.br` is Account Holder. The local setup and documented commands now use the confirmed holder for certificate creation and notarization credentials, while retaining team `C42XKG5G6X`. Inherited password and session variables are cleared to avoid authenticating as the previous account. No certificate was created or revoked by the rejected attempt.

## Signed and notarized macOS package (2026-11-12)

The holder completed the local setup. Keychain lists a valid `Developer ID Application: Popcode (C42XKG5G6X)` identity, and the `metis-popcode` notarization profile authenticated successfully. No existing certificates were revoked. Credentials and private signing material remain outside Git.

A separate copy of the existing production app was signed with the Popcode certificate, hardened runtime and a secure timestamp. Apple accepted the application submission `66376cf6-6d17-4988-997a-a798c974e8de` and disk-image submission `4eff3b66-b902-4906-9c89-c83133249cfe`; both notarization logs contain no issues. Tickets were attached and validated for the app, DMG and app mounted from the DMG. Gatekeeper reported `accepted`, with source `Notarized Developer ID`; strict signature checks with the Popcode team requirement and disk-image verification passed.

Final local artifacts are `src-tauri/target/release/bundle/signed/macos/Métis.app` (42,256,717 bytes, 70 files) and `src-tauri/target/release/bundle/signed/dmg/Métis_0.1.0_aarch64.dmg` (23,115,501 bytes). The signed DMG SHA-256 is `32b7db71611c91154a15651915d197a8f8f98ebb96d5a5b705108052948f6975`. The package target remains version 0.1.0, arm64, macOS 11 or later. The earlier ad-hoc app and DMG are unchanged, including DMG SHA-256 `734e8873fe8d88548e1ebdad12a1118f1de18adf9f544c822ce6c3115fbea916`.

Local verification records are retained under `src-tauri/target/metis-local-package/official-popcode.ixDzNe/`, with consolidated metadata in `official-package-metadata.json`. No app was installed or launched against personal data. This completes Apple signing and notarization; public binary distribution still awaits the tldraw license and no public release was uploaded.

## tldraw evaluation package and integration audit (2026-11-13)

The supplied key was verified by SDK 4.5.10 as a valid evaluation license with expiry 2026-11-27. It remains outside Git; the enforcement code was unchanged. A fresh production frontend and native executable include it, confirmed by exact frontend/Brotli/native-artifact comparisons. The package is an evaluation build; continued public distribution still needs an appropriate license beyond the trial.

The new local app and DMG were signed with Popcode's existing Developer ID and notarized independently. Apple accepted submissions `79d24349-5a5f-4ef1-81b8-81f64204ad6a` and `9fbcc3f1-9aea-4d11-b032-8daeaa717ecb`, with no issues. Independent artifact review passed signatures, hardened runtime, timestamps, stapled tickets, Gatekeeper, read-only mounted contents and licensed-asset hashes. The final DMG is `src-tauri/target/release/bundle/evaluation/dmg/Métis_0.1.0_aarch64_avaliacao.dmg`, 23,117,380 bytes, SHA-256 `bf1aebc92a021cfa2eafe5a687fcd9afe6e426fc2dfc15dba6f3dbc80a02fa83`. The prior signed package was preserved; no installation or public upload occurred.

The existing 18 whiteboard tests and 59 telemetry tests passed. A real isolated browser whiteboard rendered licensed, created a shape and saved a snapshot; the new native app was not launched against a vault. The [integration audit](docs/integrations-audit.md) records absent Sentry/PostHog configuration in this build, evaluation-license network behavior, inactive CI services, and manual Todoist/deployment residues requiring separate decisions. No SaaS accounts, user consent settings or integrations were changed.

## Popcode Sentry setup and signed evaluation package (2026-11-13)

The authenticated Popcode account now owns two Métis projects under its internal team: `metis-desktop` for React and `metis-native` for Rust. Their separate DSNs remain in private local build configuration. No long-lived auth token entered the repository, and no GitHub secrets or automatic upload workflow were added. Crash reporting retains per-user opt-in, existing redaction and disabled default PII collection. PostHog, Replay, tracing and log ingestion remain unconfigured.

A production React smoke event reached [METIS-DESKTOP-2](https://popcode.sentry.io/issues/7846822529/) and resolved the original `throwMetisSentryProductionSmoke` frame with source context through a debug ID, without processing errors. A real Tauri Rust panic reached [METIS-NATIVE-1](https://popcode.sentry.io/issues/7846821455/) and resolved the original source line after matching dSYM/source upload. Both used disposable verification settings; the native test exited before vault/window/MCP startup. All temporary triggers were removed before the final build. These verify Chromium JavaScript errors and Rust panics, not OS-level crashes or the final macOS WebView at runtime.

The final production build uses releases `metis-desktop@0.1.0+sentry.20261113` and `metis-native@0.1.0+sentry.20261113`, environment `production`. The 1,568 JavaScript/source-map pairs were uploaded before native compilation; map files were then archived outside the shipped assets. Matching production native UUID `3B9D9A22-D23B-3F45-BAB3-05DBD7484B40` and source bundle were processed successfully by Sentry. Exact embedded asset comparisons verified the expected configuration and evaluation license without exposing values.

The new app and DMG use Popcode's existing Developer ID, hardened runtime and timestamp. Apple accepted app submission `70b7e5fe-2eb3-4beb-94a6-9584cf8c23cc` and DMG submission `15a1a904-c6d2-4119-be25-689bf11eebb5`, with no issues. Staples, strict signatures, Gatekeeper, disk-image integrity and mounted payload comparisons passed. Final installer: `src-tauri/target/release/bundle/sentry-evaluation/dmg/Métis_0.1.0_aarch64_sentry_avaliacao.dmg`, 23,986,223 bytes, SHA-256 `adf593d813551a0a7233d39ab7f9c53ef3ad2ba67efc8bf6d2ce84fcee55fe0b`. The corresponding signed app contains 70 files totaling 45,989,261 bytes. Older signed packages and the installed app were preserved. No public binary was uploaded; tldraw remains an evaluation license expiring on 2026-11-27.

Validation passed 66 frontend telemetry tests, 17 Rust telemetry tests, TypeScript and the production frontend/native builds. Independent source review confirmed consent, release/environment fallbacks and removal of temporary instrumentation. Build configuration, event evidence and limitations are documented in [Sentry setup](docs/sentry-setup.md); the initial [integration audit](docs/integrations-audit.md) now explicitly distinguishes its earlier unconfigured state from this new build.

## Independent repository tooling (2026-11-13)

Repository analysis integrations, CI workflows, Git hooks and translation-service tooling were removed. The local lint, build, test and locale-validation commands remain. Mobile update runtime configuration and fingerprint checks remain, while inherited publishing scripts were removed. Sentry runtime support, local signing procedures and Vercel CLI deployment are retained.

The [integration audit](docs/integrations-audit.md) and current development guides describe the resulting operation. Local verification results for this change must be recorded separately after the checks finish.
