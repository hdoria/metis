import { useRef, useState, type KeyboardEvent } from 'react'
import { FileTextIcon, GraphIcon, TableIcon, SquaresFourIcon } from '@phosphor-icons/react'

const VIEWS = [
  { id: 'connections', label: 'Conexões', icon: GraphIcon },
  { id: 'sheets', label: 'Planilhas', icon: TableIcon },
  { id: 'organization', label: 'Organização', icon: SquaresFourIcon },
] as const

type ViewId = typeof VIEWS[number]['id']

export default function FeatureWorkbench() {
  const [selected, setSelected] = useState<ViewId>('connections')
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % VIEWS.length
    else if (event.key === 'ArrowLeft') next = (index + VIEWS.length - 1) % VIEWS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = VIEWS.length - 1
    else return
    event.preventDefault()
    setSelected(VIEWS[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <div className="workbench">
      <div className="workbench-tabs" role="tablist" aria-label="Recursos do Métis">
        {VIEWS.map(({ id, label, icon: Icon }, index) => (
          <button key={id} id={`tab-${id}`} role="tab" type="button" aria-selected={selected === id} aria-controls={`panel-${id}`} tabIndex={selected === id ? 0 : -1} ref={(element) => { tabs.current[index] = element }} onClick={() => setSelected(id)} onKeyDown={(event) => moveTab(event, index)}>
            <Icon size={19} aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
      </div>
      <div id="panel-connections" role="tabpanel" aria-labelledby="tab-connections" hidden={selected !== 'connections'} tabIndex={0}>
        <div className="workbench-heading"><span>Vizinhança da nota</span><span>Exemplo</span></div>
        <div className="graph-example" role="img" aria-label="Exemplo de conexões: a nota Ensaio sobre memória está ligada a Diário de leitura, Perguntas, Atenção e Aprendizado.">
          <svg viewBox="0 0 600 270" preserveAspectRatio="none" aria-hidden="true"><path d="M300 135 L120 52 M300 135 L475 62 M300 135 L110 215 M300 135 L475 220" /></svg>
          <span className="graph-node graph-node-main"><FileTextIcon size={19} aria-hidden="true" />Ensaio sobre memória</span>
          <span className="graph-node graph-node-one">Diário de leitura</span><span className="graph-node graph-node-two">Perguntas</span><span className="graph-node graph-node-three">Atenção</span><span className="graph-node graph-node-four">Aprendizado</span>
        </div>
        <div className="workbench-explanation"><h3>O contexto aparece nos links.</h3><p>Wikilinks, backlinks e o grafo da vizinhança mostram como uma nota se liga ao que você já guardou.</p></div>
      </div>
      <div id="panel-sheets" role="tabpanel" aria-labelledby="tab-sheets" hidden={selected !== 'sheets'} tabIndex={0}>
        <div className="workbench-heading"><span>Leituras do mês</span><span>Exemplo</span></div>
        <div className="sheet-example">
          <div className="formula-bar"><span>B5</span><span aria-hidden="true">ƒx</span><code>=SUM(B2:B4)</code></div>
          <table aria-label="Exemplo de planilha de leituras"><thead><tr><th scope="col" aria-label="Linha" /><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody><tr><th scope="row">1</th><td>Leitura</td><td>Páginas</td></tr><tr><th scope="row">2</th><td>Memória e atenção</td><td>24</td></tr><tr><th scope="row">3</th><td>Caderno de pesquisa</td><td>18</td></tr><tr><th scope="row">4</th><td>Ensaio sobre aprender</td><td>32</td></tr><tr><th scope="row">5</th><td>Total</td><td className="sheet-result">74</td></tr></tbody></table>
        </div>
        <div className="workbench-explanation"><h3>Números junto das ideias.</h3><p>Crie planilhas com fórmulas, referências entre planilhas e dados das suas notas.</p></div>
      </div>
      <div id="panel-organization" role="tabpanel" aria-labelledby="tab-organization" hidden={selected !== 'organization'} tabIndex={0}>
        <div className="workbench-heading"><span>Minha pesquisa</span><span>Exemplo</span></div>
        <div className="organization-example">
          <div className="view-filter"><span>Tipo: Leitura</span><span>Status: Em andamento</span></div>
          <div className="organize-row organize-labels"><span>Nota</span><span>Tipo</span></div>
          <div className="organize-row"><span><FileTextIcon size={17} aria-hidden="true" />Memória e atenção</span><span>Leitura</span></div>
          <div className="organize-row"><span><FileTextIcon size={17} aria-hidden="true" />Como eu aprendo</span><span>Leitura</span></div>
          <div className="organize-row"><span><FileTextIcon size={17} aria-hidden="true" />Anotações do capítulo 4</span><span>Leitura</span></div>
          <p className="template-example">Template de leitura <span>Título · Autor · Status</span></p>
        </div>
        <div className="workbench-explanation"><h3>Organize do seu jeito.</h3><p>Defina tipos, propriedades e templates. Salve filtros pra voltar às leituras, pessoas ou projetos que importam agora.</p></div>
      </div>
    </div>
  )
}
