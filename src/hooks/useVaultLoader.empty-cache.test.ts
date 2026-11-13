import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { VaultEntry } from '../types'
import { useVaultLoader } from './useVaultLoader'

const backendInvokeFn = vi.fn()
let mockIsTauri = true

vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => backendInvokeFn(...args),
}))

vi.mock('../mock-tauri', () => ({
  isTauri: () => mockIsTauri,
  mockInvoke: (command: string, args?: Record<string, unknown>) => backendInvokeFn(command, args),
}))

function makeEntry(path: string, title: string): VaultEntry {
  return {
    path,
    filename: path.split('/').pop() ?? 'note.md',
    title,
    isA: 'Note',
    aliases: [],
    belongsTo: [],
    relatedTo: [],
    status: 'Active',
    archived: false,
    modifiedAt: 1,
    createdAt: 1,
    fileSize: 100,
    snippet: '',
    wordCount: 0,
    relationships: {},
    icon: null,
    color: null,
    order: null,
    sidebarLabel: null,
    template: null,
    sort: null,
    view: null,
    visible: null,
    organized: false,
    favorite: false,
    favoriteIndex: null,
    listPropertiesDisplay: [],
    outgoingLinks: [],
    properties: {},
    hasH1: true,
    fileKind: 'markdown',
  }
}

function commandKey(command: string, args?: Record<string, unknown>): string {
  return `${command}:${typeof args?.path === 'string' ? args.path : ''}`
}

describe('useVaultLoader empty cache recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsTauri = true
  })

  it('keeps mounted workspace entries visible while a newly active empty workspace loads', async () => {
    const metislegacy = { label: 'MetisLegacy', path: '/metislegacy', alias: 'metislegacy', available: true, mounted: true }
    const refactoring = { label: 'Refactoring', path: '/refactoring', alias: 'refactoring', available: true, mounted: true }
    const commandResults = new Map<string, unknown>([
      ['reload_vault:/metislegacy', [makeEntry('/metislegacy/note/hello.md', 'MetisLegacy Hello')]],
      ['reload_vault:/refactoring', []],
      ['list_vault:/refactoring', []],
      ['get_modified_files:', []],
      ['list_vault_folders:', []],
      ['list_views:', []],
    ])

    backendInvokeFn.mockImplementation((command: string, args?: Record<string, unknown>) => {
      return Promise.resolve(commandResults.get(commandKey(command, args)) ?? null)
    })

    const { result, rerender } = renderHook(
      ({ activePath, vaults }) => useVaultLoader(activePath, vaults, activePath, vaults),
      { initialProps: { activePath: '/metislegacy', vaults: [metislegacy] } },
    )

    await waitFor(() => {
      expect(result.current.entries.map((entry) => entry.title)).toEqual(['MetisLegacy Hello'])
    })

    rerender({ activePath: '/refactoring', vaults: [metislegacy, refactoring] })

    expect(result.current.entries.map((entry) => entry.title)).toContain('MetisLegacy Hello')
    await waitFor(() => {
      expect(result.current.entries.map((entry) => entry.title)).toContain('MetisLegacy Hello')
    })
  })

  it('reloads a background workspace when its cached startup listing is empty in Tauri mode', async () => {
    const brian = { label: 'Brian', path: '/brian', alias: 'brian', available: true, mounted: true }
    const metislegacy = { label: 'MetisLegacy', path: '/metislegacy', alias: 'metislegacy', available: true, mounted: true }
    const commandResults = new Map<string, unknown>([
      ['reload_vault:/brian', [makeEntry('/brian/note/hello.md', 'Brian Hello')]],
      ['list_vault:/metislegacy', []],
      ['reload_vault:/metislegacy', [makeEntry('/metislegacy/note/hello.md', 'MetisLegacy Hello')]],
      ['get_modified_files:', []],
      ['list_vault_folders:', []],
      ['list_views:', []],
    ])

    backendInvokeFn.mockImplementation((command: string, args?: Record<string, unknown>) => {
      return Promise.resolve(commandResults.get(commandKey(command, args)) ?? null)
    })

    const vaults = [brian, metislegacy]
    const { result } = renderHook(() => useVaultLoader('/brian', vaults, '/brian', vaults))

    await waitFor(() => {
      expect(result.current.entries.map((entry) => entry.title).sort()).toEqual(['Brian Hello', 'MetisLegacy Hello'])
    })

    const metislegacyLoads = backendInvokeFn.mock.calls
      .filter(([command, args]) => {
        return args?.path === '/metislegacy' && (command === 'list_vault' || command === 'reload_vault')
      })
      .map(([command]) => command)
    expect(metislegacyLoads).toEqual(['list_vault', 'reload_vault'])
  })
})
