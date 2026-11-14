# Métis

Free personal knowledge app. React 19 and TypeScript UI in src/, Tauri 2/Rust in src-tauri/, Expo mobile in apps/mobile/, web/server in apps/, MCP in mcp-server/.

## Workflow

Follow the user's global AGENTS.md. Plan before cross-cutting changes. Keep changes scoped. Run pnpm lint, pnpm build and relevant Vitest tests; run Rust checks for native changes and mobile checks for mobile changes. Use a fresh-context reviewer for release, updater, save and sync changes. Record actual test outcomes and platform limitations. Never claim unavailable checks passed.

For Codacy configuration or coverage uploads, read docs/codacy.md. Preserve coverage thresholds and analyze maintained sources; exclude only demonstrated generated output. Keep the upload token restricted to trusted main runs.

For macOS packaging or release automation, read docs/macos-release.md. Use the shared draft-only pipeline, preserve Sentry asset/symbol matching, and verify both the disk image and its mounted app. Keep public distribution pending the continued whiteboard license.

## Identity and privacy

Use Métis in display text and metis in machine identifiers. Keep configuration in io.github.hdoria.metis. Never read another application's secrets or modify its settings. Test only disposable vaults. Preserve LICENSE and dependency licenses. Keep applicable component notices in site/landing/public/creditos.html, and include that page in distribution resources.

## Distribution

Origin is https://github.com/hdoria/metis. Use Conventional Commits and push verified work to main. GitHub Actions runs lint, locale checks, tests and frontend build; read docs/ci.md before changing CI. Before pushing or changing CodeScene configuration, read docs/codescene.md: project 87759, local pre-push validation and MCP setup. Use the CodeScene MCP for targeted review and hotspot investigation; keep its authentication outside Git. Run build, lint and relevant tests locally before publishing changes. Signed desktop updates are enabled through metisapp.com.br/updates (docs/macos-release.md); never commit or expose the updater key. Mobile OTA and analytics remain disabled by default until Métis-owned configuration is supplied. Preserve configured desktop Sentry and its consent controls; use docs/sentry-setup.md for instrumented builds.

Deploy the landing to Vercel project popcode/metis-landing using root vercel.json and docs/hosting/vercel.md. The official domain is metisapp.com.br. The archived Sites preview is historical; do not publish future changes there. GitHub autodeployment is not connected, so use the documented CLI workflow.

## UI

Reuse existing components and locale catalogs. Apply docs/brand/metis.md. Keep locale placeholders intact. Add behavioral tests when changing logic; branding-only replacements rely on build, localization and visual checks.
