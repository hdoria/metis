import { describe, expect, it } from 'vitest'
import { mobilePalettes } from '../../ui/theme/mobilePalette'
import { noteTypeColor, noteTypeSoftColor } from './mobileWorkspaceTone'

describe('typed note display colors', () => {
  it('uses the active palette without changing a note type or its stored definition', () => {
    expect(noteTypeColor('purple', mobilePalettes.dark)).toBe('#B69CFF')
    expect(noteTypeSoftColor('purple', mobilePalettes.dark)).toBe('rgba(182, 156, 255, 0.17)')
    expect(noteTypeColor('gray', mobilePalettes.dark)).toBe('#B8B1A6')
    expect(noteTypeSoftColor('gray', mobilePalettes.dark)).toBe('#262520')
    expect(noteTypeColor('purple')).toBe('#805AD5')
  })
})
