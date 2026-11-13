import { afterEach, describe, expect, it, vi } from 'vitest'

const remoteGlobals = globalThis as { METIS_REMOTE_URL?: string; METIS_REMOTE_TOKEN?: string }

async function loadMockEntries() {
  vi.resetModules()
  return (await import('./mock-entries')).MOCK_ENTRIES
}

describe('mock entries', () => {
  afterEach(() => {
    delete remoteGlobals.METIS_REMOTE_URL
    delete remoteGlobals.METIS_REMOTE_TOKEN
  })

  it('include a large generated vault for demo data', async () => {
    expect((await loadMockEntries()).length).toBeGreaterThan(9000)
  })

  it('skip the generated vault on a Metis remote, which never lists demo data (TOL-206)', async () => {
    remoteGlobals.METIS_REMOTE_URL = 'https://metis.example'
    remoteGlobals.METIS_REMOTE_TOKEN = 'token-not-a-secret'

    expect((await loadMockEntries()).length).toBeLessThan(100)
  })
})
