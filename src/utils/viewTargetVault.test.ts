import { describe, expect, it } from 'vitest'
import { viewCreationVaultPath } from './viewTargetVault'

describe('viewCreationVaultPath', () => {
  it('creates new views in the default workspace when multiple workspaces are mounted', () => {
    expect(viewCreationVaultPath({
      fallbackVaultPath: '/portent',
      graphDefaultWorkspacePath: '/metislegacy',
      multiWorkspaceEnabled: true,
    })).toBe('/metislegacy')
  })

  it('keeps edited views in their owning vault', () => {
    expect(viewCreationVaultPath({
      editingRootPath: '/refactoring',
      fallbackVaultPath: '/portent',
      graphDefaultWorkspacePath: '/metislegacy',
      multiWorkspaceEnabled: true,
    })).toBe('/refactoring')
  })

  it('uses the active vault when workspace mounting is disabled', () => {
    expect(viewCreationVaultPath({
      fallbackVaultPath: '/portent',
      graphDefaultWorkspacePath: '/metislegacy',
      multiWorkspaceEnabled: false,
    })).toBe('/portent')
  })
})
