---
type: ADR
id: "0138"
title: "Require Authenticode signing for all Windows release channels"
status: retired
date: 2026-06-09
supersedes: "0132"
amends: "0130"
---

## Current status

Retired on 2026-11-13. This records a previous Windows release policy. The independent repository has no release workflows or Windows signing helpers. Re-evaluate and validate the signing policy before publishing a Windows installer; the historical process below is not an executable release guide.

## Context

ADR 0132 temporarily allowed alpha Windows artifacts to build without Authenticode when the repository did not yet have Windows code-signing certificate secrets. That kept the alpha channel moving during certificate provisioning, but it also normalized unsigned Windows artifacts and made stable promotion exceptions easy to repeat.

## Decision

**All Windows release artifacts must be Authenticode-signed before upload, for both alpha and stable channels.**

- The reusable release artifact workflow no longer accepts a soft-gate input for Windows Authenticode.
- The Windows build validates that Tauri updater signing secrets and Windows Authenticode certificate/password secrets are present before packaging starts.
- The Windows build always passes the generated Authenticode config to `pnpm tauri build`.
- The Windows build always verifies the app executable and installer signatures with `Get-AuthenticodeSignature` before artifact upload.

## Consequences

- Missing, expired, partial, or invalid Windows code-signing credentials fail alpha and stable release artifact builds.
- The repository cannot publish unsigned Windows installers as a convenience fallback.
- A trusted Windows code-signing certificate still has to come from a certificate authority or signing service; generating a local self-signed certificate is not an acceptable substitute for release artifacts.
- If Metis later adopts Microsoft Trusted Signing, Store packaging, or another signing provider, that integration should replace the PFX secret import path while preserving mandatory verification before upload.
