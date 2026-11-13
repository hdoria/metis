import { useState } from 'react'
import { FileTextIcon, LinkIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { DEMO_NOTES } from './content'

export default function NotesPreview() {
  const [selectedId, setSelectedId] = useState<string>('ideias')
  const [query, setQuery] = useState('')
  const note = DEMO_NOTES.find((item) => item.id === selectedId) ?? DEMO_NOTES[0]
  const normalizedQuery = query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
  const visibleNotes = DEMO_NOTES.filter((item) => {
    const text = `${item.title} ${item.category} ${item.excerpt}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
    return text.includes(normalizedQuery)
  })

  function openNote(id: string) {
    setSelectedId(id)
    setQuery('')
  }

  return (
    <div className="demo-window">
      <div className="window-toolbar">
        <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
        <span>Métis</span>
        <span className="demo-indicator">Prévia interativa</span>
      </div>
      <div className="demo-workspace">
        <aside className="demo-sidebar" aria-label="Notas da demonstração">
          <div className="library-title">
            <img src={`${import.meta.env.BASE_URL}metis-icon.png`} alt="" width="27" height="27" />
            <span>Meu segundo cérebro</span>
          </div>
          <label className="demo-search">
            <MagnifyingGlassIcon size={17} aria-hidden="true" />
            <span className="sr-only">Buscar nas notas de exemplo</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nas notas" />
          </label>
          <div className="notes-list-heading"><span>Minhas notas</span><span>{visibleNotes.length}</span></div>
          <nav className="notes-list" aria-label="Selecione uma nota">
            {visibleNotes.map((item) => (
              <button className={`note-choice ${note.id === item.id ? 'is-selected' : ''}`} key={item.id} onClick={() => openNote(item.id)} aria-current={note.id === item.id ? 'true' : undefined}>
                <FileTextIcon size={17} aria-hidden="true" />
                <span>{item.title}</span>
              </button>
            ))}
          </nav>
          {visibleNotes.length === 0 && (
            <div className="demo-empty" role="status">
              <p>Nenhuma nota com esse termo.</p>
              <button onClick={() => setQuery('')}><XIcon size={14} aria-hidden="true" />Limpar busca</button>
            </div>
          )}
          <p className="sidebar-caption">Um lugar para o que<br />você quer lembrar.</p>
        </aside>
        <div className="demo-editor">
          <div className="note-breadcrumb"><FileTextIcon size={15} aria-hidden="true" /><span>Minhas notas</span><span aria-hidden="true">/</span><span>{note.category}</span></div>
          <article className="preview-note" aria-labelledby="preview-note-title">
            <p className="note-category">{note.category}</p>
            <h3 id="preview-note-title">{note.title}</h3>
            <div className="note-body">
              {note.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <blockquote>{note.thought}</blockquote>
            </div>
            <div className="note-connections">
              <h4><LinkIcon size={17} aria-hidden="true" />Esta nota conversa com</h4>
              <div>{note.related.map((id) => {
                const related = DEMO_NOTES.find((item) => item.id === id)!
                return <button key={id} onClick={() => openNote(id)}><span aria-hidden="true">[[</span>{related.title}<span aria-hidden="true">]]</span></button>
              })}</div>
            </div>
          </article>
          <div className="editor-footer"><span>Notas de exemplo</span><span>Markdown</span></div>
          <span className="sr-only" role="status" aria-live="polite">Nota aberta: {note.title}</span>
        </div>
      </div>
    </div>
  )
}
