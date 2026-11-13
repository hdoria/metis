# Verify maintainer identity in repository file views

## Why

Repository hosting shows the author of a file's latest commit above its contents. A source-text scan cannot verify that visible identity. The maintainer requested their identity on the project's license presentation.

## How to apply

Check both current file content and the hosting provider's latest-file-commit metadata. Add a scoped notice for the current project's modifications when appropriate, preserving the license document and its own copyright verbatim. Commit actual new work under the current maintainer's authorized identity; preserve historical authorship. Verify the remote file view and license detection after pushing, and refresh generated license copies in the website and local packages.
