# Real product screenshots for the landing

## Acceptance and scope

Capture the running Métis application with a disposable demonstration vault and publish readable screenshots on metisapp.com.br. Keep the Greek brand imagery. Replace the primary simulated product preview with actual product evidence; retain supporting feature explanations where useful. Do not expose personal data or modify the user's vault or app configuration.

## Approach

1. Prepare an isolated demonstration workspace and inspect the app through computer use.
2. Capture actual editor and other useful product views. Save originals, compress responsive WebP assets without changing the interface, and document provenance.
3. Update the existing landing presentation and captions. Preserve the brand and use accessible links to full-size screenshots for small screens.
4. Review in a separate context, run the required checks, inspect desktop/mobile, commit/push main, deploy to the existing Vercel project and verify production assets.

## Stop condition

Real screenshots are visible on the public landing, contain only demonstration data, and match the captures from the running app. Required checks pass and production serves the verified files.

## Progress

- [x] Isolated app and public demonstration content.
- [x] Genuine captures and responsive assets.
- [x] Landing integration and independent review.
- [x] Landing checks, production publication and artifact verification.

## Verified outcome

The existing React app ran against a disposable Markdown vault through the development backend. Git/AI controls were disabled and the capture server blocked external connections and the personal MCP bridge. The personal native app and vault were not modified. Capture provenance and hashes are in `docs/brand/landing-screenshots.md`.

Landing typecheck, Vite build and all 5 existing interaction tests passed. A fresh-context reviewer confirmed exact pixel equality between the three full WebP images and the original PNGs after the declared browser-chrome crop. The six public assets contain no visible personal data or EXIF/XMP metadata. `git diff --check` and the public-copy scan passed.

Browser checks covered the full-width editor image, two-column secondary gallery, a real 390 × 844 mobile viewport with stacked images, and a link opening the full 2920 × 1718 screenshot in a new tab. No image cropping or horizontal page overflow was observed.

Production deployment: https://metis-landing-k7s2b31n1-popcode.vercel.app in `popcode/metis-landing`, confirmed READY and aliased to https://metisapp.com.br. The public gallery was opened in Safari. HTTPS checks verified exact SHA-256 equality with the build for HTML, credits, license, JavaScript, CSS and all six screenshot assets. Production bundles are `index-Cd7CSU8Y.js` and `index-AhG-0ld-.css`.

The Git commit/push hooks perform the repository's required lint, root build, locale and mobile update-isolation checks before delivery.
