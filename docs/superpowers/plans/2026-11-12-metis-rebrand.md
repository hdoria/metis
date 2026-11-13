# Métis implementation plan

> Historical plan from the archived repository. Current validation runs locally; see [Getting Started](../../GETTING-STARTED.md#local-validation).

**Goal:** Deliver an independent free Métis fork with its own visual and technical identity.
**Architecture:** Keep the React/Tauri, web, mobile and MCP architecture. Rename identifiers consistently, isolate configuration and services, and keep required source attributions.
**Tech Stack:** React 19, TypeScript, Tauri 2/Rust, Vite, Expo, pnpm.
**Spec:** docs/brand/metis.md

## Constraints

Preserve AGPL-3.0-or-later and attribution. Keep user vaults untouched. No upstream signing, telemetry, deploy or update configuration. Public display name is Métis; technical identifiers use metis. Remote is hdoria/metis. Existing upstream history is preserved in Git. No dependency migrations unrelated to rebranding.

## Tasks

- [x] Clone current source into ~/projects/metis and create GitHub fork.
- [x] Rename source, file paths, packages, protocols, fixtures and documentation consistently. Keep legacy namespaces distinct to avoid destructive migration collisions.
- [x] Replace native/web/mobile icons and public branding; remove inherited sponsor/author claims and stale promotional assets.
- [x] Isolate updater, MCP ports, settings, mobile OTA and onboarding from upstream services. Add focused tests for changed behavior.
- [x] Replace upstream-specific agent instructions and CI publication flows with local validation and fork CI.
- [x] Run install, lint, desktop/web build, localization, relevant tests, Rust checks and UI smoke where supported.
- [x] Independent final audit of identity, attribution, services and verification evidence; fix findings.
- [x] Commit, push main, verify remote SHA and report exact limits. Rebrand commit: `31ab0159589f6a3fa36df87b380814199d807a7a`; remote main matched. See release-record.md for evidence and limits.

## Review focus

Distinct settings and MCP identities must coexist with other apps. Starter vault creation must not depend on an invented repository. No inherited update keys or mobile OTA projects. No original artwork in compiled assets. Whiteboard distribution requires its own license decision.

## Stop condition

The fork is committed and pushed with the new identity and icon, applicable checks pass, and any platform limitations are documented. Signed public releases and store publication require separate infrastructure and are outside this rebrand.
