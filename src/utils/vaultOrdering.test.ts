import { describe, expect, it } from 'vitest'
import type { VaultOption } from '../components/status-bar/types'
import { canMoveVaultPath, moveVaultPath, orderVaultsByPath, reorderVaultPath, vaultPathList } from './vaultOrdering'

const vaults: VaultOption[] = [
  { label: 'MetisLegacy', path: '/metislegacy' },
  { label: 'Research', path: '/research' },
  { label: 'Archive', path: '/archive' },
]

describe('vaultOrdering', () => {
  it('extracts vault paths in display order', () => {
    expect(vaultPathList(vaults)).toEqual(['/metislegacy', '/research', '/archive'])
  })

  it('orders vaults by a complete path list', () => {
    expect(orderVaultsByPath(vaults, ['/archive', '/metislegacy', '/research'])).toEqual([
      vaults[2],
      vaults[0],
      vaults[1],
    ])
  })

  it('rejects incomplete or unknown path lists', () => {
    expect(orderVaultsByPath(vaults, ['/archive', '/metislegacy'])).toBeNull()
    expect(orderVaultsByPath(vaults, ['/archive', '/metislegacy', '/missing'])).toBeNull()
  })

  it('moves vault paths one slot at a time', () => {
    expect(moveVaultPath(vaults, '/research', 'up')).toEqual(['/research', '/metislegacy', '/archive'])
    expect(moveVaultPath(vaults, '/research', 'down')).toEqual(['/metislegacy', '/archive', '/research'])
  })

  it('reorders a dragged vault path to the hovered path index', () => {
    expect(reorderVaultPath(vaults, '/metislegacy', '/archive')).toEqual(['/research', '/archive', '/metislegacy'])
    expect(reorderVaultPath(vaults, '/archive', '/metislegacy')).toEqual(['/archive', '/metislegacy', '/research'])
  })

  it('ignores no-op or unknown drag reorder paths', () => {
    expect(reorderVaultPath(vaults, '/research', '/research')).toBeNull()
    expect(reorderVaultPath(vaults, '/missing', '/archive')).toBeNull()
    expect(reorderVaultPath(vaults, '/archive', '/missing')).toBeNull()
  })

  it('reports whether a vault can move in a direction', () => {
    expect(canMoveVaultPath(vaults, '/metislegacy', 'up')).toBe(false)
    expect(canMoveVaultPath(vaults, '/metislegacy', 'down')).toBe(true)
    expect(canMoveVaultPath(vaults, '/archive', 'down')).toBe(false)
  })
})
