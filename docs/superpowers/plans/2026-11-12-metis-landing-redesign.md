# Métis landing redesign

> Historical plan from the archived repository. Current validation runs locally; see [Getting Started](../../GETTING-STARTED.md#local-validation).

## Goal and acceptance

Keep the Métis pine/ivory identity while making the landing substantially more expressive, informative and useful. Show original Greek antiquity / contemporary technology imagery, demonstrate real capabilities, and make free/open-source status explicit. Deliver the verified result on the existing Vercel project and metisapp.com.br.

## Architecture and scope

React 19 / TypeScript / Vite landing in `site/landing`. Reuse local fonts, icons, links and NotesPreview. New assets under `public/images`; implementation limited to landing presentation, metadata and focused interaction tests. No desktop or native changes, new dependency, credential handling or public binary release.

## Design

- Asymmetric editorial hero: clear product description, free/open-source statement, large Greek study image, demonstration and GitHub links.
- Interactive note preview with actual selection, search and backlinks.
- Varied feature sections showing connections, structured notes, spreadsheets, attachments, diagrams and whiteboard.
- AI section explains local/hosted model choices and MCP without promising included inference or enterprise integrations.
- Local files and optional Git history; image-led origin story; open-source invitation and truthful FAQ.
- Preserve pine #17463F, ivory #F6F5ED, sage accents and existing fonts. Mobile layout follows reading order. No scroll trapping, fixed content heights or inaccessible motion.

## Claim boundaries

Evidence comes from `site/concepts`, `site/guides`, the search backend and MCP implementation. Search is textual, not semantic/OCR. Chat receives context; configured agents/MCP can edit notes. AI services may charge. Public app distribution still awaits a free whiteboard license. Conceptual images and example UI are not screenshots of a running app.

## Tasks

- [x] Read references and audit feature evidence.
- [x] Generate two original GPT Image compositions; retain exact prompts in `docs/brand/landing-imagery.md`.
- [x] Optimize responsive WebP derivatives and implement the redesigned landing.
- [x] Check behavior, typecheck, build and lint; inspect desktop/mobile layout and keyboard navigation.
- [x] Independent review of truthfulness, responsive layout, accessibility, assets and regressions.
- [x] Commit/push main and deploy via documented Vercel CLI; verify live HTML and assets.

## Review focus and stop condition

Look for false product promises, download availability mismatch, broken links, clipped or low-contrast content, misleading demos, oversized assets and regressions in note selection/search/backlinks. Stop after fixes and appropriate checks pass, production serves the new artifact, and any remaining limitation is reported explicitly.

## Verification

- Landing: TypeScript and Vite build passed; all 5 Vitest tests passed (3 existing note-preview behaviors, 2 new feature-tab interaction tests).
- Root `pnpm lint` and `pnpm build` passed. Root ESLint excludes the landing; landing checks are its own TypeScript build, interaction tests and review. Root bundle-size warnings are unchanged.
- Vercel production build passed with CSS `index-DDR_Whg8.css` and JS `index-B0aAMuPC.js`.
- Browser review: desktop layout, note search/selection/backlinks, feature tabs and keyboard focus; mobile layout at an actual 390 × 844 CSS-pixel iframe viewport, including hero, spreadsheet, AI diagram, FAQ expansion and footer. No clipping observed in these checks.
- Fresh-context reviewer approved the final working tree with no remaining findings. Contrast and content-height findings were corrected before approval. `git diff --check` passed.
- Original imagery has responsive WebP variants; largest hero is 155,310 bytes. No new dependencies or app-binary changes.

## Publication

- Implementation commit: `554897a6b4e66a1d4e14ce3921958a3addf3199a`, pushed to `main`.
- Vercel production deployment: https://metis-landing-k3nvudv46-popcode.vercel.app, in `popcode/metis-landing`.
- Opened https://metisapp.com.br in Safari and confirmed the new hero and artwork loaded over HTTPS.
- Verified exact SHA-256 equality between the local production build and all ten public artifacts: HTML, credits, license, JavaScript, CSS and five WebP images. TLS certificate validation remained enabled.
- Verified `www` redirects with HTTP 308 and preserves `/creditos.html?qa=landing`.
- Pre-push build, 21 locale catalogs and 3 mobile update-isolation tests passed. The CLI returned no GitHub workflow runs for this commit at verification time; no remote-CI success is claimed.
- Public binary distribution remains pending the free whiteboard license, as stated on the landing.
