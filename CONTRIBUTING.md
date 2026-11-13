# Contributing to Métis

Report bugs and propose changes in [GitHub Issues](https://github.com/hdoria/metis/issues). Search existing issues first. For a bug, include the platform, build, steps to reproduce, expected result and actual result. Remove note contents, credentials and other private information from diagnostics.

Keep pull requests focused on one change. Explain the problem, the behavior after the change, and how you tested it. Follow the repository's [AGENTS.md](AGENTS.md), reuse existing components, and keep visible text in the locale catalogs.

Run `pnpm lint`, `pnpm build`, `pnpm l10n:validate` and the relevant tests before submitting. Native changes also need Rust verification; mobile changes need the mobile lint, typecheck and test commands in the [development guide](docs/GETTING-STARTED.md). Record the actual results. This repository has no CI workflows or Git hooks, so commits and pushes do not run these checks. Test with a disposable vault, never a real user's files.

The project is distributed under AGPL-3.0-or-later. Preserve attribution notices and check the licenses of any new dependencies. Do not add external telemetry, signing or deployment credentials to the repository.
