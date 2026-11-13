# Real Métis interface captures

Captured on 2026-11-13 from the actual React application in `src/`, running through the existing Vite development backend at implementation base `d8d3ef5ef`. These are not images generated with AI, UI mockups, or captures of the landing demos.

## Capture conditions

- Safari, 1460 × 949 CSS-pixel window at 2× resolution. Original PNGs: 2920 × 1898.
- Dedicated loopback server on port 5203 and a disposable vault containing 9 authored demonstration notes plus 5 type definitions. No personal notes appear in these images.
- UI language: Portuguese (Brazil), light theme. Git and AI features disabled in this demonstration.
- Server CSP: `connect-src 'self' ws://127.0.0.1:5203 ws://localhost:5203`, blocking the personal MCP/AI bridge and external connections from the capture page.
- The development backend reads these Markdown files. Screenshots demonstrate the real editor, note relationships/properties and spreadsheet renderer; they do not verify or represent native macOS integration, Git history, sync or AI execution.
- Images were captured through computer use. Only the top 180 pixels of Safari chrome were cropped. Application content, development badge, actual labels and formatting were preserved. Full-size WebP assets use lossless encoding; 960-pixel variants are resized and compressed for the landing.

## Views

- `metis-editor.webp`: editor with a note, links, quote and checklist.
- `metis-connections.webp`: note neighborhood list and properties/backlinks panel. This is a list of relationships, not a visual node graph.
- `metis-spreadsheet.webp`: sheet note with formula results, including the calculated total of 168 pages.

## Provenance

Originals and the disposable vault remain outside Git under this local capture session:

`/var/folders/r7/863rxrg55t1blpwvgb2lwfy00000gn/T/metis-captures-e7d43_75`

| Asset | Original PNG SHA-256 | Full WebP SHA-256 |
| --- | --- | --- |
| metis-editor | `7b6513cc610857a0bf557062cce379bc781eb62cbc2573b8ade68fd8e7afe92f` | `a62e8dff6f372c0ed36a1fa8608eb81e71b21210594b0717e1c19cffbb1da36d` |
| metis-connections | `3b8b21da3dd8263ba8c09ebd93acbad98b837684c674c680736aadc4bd1f5cf7` | `fe6a8406942adc79011d317734a03206a7f6babc26992b1d7335670ffb8ec8fc` |
| metis-spreadsheet | `8dee4ec3653487e585579d0063b01457b26dc46910593486750e4c69235fb35c` | `a706f3d86d692b2675574fd8a4f0eefc110c8be3a24c72a8c2bd4a3926a4f87b` |

## Hero device screen

The `metis-atelier` hero and its 960/640-pixel variants use the actual `metis-editor.webp` capture above as the laptop display input. The surrounding Greek scene remains a generated composition. This composite was edited with the built-in GPT Image tool on 2026-11-13; the separate full application screenshots above remain unmodified captures. WebP conversion and responsive resizing use `cwebp`.

Prompt used:

> Use case: compositing / precise-object-edit. Edit Image 1, the existing Métis landing hero photograph. Image 2 is an ACTUAL SCREENSHOT OF THE MÉTIS APPLICATION and is the screen-content insert, not a stylistic reference. Replace ONLY the fictional green placeholder interface inside the laptop's display with the actual application screenshot from Image 2. Fit the screenshot into the existing display bezel with the correct four-corner perspective and keep its recognizable exact three-column interface: narrow left navigation, middle notes list and wide note editor showing 'Uma ideia puxa outra', real Portuguese labels and checklist. Use the real screenshot as faithfully as possible rather than inventing/redrawing another interface. The display should appear crisp, with only a subtle realistic warm reflection, preserving the screenshot's white/cream and pine-green UI. Keep EVERYTHING outside the display unchanged: laptop position, keyboard, aluminium body, marble table, Greek marble bust, columns, olive branches, sea, distant coastline, book, shadows, warm daylight, overall composition and original 1536x1024 landscape framing. No new objects, no browser chrome, no added captions, no external logos, no crop or zoom. Only the pixels inside the laptop display should change.
