import { describe, expect, it } from 'vitest'
import {
  buildMetisDeepLinkForEntry,
  parseMetisDeepLink,
  relativePathForVaultItem,
  resolveMetisDeepLink,
  vaultDeepLinkSlug,
  type DeepLinkVault,
} from './deepLinks'

const workVault: DeepLinkVault = {
  label: 'Work Vault',
  path: '/Users/hugo/Work Vault',
}

const personalVault: DeepLinkVault = {
  label: 'Personal Vault',
  path: '/Users/hugo/Personal Vault',
}

describe('Metis deep links', () => {
  it('builds readable links with extensions and encoded path segments', () => {
    const result = buildMetisDeepLinkForEntry({
      entry: { path: '/Users/hugo/Work Vault/sponsorships/Acme call #1.md' },
      vaultPath: workVault.path,
      vaults: [workVault],
    })

    expect(result).toEqual({
      ok: true,
      url: 'metis://work-vault/sponsorships/Acme%20call%20%231.md',
    })
  })

  it('round-trips unicode and URL-reserved path characters', () => {
    const url = 'metis://work-vault/books/Caf%C3%A9%20%26%20notes%3F%25.md'
    expect(parseMetisDeepLink({ rawUrl: url })).toEqual({
      ok: true,
      relativePath: 'books/Café & notes?%.md',
      slug: 'work-vault',
      url,
    })
  })

  it('appends stable path hashes when vault slugs collide', () => {
    const first = { label: 'Work', path: '/Users/hugo/One' }
    const second = { label: 'Work', path: '/Users/hugo/Two' }

    const firstSlug = vaultDeepLinkSlug(first, [first, second])
    const secondSlug = vaultDeepLinkSlug(second, [first, second])

    expect(firstSlug).toMatch(/^work-[a-z0-9]{6}$/)
    expect(secondSlug).toMatch(/^work-[a-z0-9]{6}$/)
    expect(firstSlug).not.toBe(secondSlug)
  })

  it('resolves generated collision-safe slugs without opening the wrong vault', () => {
    const first = { label: 'Work', path: '/Users/hugo/One' }
    const second = { label: 'Work', path: '/Users/hugo/Two' }
    const slug = vaultDeepLinkSlug(second, [first, second])

    expect(resolveMetisDeepLink({ rawUrl: `metis://${slug}/note.md`, vaults: [first, second] })).toEqual({
      ok: true,
      absolutePath: '/Users/hugo/Two/note.md',
      relativePath: 'note.md',
      vault: second,
    })
  })

  it('rejects ambiguous handwritten base slugs', () => {
    const first = { label: 'Work', path: '/Users/hugo/One' }
    const second = { label: 'Work', path: '/Users/hugo/Two' }

    expect(resolveMetisDeepLink({ rawUrl: 'metis://work/note.md', vaults: [first, second] })).toEqual({
      ok: false,
      error: 'ambiguous_vault',
    })
  })

  it('rejects unknown and unavailable vaults', () => {
    expect(resolveMetisDeepLink({ rawUrl: 'metis://missing/note.md', vaults: [workVault] })).toEqual({
      ok: false,
      error: 'unknown_vault',
    })
    expect(resolveMetisDeepLink({
      rawUrl: 'metis://work-vault/note.md',
      vaults: [{ ...workVault, available: false }],
    })).toEqual({
      ok: false,
      error: 'unavailable_vault',
    })
  })

  it('rejects path traversal and encoded separators', () => {
    expect(parseMetisDeepLink({ rawUrl: 'metis://work-vault/../secret.md' })).toEqual({
      ok: false,
      error: 'unsafe_path',
    })
    expect(parseMetisDeepLink({ rawUrl: 'metis://work-vault/folder%2Fsecret.md' })).toEqual({
      ok: false,
      error: 'unsafe_path',
    })
  })

  it('requires target files to stay inside a known vault root', () => {
    expect(relativePathForVaultItem({
      itemPath: '/Users/hugo/Work Vault/docs/adr/0129.md',
      vaultPath: workVault.path,
    })).toBe('docs/adr/0129.md')
    expect(relativePathForVaultItem({
      itemPath: '/Users/hugo/Work Vaults/docs/adr/0129.md',
      vaultPath: workVault.path,
    })).toBeNull()
    expect(buildMetisDeepLinkForEntry({
      entry: { path: '/Users/hugo/Personal Vault/note.md' },
      vaultPath: workVault.path,
      vaults: [workVault, personalVault],
    })).toEqual({
      ok: false,
      error: 'outside_vault',
    })
  })
})
