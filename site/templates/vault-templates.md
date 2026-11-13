# Vault templates

A template is a folder of Markdown files that gives a new vault a starting structure. Métis includes a local starter vault, and you can build your own template from notes you already use.

## Start with useful types

Choose types that help you find your work, such as Note, Project, Person or Topic. Define each type in a Markdown file. A type is a navigation aid; it does not force every note to use a fixed schema.

## Connect related notes

Keep relationships in YAML frontmatter using wikilinks. For example:

```yaml
type: Note
related_to:
  - "[[Project plan]]"
_organized: true
```

Use `related_to` for a general connection and `belongs_to` when a note belongs to a project or another context. Keep field names consistent within your vault.

## Keep the template small

Include a short introduction, a few representative notes and only the views you need. Remove personal information, credentials and Git remotes before sharing a template.

The [Getting Started vault](/start/getting-started-vault) is available offline from the welcome screen. You can edit it, connect it to your own remote or use it as a reference for a different structure.
