# Install Métis

Métis is available as source code. Packaged builds will appear on [GitHub Releases](https://github.com/hdoria/metis/releases) when they are ready. This fork does not currently provide a Homebrew package or a public TestFlight invitation.

Public distribution is pending a free tldraw license for the included whiteboard editor. Local development retains the vendor’s own license checks.

## Build from source

Install Node.js, pnpm, Rust, and the [Tauri platform prerequisites](https://v2.tauri.app/start/prerequisites/).

```sh
git clone https://github.com/hdoria/metis.git
cd metis
pnpm install --frozen-lockfile
pnpm tauri dev
```

Use `pnpm dev` for the browser development preview. The native app is needed to verify desktop integration with local files and system Git.

## First launch

Open Métis, create a starter vault or choose an existing Markdown folder. Use `Cmd+K` on macOS or `Ctrl+K` on Windows and Linux to open the command palette.

See [First Launch](/start/first-launch) and [Supported Platforms](/reference/supported-platforms).
