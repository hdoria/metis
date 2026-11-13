<p align="center"><img src="public/metis-icon.png" width="120" alt="Métis icon"></p>

# Métis

A free app for your second brain. Write notes in Markdown, connect ideas, and keep their history with Git. Your files stay yours.

Métis takes its name from the Greek titaness of wisdom and good counsel. She advised Zeus from inside his head: a second brain inside the first. Our symbol carries that idea, with one profile nested inside another.

## What is here

The repository includes a React/Tauri desktop app, a web app and server, an Expo mobile app, and an MCP server for working with your vault through AI tools.

The app is free and open source under AGPL-3.0-or-later. Optional AI providers and hosting services can have their own costs. The whiteboard editor is retained with tldraw’s own license enforcement. Public distribution is pending a free tldraw license. Set `VITE_TLDRAW_LICENSE_KEY` when that license is granted; saved drawings remain in your notes.

## Run the desktop app

Install Node.js, pnpm and the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system.

```sh
git clone https://github.com/hdoria/metis.git
cd metis
pnpm install --frozen-lockfile
pnpm tauri dev
```

For a browser development preview, run `pnpm dev`. Run `pnpm build` to build the desktop frontend, `pnpm build:web` for the web app, and `pnpm docs:build` for the documentation.

This is an independent repository. Validation runs locally with `pnpm lint`, `pnpm l10n:validate` and the tests relevant to each change. [CodeScene setup](docs/codescene.md) adds local pre-push Code Health validation and access to the Métis analysis project. CI workflows are not configured.

## Releases

Packaged Métis releases will be listed on [GitHub Releases](https://github.com/hdoria/metis/releases). Automatic updates and mobile OTA delivery are disabled until this project has its own signing and publishing configuration. No Homebrew package or public TestFlight invitation is advertised for this project.

## Documentation and contributions

Start with the [documentation](site/docs.md), [installation instructions](site/start/install.md), and [contribution guide](CONTRIBUTING.md). Report reproducible problems in [Issues](https://github.com/hdoria/metis/issues).

## License

The source is [AGPL-3.0-or-later](LICENSE). Dependency notices are collected on the [credits page](site/landing/public/creditos.html).
