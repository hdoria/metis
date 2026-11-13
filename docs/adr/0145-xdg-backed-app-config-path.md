---
type: ADR
id: "0145"
title: "XDG-backed app config path"
status: active
date: 2026-06-27
---

## Context

Metis stores installation-local state such as settings, registered workspaces, window state, AI workspace session metadata, and local AI provider secrets outside the vault. The product rule is still that vault-shaped content belongs in the vault, while machine- and installation-specific preferences stay in app config.

Users also want this app config to be portable through dotfile backup workflows. The existing implementation documented `~/.config/io.github.hdoria.metis`, but the Rust path resolver used the platform config directory directly and duplicated that decision in settings and vault-list code. That made `$XDG_CONFIG_HOME` support unclear and increased the risk that new app config files would pick a different path.

## Decision

**Metis resolves app-owned config files through one Rust helper that follows the XDG config location on Unix platforms and keeps the platform config directory as a read fallback.**

All app-owned config JSON remains under the `io.github.hdoria.metis` namespace:

```text
${XDG_CONFIG_HOME:-$HOME/.config}/io.github.hdoria.metis/settings.json
${XDG_CONFIG_HOME:-$HOME/.config}/io.github.hdoria.metis/vaults.json
${XDG_CONFIG_HOME:-$HOME/.config}/io.github.hdoria.metis/window-state.json
${XDG_CONFIG_HOME:-$HOME/.config}/io.github.hdoria.metis/ai-provider-secrets.json
```

If `XDG_CONFIG_HOME` is missing on Unix platforms, Metis uses `$HOME/.config`. If `XDG_CONFIG_HOME` is relative, Metis ignores it and falls back to the next valid config root. Windows keeps using the platform config directory unless the user sets an absolute `XDG_CONFIG_HOME`.

Reads check the preferred Metis namespace first, then the legacy `io.github.hdoria.metis.legacy` namespace, and then the previous platform config directory when it differs from the XDG location. Writes always go to the Metis namespace under the preferred config root. The helper lives in `src-tauri/src/app_config.rs`, and app config consumers should call it instead of joining their own config root.

## Options considered

- **Use the XDG config home on Unix and preserve platform read fallback** (chosen): makes dotfile-backed config explicit without changing the JSON file formats or stranding existing platform-config installs.
- **Always force `~/.config` on every platform**: maximizes visible dotfile portability, but ignores OS conventions for users who have not opted into XDG config.
- **Keep per-module path helpers**: preserves the status quo, but makes future config files easy to place inconsistently.
- **Move installation-local state into the vault**: would sync more data, but would mix device preferences, credentials, and window state into user content.

## Consequences

- Users can back up Metis's app config JSON alongside other dotfile-managed tools.
- Existing installs keep working because reads still check `io.github.hdoria.metis.legacy` and the previous platform config directory when no preferred XDG/Metis file exists.
- Relative `XDG_CONFIG_HOME` values are ignored so Metis does not write config relative to an arbitrary process working directory.
- New app-owned config files should use the shared Rust helper and document whether they are safe to back up. Secrets stay outside vaults and worktrees, but users who back up their XDG directory need to treat those files as sensitive.
