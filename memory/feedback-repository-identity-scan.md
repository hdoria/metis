# Audit repository identity before publication

Type: feedback

Rule: a repository reset or rebrand includes source comments, author tags, package metadata, file names, links and public notice pages, not just visible UI strings.

Why: old identity can remain in less visible files even after the application and README have been updated.

How to apply: scan the exact publication manifest for previous project names, owner names and account handles; inspect authorship markers such as `@author`, `author`, `authors`, `maintainer` and creation headers. Use the current project and maintainer identity where appropriate. Preserve unrelated book authors, test identities and third-party component licenses. Recheck generated resources before the initial commit.
