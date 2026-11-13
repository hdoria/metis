import { describe, expect, it, vi } from 'vitest'
import {
  nativeWorkspaceSelectionFromDirectory,
  pickNativeWorkspaceDirectoryWithDependencies,
  pickNativeWorkspaceDirectoryWithPicker,
  restoreNativeWorkspaceDirectory,
} from './nativeWorkspacePicker'
import type { NativeWorkspaceAccessModule } from './nativeWorkspaceAccess'

describe('native workspace picker', () => {
  const managedMetisLegacyRecord = {
    index: {
      directories: ['Writing'],
      files: [{
        absolutePath: 'file:///managed/Metis%20Vault/Writing/Launch%20note.md',
        content: '# Launch note\n',
        createdAt: null,
        modifiedAt: 2,
        relativePath: 'Writing/Launch note.md',
        size: 14,
      }],
    },
    label: 'MetisLegacy',
    uri: 'file:///managed/Metis%20Vault/',
  }
  const managedMetisLegacySelection = {
    index: managedMetisLegacyRecord.index,
    vaultAlias: 'metislegacy',
    vaultLabel: 'MetisLegacy',
    vaultRootUri: managedMetisLegacyRecord.uri,
  }

  function accessModule(
    overrides: Partial<NativeWorkspaceAccessModule> = {},
  ): NativeWorkspaceAccessModule {
    return {
      importWorkspace: vi.fn(),
      restoreWorkspace: vi.fn(),
      ...overrides,
    }
  }

  it('builds native repository requests from picked directories', () => {
    expect(nativeWorkspaceSelectionFromDirectory({
      name: 'MetisLegacy',
      uri: 'file:///Users/hugo/MetisLegacy/',
    })).toEqual({
      vaultAlias: 'metislegacy',
      vaultLabel: 'MetisLegacy',
      vaultRootUri: 'file:///Users/hugo/MetisLegacy/',
    })
  })

  it('derives a decoded vault label when the picker omits a directory name', () => {
    expect(nativeWorkspaceSelectionFromDirectory({
      uri: 'file:///Users/hugo/Work%20Vault/',
    })).toEqual({
      vaultAlias: 'work-vault',
      vaultLabel: 'Work Vault',
      vaultRootUri: 'file:///Users/hugo/Work%20Vault/',
    })
  })

  it('treats picker cancellation as no selected vault', async () => {
    await expect(pickNativeWorkspaceDirectoryWithPicker(async () => {
      throw new Error('cancelled')
    })).resolves.toBeNull()
  })

  it('keeps picked directories session-scoped when the import module is unavailable', async () => {
    await expect(pickNativeWorkspaceDirectoryWithPicker(async () => ({
      name: 'MetisLegacy',
      uri: 'file:///Users/hugo/MetisLegacy/',
    }))).resolves.toEqual({
      vaultAlias: 'metislegacy',
      vaultLabel: 'MetisLegacy',
      vaultRootUri: 'file:///Users/hugo/MetisLegacy/',
    })
  })

  it('uses the standalone native picker without invoking Expo file-system APIs', async () => {
    const pickDirectory = vi.fn()
    const module = accessModule({
      pickAndImportWorkspace: vi.fn().mockResolvedValue(managedMetisLegacyRecord),
    })

    await expect(pickNativeWorkspaceDirectoryWithDependencies(pickDirectory, module))
      .resolves.toEqual(managedMetisLegacySelection)
    expect(pickDirectory).not.toHaveBeenCalled()
  })

  it('falls back to the Expo picker when the native picker is unavailable', async () => {
    const pickDirectory = vi.fn().mockResolvedValue({ name: 'MetisLegacy', uri: 'file:///MetisLegacy/' })
    const module = accessModule({
      importWorkspace: vi.fn().mockResolvedValue(managedMetisLegacyRecord),
    })

    await expect(pickNativeWorkspaceDirectoryWithDependencies(pickDirectory, module))
      .resolves.toEqual(managedMetisLegacySelection)
    expect(pickDirectory).toHaveBeenCalledOnce()
  })

  it('does not open the original folder when a managed import fails', async () => {
    const pickDirectory = vi.fn().mockResolvedValue({ name: 'MetisLegacy', uri: 'file:///original/' })
    const module = accessModule({ importWorkspace: vi.fn().mockResolvedValue(null) })
    await expect(pickNativeWorkspaceDirectoryWithDependencies(pickDirectory, module))
      .rejects.toThrow('workspaceImportFailed')
  })

  it('uses session access only when no native importer exists', async () => {
    const pickDirectory = vi.fn().mockResolvedValue({ name: 'MetisLegacy', uri: 'file:///original/' })
    await expect(pickNativeWorkspaceDirectoryWithDependencies(pickDirectory, null))
      .resolves.toMatchObject({ vaultRootUri: 'file:///original/' })
  })

  it('restores a managed native workspace without reopening the picker', async () => {
    const module = accessModule({
      pickAndImportWorkspace: vi.fn().mockResolvedValue(null),
      restoreWorkspace: vi.fn().mockResolvedValue({
        index: managedMetisLegacyRecord.index,
        label: 'Work Vault',
        uri: 'file:///managed/Metis%20Vault/',
      }),
    })

    await expect(restoreNativeWorkspaceDirectory(module)).resolves.toEqual({
      index: managedMetisLegacyRecord.index,
      vaultAlias: 'work-vault',
      vaultLabel: 'Work Vault',
      vaultRootUri: 'file:///managed/Metis%20Vault/',
    })
  })
})
