export const FOCUS_NOTE_ICON_PROPERTY_EVENT = 'metislegacy:focus-note-icon-property'

export function focusNoteIconPropertyEditor(): void {
  window.dispatchEvent(new CustomEvent(FOCUS_NOTE_ICON_PROPERTY_EVENT))
}
