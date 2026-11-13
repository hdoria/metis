import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { APP_COMMAND_IDS, getAppCommandShortcutDisplay } from '../hooks/appCommandCatalog'
import { makeEntry, mockEntries, renderNoteList } from '../test-utils/noteListTestUtils'

function setViewportSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true })
}

function renderNoteListWithFullActionMenu() {
  renderNoteList({
    canCopyGitUrl: vi.fn(() => true),
    onBulkArchive: vi.fn(),
    onBulkDeletePermanently: vi.fn(),
    onCopyFilePath: vi.fn(),
    onCopyGitUrl: vi.fn(),
    onEnterNeighborhood: vi.fn(),
    onExportPdf: vi.fn(),
    onOpenInNewWindow: vi.fn(),
    onRenameFilename: vi.fn(),
    onRevealFile: vi.fn(),
    onToggleFavorite: vi.fn(),
    onToggleOrganized: vi.fn(),
  })
}

function openBuildMetisLegacyActions() {
  fireEvent.contextMenu(screen.getByText('Build MetisLegacy App'))
}

function clickBuildMetisLegacyAction(label: string) {
  openBuildMetisLegacyActions()
  fireEvent.click(screen.getByText(label))
}

describe('NoteList context menu', () => {
  it('opens note actions from a right-clicked note item', () => {
    const onOpenInNewWindow = vi.fn()
    const onEnterNeighborhood = vi.fn()
    const onBulkArchive = vi.fn()
    const onBulkDeletePermanently = vi.fn()
    const onExportPdf = vi.fn()
    const onToggleFavorite = vi.fn()
    const onToggleOrganized = vi.fn()
    const onRenameFilename = vi.fn()
    const onRevealFile = vi.fn()
    const onCopyFilePath = vi.fn()
    const canCopyGitUrl = vi.fn(() => true)
    const onCopyGitUrl = vi.fn()

    renderNoteList({
      onOpenInNewWindow,
      onEnterNeighborhood,
      onBulkArchive,
      onBulkDeletePermanently,
      onExportPdf,
      onToggleFavorite,
      onToggleOrganized,
      onRenameFilename,
      onRevealFile,
      onCopyFilePath,
      canCopyGitUrl,
      onCopyGitUrl,
    })

    openBuildMetisLegacyActions()

    expect(screen.getByTestId('note-list-context-menu')).toBeInTheDocument()
    expect(screen.getByTestId('note-list-context-menu')).toHaveClass('z-[12000]')
    expect(screen.getByTestId('note-list-context-menu').parentElement).toBe(document.body)
    expect(screen.getByText(getAppCommandShortcutDisplay(APP_COMMAND_IDS.noteOpenInNewWindow)!)).toBeInTheDocument()
    expect(screen.getByText(getAppCommandShortcutDisplay(APP_COMMAND_IDS.noteToggleFavorite)!)).toBeInTheDocument()
    expect(screen.getByText(getAppCommandShortcutDisplay(APP_COMMAND_IDS.noteToggleOrganized)!)).toBeInTheDocument()
    expect(screen.getByText(getAppCommandShortcutDisplay(APP_COMMAND_IDS.noteDelete)!)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Open in New Window'))
    expect(onOpenInNewWindow).toHaveBeenCalledWith(mockEntries[0])

    clickBuildMetisLegacyAction('Add to Favorites')
    expect(onToggleFavorite).toHaveBeenCalledWith(mockEntries[0].path)

    clickBuildMetisLegacyAction('Mark as Organized')
    expect(onToggleOrganized).toHaveBeenCalledWith(mockEntries[0].path)

    clickBuildMetisLegacyAction('Rename filename')
    expect(screen.getByTestId('note-list-rename-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('note-list-rename-input')).toHaveValue('26q1-metislegacy-app')
    fireEvent.change(screen.getByTestId('note-list-rename-input'), { target: { value: 'renamed-from-menu.md ' } })
    fireEvent.click(screen.getByText('Rename'))
    expect(onRenameFilename).toHaveBeenCalledWith(mockEntries[0].path, 'renamed-from-menu')

    clickBuildMetisLegacyAction("Open note's neighborhood")
    expect(onEnterNeighborhood).toHaveBeenCalledWith(mockEntries[0])

    clickBuildMetisLegacyAction('Reveal in Finder')
    expect(onRevealFile).toHaveBeenCalledWith(mockEntries[0].path)

    clickBuildMetisLegacyAction('Copy file path')
    expect(onCopyFilePath).toHaveBeenCalledWith(mockEntries[0].path)

    clickBuildMetisLegacyAction('Copy git URL')
    expect(canCopyGitUrl).toHaveBeenCalledWith(mockEntries[0])
    expect(onCopyGitUrl).toHaveBeenCalledWith(mockEntries[0])

    clickBuildMetisLegacyAction('Export note as PDF')
    expect(onExportPdf).toHaveBeenCalledWith(mockEntries[0])

    clickBuildMetisLegacyAction('Archive this note')
    expect(onBulkArchive).toHaveBeenCalledWith([mockEntries[0].path])

    clickBuildMetisLegacyAction('Delete this note')
    expect(onBulkDeletePermanently).toHaveBeenCalledWith([mockEntries[0].path])
  }, 20_000)

  it('shows stateful favorite and organized labels for pinned notes', () => {
    renderNoteList({
      entries: [
        makeEntry({
          favorite: true,
          organized: true,
          path: '/vault/stateful.md',
          title: 'Stateful Note',
        }),
      ],
      onToggleFavorite: vi.fn(),
      onToggleOrganized: vi.fn(),
    })

    fireEvent.contextMenu(screen.getByText('Stateful Note'))

    expect(screen.getByText('Remove from Favorites')).toBeInTheDocument()
    expect(screen.getByText('Mark as Unorganized')).toBeInTheDocument()
  })

  it('hides the organized action for PDF file rows while keeping file actions', () => {
    const pdfEntry = makeEntry({
      fileKind: 'binary',
      filename: 'research.pdf',
      path: '/vault/research.pdf',
      title: 'research.pdf',
    })
    const onCopyFilePath = vi.fn()
    const onRevealFile = vi.fn()
    const onRenameFilename = vi.fn()
    const onToggleOrganized = vi.fn()

    renderNoteList({
      allNotesFileVisibility: { pdfs: true, images: false, unsupported: false },
      entries: [pdfEntry],
      onCopyFilePath,
      onRenameFilename,
      onRevealFile,
      onToggleOrganized,
    })

    fireEvent.contextMenu(screen.getByTestId('pdf-file-item'))

    expect(screen.getByTestId('note-list-context-menu')).toBeInTheDocument()
    expect(screen.queryByText('Mark as Organized')).not.toBeInTheDocument()
    expect(screen.queryByText('Rename filename')).not.toBeInTheDocument()
    expect(screen.getByText('Reveal in Finder')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Copy file path'))
    expect(onCopyFilePath).toHaveBeenCalledWith(pdfEntry.path)
    expect(onToggleOrganized).not.toHaveBeenCalled()
  })

  it('hides the git URL action for notes without a remote', () => {
    renderNoteList({
      canCopyGitUrl: () => false,
      onCopyGitUrl: vi.fn(),
      onCopyFilePath: vi.fn(),
    })

    fireEvent.contextMenu(screen.getByText('Build MetisLegacy App'))

    expect(screen.queryByText('Copy git URL')).not.toBeInTheDocument()
  })

  it('keeps note actions visible when opened near the bottom-right viewport edge', () => {
    setViewportSize(1024, 768)
    renderNoteList({
      onOpenInNewWindow: vi.fn(),
      onBulkDeletePermanently: vi.fn(),
    })

    fireEvent.contextMenu(screen.getByText('Build MetisLegacy App'), { clientX: 1000, clientY: 740 })

    const menu = screen.getByTestId('note-list-context-menu')
    expect(menu.style.left).toBe('')
    expect(menu.style.top).toBe('')
    expect(menu).toHaveStyle({
      bottom: '28px',
      maxHeight: '732px',
      right: '24px',
    })
  })

  it('caps note actions to the available viewport space from a mid-height right-click', () => {
    setViewportSize(420, 320)
    renderNoteListWithFullActionMenu()

    fireEvent.contextMenu(screen.getByText('Build MetisLegacy App'), { clientX: 271, clientY: 157 })

    const menu = screen.getByTestId('note-list-context-menu')
    expect(menu).toHaveStyle({
      maxHeight: '155px',
      overflowY: 'auto',
      right: '149px',
      top: '157px',
    })
  })
})
