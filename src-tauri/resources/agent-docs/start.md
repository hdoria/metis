# First Launch

Source: start/first-launch.md
URL: /start/first-launch

# First Launch

The first launch flow is designed to get you into a real vault quickly without hiding the local-first model.

## What You Choose

Métis asks whether you want to:

- Create or clone the Getting Started vault.
- Open an existing local vault.
- Create a new empty vault.

The Getting Started vault is cloned locally and then disconnected from its remote. That keeps the sample safe to edit without accidentally pushing tutorial changes.

## What Métis Creates

Métis stores app-level settings on the local machine. Your notes stay in the vault folder you choose.

| Data | Stored in |
| --- | --- |
| Notes and attachments | Your vault folder |
| Type definitions and saved views | Your vault folder |
| Window size, zoom, recent vaults | Local app settings |
| Cache data | Rebuildable local cache |

## First Commands To Try

- `Cmd+K` / `Ctrl+K`: open the command palette.
- `New Note`: create a note in the current vault.
- `Open Getting Started Vault`: clone the public sample vault.
- `Reload Vault`: rescan files after external edits.

## AI Setup Prompt

Métis can show an optional AI agents prompt after a vault is open. It checks common local install locations for supported coding agents and gives you setup paths, but you can dismiss it and use Métis without AI.

---

# Getting Started vault

Source: start/getting-started-vault.md
URL: /start/getting-started-vault

# Getting Started vault

Métis includes a starter vault in the app. Creating it works offline and does not clone a remote repository.

The starter contains Markdown notes, type definitions, example properties, an editor playground, a sample spreadsheet and guides to the sidebar, Git and AI tools. Open **Get familiar with Métis** for a tour.

Métis creates a local Git repository for the starter without a remote. You can edit the notes, commit locally or delete the sample when you are finished. To sync a vault later, choose your own Git remote.

You can also open an existing folder of Markdown files. Métis does not require a special folder structure. Removing a vault from the app's list does not delete the files on disk.

---

# Install Métis

Source: start/install.md
URL: /start/install

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

---

# Open Or Create A Vault

Source: start/open-or-create-vault.md
URL: /start/open-or-create-vault

# Open Or Create A Vault

A Métis vault is a folder on disk. The folder can contain Markdown notes, attachments, type definitions, saved views, and Git metadata.

## Open An Existing Folder

Choose an existing folder if you already have Markdown notes. Métis scans `.md` files and uses frontmatter when it exists.

Good starting points:

- A folder of plain Markdown files.
- An Obsidian-style vault.
- A Git repository containing notes.
- A copy of the Getting Started vault.

## Create A New Vault

Choose a new empty folder if you want Métis conventions from the start. New notes and optional type definitions are created as Markdown files.

## Use More Than One Vault

You do not have to merge everything into one folder. Register each local folder as its own vault, then turn on `Use multiple vaults at the same time` in `Settings` -> `Vaults`.

Once enabled, the bottom-left vault menu lets you include vaults in the unified graph. Search, quick open, wikilinks, and note lists can span the included vaults, while Git sync and commits remain tied to each vault's own repository.

## Git Is Recommended, Not Required

Métis works well with a plain folder of Markdown files. You can open, edit, organize, and search notes without making the vault a Git repository.

Git is recommended when you want local history, diff views, recovery, pull, push, and remote sync without a proprietary backend. If a vault is not already a repository, Métis can initialize one when you explicitly ask it to.