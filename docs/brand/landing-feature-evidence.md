# Landing feature evidence

Read-only audit for the November 2026 landing redesign. Documentation/code evidence is distinct from runtime verification.

| Capability | Sources | Public-copy boundary |
| --- | --- | --- |
| Free, open source, local Markdown | README.md; LICENSE; site/concepts/vaults.md | AGPL-3.0-or-later. Optional external services may charge. |
| Visual editor and Markdown | site/concepts/editor.md | Same backing file; tables, code, Mermaid and LaTeX are supported. |
| Links, backlinks and relationships | site/concepts/relationships.md; src/components/inspector/BacklinksPanel.tsx | Neighborhood graph is centered on the selected note. |
| Search | src/hooks/useUnifiedSearch.ts; src-tauri/src/search.rs | Text search in Markdown titles/content. No semantic search, PDF OCR or transcription claim. |
| Inbox | site/concepts/inbox.md | Optional capture location for notes, not an email integration. |
| Types, templates, properties and saved filters | site/guides/create-types.md; site/guides/build-custom-views.md | Do not imply a complete Kanban, calendar or task-management product. |
| Spreadsheets | site/concepts/spreadsheets.md; src/components/SheetEditor.tsx | Formulas and references to other spreadsheets/notes. One spreadsheet per note; no full Excel-compatibility claim. |
| Local or hosted AI chat | site/concepts/ai.md; src/lib/aiTargets.ts | Local Ollama/LM Studio need setup. Hosted services use the user's credentials and may charge. Direct model chat does not edit files. |
| CLI agents and MCP | site/concepts/ai.md; mcp-server/tool-service.js | Explicitly configured agents can search/read/create/update notes. No default enterprise connectors or automatic access. |
| Git history, diffs and rollback | site/guides/commit-and-push.md; src/hooks/useGitHistory.ts; src/hooks/useAutoGit.ts | Optional Git repositories. Remote sync requires a configured remote, not included hosted storage. |
| PDF/image attachments | site/concepts/files-and-media.md | Previews for supported formats and local attachments. No OCR or automatic ingestion promise. |
| Whiteboard | site/concepts/files-and-media.md; src/components/TldrawWhiteboard.tsx | Implemented; public app distribution awaits a free tldraw license. |
| Multiple vaults | site/concepts/vaults.md | Combined lists/search/backlinks; Git and saved filters stay scoped to the selected vault. |

Do not copy Strattum's company permissions, enterprise system integrations, benchmarks or semantic-layer claims. No fabricated users, testimonials, productivity numbers or immediate download availability.
