# Independent repository implementation plan

> Execute in this session with a fresh-context final review. The user has explicitly authorized repository archival, replacement, removal of inherited repository integrations and one initial commit.

**Goal:** Publish the current Métis source as an independent public `hdoria/metis` repository with exactly one commit, preserving the former repository in an archive.

**Architecture:** Preserve source and Git metadata outside the project before editing. Remove repository analysis/CI integrations and their unused commands, dependencies and instructions; retain product code, tests, local build/lint tools, licensing, configured Sentry and landing hosting. Create the replacement only after local verification, then switch the existing workspace to its new Git history.

**Tech Stack:** React 19, TypeScript, Tauri 2/Rust, Expo, pnpm and GitHub CLI.

**Spec:** User request in this session: archive the current fork and create a fresh repository with the same name and current code, without inherited analysis/CI integrations.

## Constraints and review focus

- Never add ignored files, credentials, generated builds or the old Git history to the new repository.
- Retain the archived repository and a local source/Git backup; never delete the old repository.
- Preserve local application build, tests, licenses, Sentry consent/configuration boundaries and existing landing deployment.
- Remove vendor CI, hooks and scanners completely enough that install and documented commands do not reference missing files.
- Confirm remote repository IDs, archive state, `fork=false`, one root commit and a clean local tree.

## Tasks

- [ ] Save local Git and tracked-source backups and inspect repository identity.
- [ ] Remove `.codacy`, CodeScene files, `.github` automation, `.husky`, `.verity`, Lara integration and integration-only scripts/configuration/dependencies. Remove or update their documentation and obsolete mobile CI/OTA orchestration references. Keep local test suites and runtime functionality.
- [ ] Refresh the lockfile and generated agent documentation; verify frozen installation, lint, application/web/docs/landing builds and relevant mobile/configuration tests. Review the final diff independently.
- [ ] Build a fresh Git repository from an explicit tracked-file manifest and create one conventional initial commit; verify staged files for secrets and unwanted artifacts.
- [ ] Rename the current repository to `metis-archive-2026-11-13`, archive it, create public `hdoria/metis`, and push the single commit. Keep a rollback record outside Git.
- [ ] Replace local Git metadata with the new repository metadata while keeping ignored local assets; verify all acceptance criteria.

**Stop condition:** Both remote states and the new local checkout satisfy the criteria above, with validation results reported. Future integrations are separate work.
