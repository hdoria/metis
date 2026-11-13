import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TldrawBlockView } from './TldrawBlockView'

const renderWhiteboard = vi.hoisted(() => vi.fn<(props: unknown) => null>(() => null))
vi.mock('./TldrawWhiteboard', () => ({ TldrawWhiteboard: renderWhiteboard }))

describe('whiteboard rendering', () => {
  it('loads the normal editor with the saved drawing without a custom license gate', async () => {
    const updateBlock = vi.fn()
    const props = { boardId: 'board-1', height: '420', width: '', snapshot: '{"records":{"shape:1":{"type":"draw"}}}' }
    render(<TldrawBlockView block={{ id: 'board-block', props }} editor={{ getBlock: vi.fn(), updateBlock }} />)
    await waitFor(() => expect(renderWhiteboard).toHaveBeenCalled())
    expect(renderWhiteboard.mock.calls[0]?.[0]).toMatchObject(props)
    expect(updateBlock).not.toHaveBeenCalled()
  })
})
