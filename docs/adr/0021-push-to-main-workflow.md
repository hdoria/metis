---
type: ADR
id: "0021"
title: "Publish verified changes directly to main"
status: active
date: 2026-03-02
updated: 2026-11-13
---

## Context

The maintainer uses a direct-to-main workflow for this project. The independent repository has no CI workflows or Git hooks, so verification must be run and recorded explicitly.

## Decision

Publish focused, verified changes to `main` using Conventional Commits. Follow the current `AGENTS.md` for required local checks and review. Contributors can still submit pull requests as described in `CONTRIBUTING.md`.

## Consequences

Run lint, build, locale validation and tests relevant to the change before committing and pushing. Record actual results and any unavailable platform checks. Use a fresh-context reviewer when the project instructions require one. Reverse published changes with `git revert` so their history remains reviewable.
