---
type: Note
_organized: true
---

# Metis Web error telemetry (TOL-232)

The web build supports opt-in Sentry reporting through the same code the desktop app uses (`src/lib/telemetry.ts`, ADR 0016). It needs its own build-time configuration; the configured desktop projects do not configure the web target. Decision record: [ADR 0294](../adr/0294-web-build-error-telemetry-and-hidden-source-maps.md).

## What is sent, and when

- **Nothing without a DSN.** The web build gets its own DSN from the build environment. With no DSN configured, the bundle never starts Sentry. The desktop `VITE_SENTRY_DSN` never reaches the web bundle: `apps/web/vite.config.ts` replaces it.
- **Nothing without consent.** Same rule as desktop: Sentry starts only when crash reporting is turned on (Settings → Privacy, or the consent dialog) and there is an anonymous id (`useTelemetry`).
- **Tags.** Every web event carries the tag `platform: web` and the release `metis-web@<commit SHA>` of the build. Desktop events keep their own tags and calendar releases, unchanged.
- **Privacy.** The shared `beforeSend` scrubs vault paths and drops known benign errors. On web, request and breadcrumb URLs (page URL, fetch, XHR and navigation) are also cut down to the origin and first path segment, so note paths (`/v1/files/<path>`) and tickets in query strings never leave the browser (`src/lib/webSentry.ts`). Stack frame URLs stay as they are, because Sentry needs them to apply the source maps.
- **CSP.** A web host must allow its configured Sentry ingestion origin in `connect-src`. Hosting and its policy need separate configuration; they are not supplied by the local build.

## Source maps

`pnpm build:web` always generates hidden source maps (`build.sourcemap: 'hidden'`: no `sourceMappingURL` comment in the served files). After the bundle is written, the `metis-web-hidden-sourcemaps` plugin (`apps/web/sentryWebBuild.ts`) moves every `.map` out of `apps/web/dist` into `apps/web/sourcemaps/` (git-ignored), with a `manifest.json` naming the release and the bundle file each map belongs to. Nothing under `apps/web/dist` is a map, so nothing deployed from it is.

`pnpm upload:web-sourcemaps` (`apps/web/sourcemapUpload.ts`) uploads them through Sentry's HTTP API: it creates the release, then uploads each bundle file (with a `Sourcemap` header naming its map) and its map as release files named `~/assets/...`. It skips cleanly, exit 0, when `SENTRY_AUTH_TOKEN` is not set. A failed upload exits 1.

## Manual build and upload configuration

Set the following environment variables for an explicitly configured web build and upload. Keep the upload token outside Git and browser-visible environment variables.

| Environment variable | Read by | Value |
|---|---|---|
| `METIS_WEB_SENTRY_DSN` | `pnpm build:web` | Public DSN for the web project's ingestion endpoint |
| `SENTRY_AUTH_TOKEN` | `pnpm upload:web-sourcemaps` | Secret token authorized to create releases and upload release files |
| `SENTRY_ORG` | `pnpm upload:web-sourcemaps` | Organization slug; required with a token |
| `SENTRY_PROJECT` | `pnpm upload:web-sourcemaps` | Web project slug; required with a token |
| `SENTRY_URL` | `pnpm upload:web-sourcemaps` | Optional server URL; defaults to `https://sentry.io` |

`METIS_WEB_RELEASE` overrides the release name for a manual build. Otherwise the build reads the commit with `git rev-parse HEAD`. A build outside a Git checkout needs an explicit release before upload. Run `pnpm build:web`, then `pnpm upload:web-sourcemaps` against the matching generated files. There is no repository workflow for upload or web deployment.

## Checking it locally with a fake ingest

Build without a DSN and run `apps/web/tests/sentry-telemetry.spec.ts` to check that nothing is sent with crash reporting on and that no map is served. The full path runs against a local fake ingest: build with a DSN that points at it, then run the same spec with the same variable.

```bash
export METIS_WEB_SENTRY_DSN=http://publickey@127.0.0.1:48230/1
pnpm build:web
pnpm playwright:web apps/web/tests/sentry-telemetry.spec.ts --project chromium
```

The spec starts the fake ingest on the DSN's port, turns crash reporting on, throws an error from bundled code (`main.tsx`'s test bridge), and checks that the envelope carries `platform: web`, the release from `apps/web/sourcemaps/manifest.json`, and a throwing frame that maps back to the `throw` line in `src/main.tsx` through the hidden map. Rebuild without the variable afterwards.
