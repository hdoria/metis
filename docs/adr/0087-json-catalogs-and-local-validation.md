---
type: ADR
id: "0087"
title: "JSON locale catalogs with local validation"
status: active
date: 2026-04-27
updated: 2026-11-13
supersedes:
  - "0084"
---

## Context

The app needs locale catalogs that can be edited and reviewed alongside UI changes. Flat JSON keeps translated text separate from runtime TypeScript while preserving the existing English fallback behavior. The independent repository maintains these files locally without a translation service.

## Decision

Keep the app-owned localization runtime in `src/lib/i18n.ts` and flat JSON catalogs in `src/lib/locales/`.

- `src/lib/locales/en.json` is the canonical source catalog.
- Additional catalogs use one JSON file per locale code, such as `zh-CN.json` and `fr-FR.json`.
- The runtime owns fallback, interpolation, locale resolution and props-down locale wiring.
- Edit the source and translated catalogs together, preserving interpolation placeholders.
- Run `pnpm l10n:validate` to verify that every catalog matches the English keyset and contains flat string values.
- Legacy preferences such as `zh-Hans` normalize to the canonical `zh-CN` locale.

## Alternatives considered

- **TypeScript dictionaries:** couple translation edits to source code and make catalog review harder.
- **A frontend i18n framework:** adds runtime machinery when locale propagation and fallback already work.
- **Catalogs outside the repository:** separate translations from the UI code that consumes their keys.

## Consequences

Translations stay versioned with the app. Locale additions require locale metadata, a JSON catalog and local validation. Reviewers must also check wording and placeholders; keyset validation alone cannot establish translation quality. Missing translations retain the runtime's English fallback.
