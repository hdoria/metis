import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NotesPreview from './NotesPreview'

let container: HTMLDivElement
let root: Root

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root.render(<NotesPreview />))
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

async function search(value: string) {
  const input = container.querySelector('input')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

async function click(selector: string, text: string) {
  const button = [...container.querySelectorAll<HTMLButtonElement>(selector)]
    .find((element) => element.textContent?.includes(text))!
  expect(button).toBeDefined()
  await act(async () => button.click())
}

describe('landing note demonstration', () => {
  it('opens a selected note and follows its related note', async () => {
    await click('.notes-list button', 'Diário de leitura')
    expect(container.querySelector('article h3')?.textContent).toBe('Diário de leitura')
    await click('.note-connections button', 'Perguntas para guardar')
    expect(container.querySelector('article h3')?.textContent).toBe('Perguntas para guardar')
    expect(container.querySelector('[aria-current="true"]')?.textContent).toBe('Perguntas para guardar')
  })

  it('finds accented categories and recovers from no results', async () => {
    await search('REFLEXAO')
    expect(container.querySelectorAll('.notes-list button')).toHaveLength(1)
    expect(container.querySelector('.notes-list button')?.textContent).toBe('Uma ideia puxa outra')
    await search('termo inexistente')
    expect(container.querySelectorAll('.notes-list button')).toHaveLength(0)
    expect(container.textContent).toContain('Nenhuma nota com esse termo.')
    await click('.demo-empty button', 'Limpar busca')
    expect(container.querySelector('input')?.value).toBe('')
    expect(container.querySelectorAll('.notes-list button')).toHaveLength(4)
  })

  it('clears a filter when following a connection to another note', async () => {
    await search('leitura')
    await click('.note-connections button', 'Um projeto de cada vez')
    expect(container.querySelector('article h3')?.textContent).toBe('Um projeto de cada vez')
    expect(container.querySelector('input')?.value).toBe('')
    expect(container.querySelectorAll('.notes-list button')).toHaveLength(4)
  })
})
