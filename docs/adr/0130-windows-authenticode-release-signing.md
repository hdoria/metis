---
type: ADR
id: "0130"
title: "Windows Authenticode signing for release installers"
status: retired
date: 2026-05-27
---

## Current status

Retired on 2026-11-13. This records a previous Windows release policy. The independent repository has no release workflows or Windows signing helpers. Re-evaluate and validate the signing policy before publishing a Windows installer; the historical process below is not an executable release guide.

## Context

Metis's Windows release job already produced Tauri updater signatures, but those signatures are not the Windows trust signal used by SmartScreen, Smart App Control, Defender, or WDAC policies when a user downloads and runs an installer from the browser. A managed Windows 11 user reported that the stable NSIS installer was blocked by Windows Security with no bypass option.

Microsoft's current guidance is that unsigned public installers can be fully blocked by enterprise policy, while signed installers at least carry a publisher identity and can build reputation across releases. Store distribution would provide the strongest SmartScreen outcome, but Metis does not currently publish a Microsoft Store package.

## Decision

**Metis release CI must Authenticode-sign Windows app executables and installers before publishing them.**

- Alpha and stable Windows release jobs import a CI-provided code-signing certificate from GitHub secrets.
- The workflow generates a temporary Tauri config that sets `bundle.windows.certificateThumbprint`, `digestAlgorithm`, and `timestampUrl`, then passes that config to `pnpm tauri build`.
- The Windows job verifies the produced app executable and installer artifacts with `Get-AuthenticodeSignature` and fails before upload if any signature is missing, invalid, or signed by an unexpected certificate.
- The public stable download page requires an explicit Windows installer click and tells managed-device users that IT may need to approve the Metis publisher before first install.

## Options considered

- **CI-enforced Authenticode signing** (chosen): gives Windows users and enterprise admins a real publisher identity, lets certificate reputation transfer across releases, and blocks accidental publication of unsigned installers. Cons: release jobs now depend on code-signing secrets and a valid certificate.
- **Documentation-only SmartScreen warning**: cheaper, but it leaves managed-device users with no supported path when policy removes the bypass option.
- **Microsoft Store distribution only**: strongest SmartScreen behavior, but it requires a separate packaging, submission, and release-management path that Metis does not yet own.
- **Portable ZIP fallback**: still downloads executable content from the browser and can remain subject to SmartScreen, Mark-of-the-Web, Smart App Control, or WDAC policy.

## Consequences

- Windows release failures caused by missing or expired code-signing credentials are intentional release blockers.
- Tauri updater signatures remain required for in-app updates, but they are treated as separate from Windows Authenticode trust.
- Enterprise-managed Windows installs can be documented around a stable Metis publisher identity instead of asking users to disable security policy.
- A future Microsoft Store/MSIX distribution path can supersede or supplement this policy if Metis decides to support Store-managed installs.
