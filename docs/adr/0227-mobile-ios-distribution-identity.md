# 0227: Explicit iOS distribution identity

Platform: mobile
Status: Accepted
Date: 2026-10-16

## Context

The installed development app uses `com.metis.mobile.dev`. Changing its identity
in place would make local builds and release builds ambiguous. The owner selected
`md.metis.mobile` under Refactoring ETS (`D84V3C272P`) for distribution.

## Decision

Keep the development manifest unchanged. The existing Expo dynamic configuration
selects the distribution identity only with `METIS_BUILD_PROFILE=testflight`.
An absent profile means development; unknown values fail instead of silently
producing the wrong application. The TestFlight profile changes only iOS settings.

Require an explicit `METIS_IOS_BUILD_NUMBER` from 1 through 9999 for TestFlight.
The release operator must choose a number newer than the last uploaded build for
that version. Configuration validation checks syntax, not App Store history.
Require `EXPO_PUBLIC_DISTRIBUTION=testflight` and
`EXPO_PUBLIC_RELEASE_CHANNEL=alpha` so the existing runtime telemetry is attributed
to the correct distribution. Keep upload credentials out of the public manifest.

Expo prebuild must run with the same environment used for bundling and archiving;
changing environment variables alone does not rewrite an existing native project.
The generated iOS project is not the source of truth. Use a separate prepared
checkout or preserve and regenerate the development project when switching.

## Consequences

Development and distribution installations have separate sandboxes. No automatic
vault or Keychain migration is implied, and no existing installation is removed.
This adds no new release service or dependency. Publishing is not configured in
the independent repository. Valid configuration does not prove signing, symbol
upload, privacy compliance, native QA, or permission to release; record those
checks separately in the Métis issue tracker before distribution.
