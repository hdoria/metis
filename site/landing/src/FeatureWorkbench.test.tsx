import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FeatureWorkbench from './FeatureWorkbench'

let container: HTMLDivElement
let root: Root

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root.render(<FeatureWorkbench />))
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

function tab(id: string) {
  return container.querySelector<HTMLButtonElement>(`#tab-${id}`)!
}

function visiblePanel() {
  return container.querySelector<HTMLDivElement>('[role="tabpanel"]:not([hidden])')!
}

async function press(key: string) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  await act(async () => document.activeElement?.dispatchEvent(event))
  expect(event.defaultPrevented).toBe(true)
}

describe('landing feature workbench', () => {
  it('switches examples by clicking a tab and exposes only the selected panel', async () => {
    expect(visiblePanel().id).toBe('panel-connections')
    await act(async () => tab('sheets').click())
    expect(visiblePanel().id).toBe('panel-sheets')
    expect(visiblePanel().textContent).toContain('=SUM(B2:B4)')
    expect(tab('sheets').getAttribute('aria-selected')).toBe('true')
    expect(tab('connections').getAttribute('aria-selected')).toBe('false')
    await act(async () => tab('organization').click())
    expect(visiblePanel().id).toBe('panel-organization')
    expect(visiblePanel().textContent).toContain('Template de leitura')
    expect(container.querySelectorAll('[role="tabpanel"]:not([hidden])')).toHaveLength(1)
  })

  it('supports arrow wrapping, Home and End while keeping focus and selection together', async () => {
    tab('connections').focus()
    await press('ArrowLeft')
    expect(document.activeElement).toBe(tab('organization'))
    expect(visiblePanel().id).toBe('panel-organization')
    await press('ArrowRight')
    expect(document.activeElement).toBe(tab('connections'))
    await press('End')
    expect(document.activeElement).toBe(tab('organization'))
    await press('Home')
    expect(document.activeElement).toBe(tab('connections'))
    await press('ArrowRight')
    expect(document.activeElement).toBe(tab('sheets'))
    expect(visiblePanel().getAttribute('aria-labelledby')).toBe('tab-sheets')
    expect(container.querySelectorAll('[role="tab"][tabindex="0"]')).toHaveLength(1)
    expect(tab('sheets').tabIndex).toBe(0)
  })
})
