---
type: ADR
id: "0294"
title: "Web build error telemetry: its own build-time DSN, commit releases and explicit source-map upload"
status: active
date: 2026-10-25
---

## Context

TOL-232 sends errors from the web build (the upstream hosted deployment) to Sentry, next to the desktop intake defined by ADR 0016. The web bundle is built from the same `src/` as the desktop, so it already contains `@sentry/react`, the consent flow and the scrubbing `beforeSend`. What differs: the web bundle is minified JavaScript served to browsers, so a stack is unreadable without source maps; serving those maps would publish the whole client source map of each deploy; a desktop DSN set in a build environment must not end up in the web bundle; and in a browser the SDK records page and request URLs, which on Metis Web carry note paths and collaboration tickets.

## Decision

**The web build bakes in its own DSN from `METIS_WEB_SENTRY_DSN` (unset = no telemetry) and a `metis-web@<commit>` release, reuses the shared `initSentry` path and consent rules with a `platform: web` tag and URL scrubbing, and always emits hidden source maps outside the served output. A separate, explicit command uploads those maps to Sentry through its HTTP API when an upload token is configured. No automated web deployment is configured in this repository.**

## Options considered

- **Build-time DSN and explicit hidden-map upload** (chosen): no new dependency, nothing served that was not served before, the same bundle runs with or without telemetry depending only on the build environment, and the upload is a separate optional command.
- **Reuse `VITE_SENTRY_DSN` for the web**: one variable fewer, but a build machine with the desktop DSN would silently send web events into the desktop project, and an unconfigured web target could send events.
- **`@sentry/vite-plugin` or `@sentry/cli` for the upload**: the official tooling and debug-id based matching, but a new dependency in the root workspace (the CLI exists only in the mobile workspace, with a downloaded binary). The release-file API needs only `fetch`.
- **Public source maps**: simplest for Sentry, but they publish readable source for every deploy and cost bandwidth.
- **Maps only when a DSN is set**: a faster build without telemetry, but the map-generation path would be skipped by ordinary local checks.

## Consequences

- `pnpm build:web` takes about 15 s longer and about 0.8 GB more memory for the maps; the earlier measurements used a 4–6 GB heap. Repeat measurements on the build host before setting limits.
- `apps/web/sourcemaps/` (git-ignored) holds the maps and `manifest.json`; `pnpm upload:web-sourcemaps` uploads them (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, optional `SENTRY_URL`) and skips without a token. Run it explicitly after `pnpm build:web` using project-owned configuration, as described in `docs/web/telemetry.md`.
- A future web host must allow the configured Sentry ingest destination in its CSP `connect-src` before enabling web reporting.
- Web events reduce request, page and breadcrumb URLs to the origin and first path segment; stack frame URLs are kept for symbolication. Desktop telemetry is unchanged.
- Consent works as on desktop. Web settings live in memory today, so crash reporting has to be turned on again in each session until web settings persist.
- Re-evaluate the upload method if Sentry retires release files (then debug-id artifact bundles), or if a Sentry build plugin becomes a dependency anyway.
