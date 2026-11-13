import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UpdateBanner } from './UpdateBanner'

const actions = { startDownload: vi.fn(), openReleaseNotes: vi.fn(), dismiss: vi.fn() }
describe('Métis update area', () => {
  it('does not advertise an unrelated mobile beta or community', () => {
    render(<UpdateBanner status={{ state: 'idle' }} actions={actions} />)
    expect(screen.queryByTestId('community-banner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('update-banner')).not.toBeInTheDocument()
  })
  it('retains update progress when a future signed channel supplies it', () => {
    render(<UpdateBanner status={{ state: 'checking' }} actions={actions} />)
    expect(screen.getByTestId('update-banner')).toBeInTheDocument()
    expect(screen.queryByTestId('community-banner')).not.toBeInTheDocument()
  })
})
