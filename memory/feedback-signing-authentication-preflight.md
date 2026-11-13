# Verify authentication prerequisites before a user handoff

## Why

A signing CLI can pass its version and help checks while its authentication bootstrap depends on an endpoint the provider has removed. Reusing another project's pinned tooling does not establish compatibility with the current service. Asking the user to enter credentials before checking that prerequisite creates avoidable retries.

## How to apply

Before an interactive authentication handoff, inspect the installed version's official release notes and validate any public bootstrap request without credentials or existing session cookies. If it fails, reproduce the provider response and find the official fix before asking the user to retry. Update only the task's isolated tooling, pin the verified version and test the failing path again. Never work around this by copying private sessions, hardcoding service keys or revoking certificates unrelated to the failure. Keep credentials in local prompts and distinguish public service configuration failures from invalid credentials.
