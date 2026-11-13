import { ArrowDownIcon, ArrowRightIcon, ArrowUpRightIcon, BracketsCurlyIcon, CheckIcon, CodeIcon, FilePdfIcon, FileTextIcon, FolderOpenIcon, GithubLogoIcon, GitBranchIcon, HardDrivesIcon, TrayIcon, LinkIcon, PencilSimpleIcon, PlusIcon, TerminalWindowIcon } from '@phosphor-icons/react'
import { FAQS, LINKS } from './content'
import FeatureWorkbench from './FeatureWorkbench'

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

function ProductScreenshot({ image, title, alt, featured = false }: { image: string; title: string; alt: string; featured?: boolean }) {
  return (
    <figure className="product-screenshot">
      <a className="screenshot-link" href={asset(`images/${image}.webp`)} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar ${title.toLocaleLowerCase('pt-BR')} em uma nova aba`}>
        <img src={asset(`images/${image}.webp`)} srcSet={`${asset(`images/${image}-960.webp`)} 960w, ${asset(`images/${image}.webp`)} 2920w`} sizes={featured ? '(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 72px), (max-width: 1392px) calc(100vw - 112px), 1280px' : '(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) calc((100vw - 100px) / 2), (max-width: 1392px) calc((100vw - 140px) / 2), 626px'} width="2920" height="1718" alt={alt} loading="lazy" decoding="async" />
        <span className="screenshot-link-bar"><strong>{title}</strong><span>Ampliar<ArrowUpRightIcon size={17} aria-hidden="true" /></span></span>
      </a>
      <figcaption>Tela real do Métis com conteúdo de demonstração.</figcaption>
    </figure>
  )
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Pular para o conteúdo</a>
      <header className="site-header page-width">
        <a className="wordmark" href="#main" aria-label="Métis, início"><img src={asset('metis-icon.png')} alt="" width="38" height="38" />Métis</a>
        <nav className="main-nav" aria-label="Navegação principal"><a href="#recursos">Recursos</a><a href="#sobre">Por que Métis</a><a href="#codigo-aberto">Open source</a></nav>
        <a className="nav-github" href={LINKS.github}><GithubLogoIcon size={19} aria-hidden="true" /><span>Ver no GitHub</span><ArrowUpRightIcon size={15} aria-hidden="true" /></a>
      </header>
      <main id="main">
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-intro"><span className="status-dot" aria-hidden="true" />Gratuito e open source</p>
            <h1 id="hero-title">Um segundo cérebro,<br /><span>feito de suas ideias.</span></h1>
            <p className="hero-description">Suas notas, leituras e projetos têm muito a dizer uns aos outros. Métis é o app pra escrever, conectar e pensar com tudo isso.</p>
            <div className="hero-actions"><a className="button button-primary" href="#demonstracao">Conheça o app<ArrowDownIcon size={18} aria-hidden="true" /></a><a className="text-link" href={LINKS.github}>Veja o código<GithubLogoIcon size={19} aria-hidden="true" /></a></div>
            <p className="hero-footnote">Arquivos locais. IA à sua escolha.</p>
          </div>
          <div className="hero-art">
            <img src={asset('images/metis-atelier.webp')} srcSet={`${asset('images/metis-atelier-640.webp')} 640w, ${asset('images/metis-atelier-960.webp')} 960w, ${asset('images/metis-atelier.webp')} 1536w`} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1200px) 52vw, 680px" width="1536" height="1024" alt="Um laptop e um busto de mármore em um espaço de estudo inspirado na Grécia, entre oliveiras e o mar" fetchPriority="high" />
            <div className="hero-art-mark" aria-hidden="true"><img src={asset('metis-icon.png')} width="48" height="48" alt="" /></div>
          </div>
          <div className="hero-foundations"><span><FileTextIcon size={19} aria-hidden="true" />Notas em Markdown</span><span><LinkIcon size={19} aria-hidden="true" />Ideias conectadas</span><span><GitBranchIcon size={19} aria-hidden="true" />Histórico com Git</span><span><BracketsCurlyIcon size={19} aria-hidden="true" />Seu acervo, seu código</span></div>
        </section>
        <section className="demo-section section-space page-width" id="demonstracao" aria-labelledby="demo-title">
          <div className="section-heading"><div><p className="eyebrow">O Métis por dentro</p><h2 id="demo-title">A próxima ideia<br />começa numa nota.</h2></div><p>Escreva no editor visual ou direto em Markdown. Conecte notas e trabalhe com seus dados em planilhas. Estas são telas reais do Métis com conteúdo de demonstração. Clique pra ampliar.</p></div>
          <ProductScreenshot image="metis-editor" title="Editor de notas" alt="Interface real do Métis com a lista de notas à esquerda e uma nota aberta com checklist e links" featured />
          <div className="screenshot-grid">
            <ProductScreenshot image="metis-connections" title="Conexões entre notas" alt="Interface real do Métis com a vizinhança da nota em lista e o painel de propriedades e backlinks aberto" />
            <ProductScreenshot image="metis-spreadsheet" title="Planilhas no acervo" alt="Interface real do Métis com uma planilha de leituras do mês e células de totais" />
          </div>
          <div className="demo-tools"><span><CheckIcon size={16} aria-hidden="true" />Editor visual e Markdown</span><span><CheckIcon size={16} aria-hidden="true" />Links nos dois sentidos</span><span><CheckIcon size={16} aria-hidden="true" />Busca em notas e trechos</span></div>
        </section>
        <section className="resources-section section-space" id="recursos" aria-labelledby="resources-title">
          <div className="page-width">
            <div className="resource-split">
              <div className="resource-copy"><p className="eyebrow">Um acervo com contexto</p><h2 id="resources-title">Cada ideia encontra<br />o seu lugar.</h2><p>Uma leitura vira referência de um projeto. Uma planilha reúne os números. Os links mantêm o caminho entre eles.</p><p>Organize o acervo com as relações e os formatos que fazem sentido pra você.</p><a className="text-link" href={LINKS.docs}>Leia a documentação<ArrowUpRightIcon size={17} aria-hidden="true" /></a></div>
              <FeatureWorkbench />
            </div>
            <div className="capability-grid">
              <article><TrayIcon size={25} aria-hidden="true" /><h3>Capture no Inbox</h3><p>Guarde a ideia agora. Volte pra organizar quando tiver tempo.</p></article>
              <article><FilePdfIcon size={25} aria-hidden="true" /><h3>Reúna suas referências</h3><p>PDFs, imagens e anexos ficam junto das notas, em arquivos locais.</p></article>
              <article><CodeIcon size={25} aria-hidden="true" /><h3>Escreva em outros formatos</h3><p>Inclua código, diagramas Mermaid e fórmulas em LaTeX.</p></article>
              <article><PencilSimpleIcon size={25} aria-hidden="true" /><h3>Pense desenhando</h3><p>Use o quadro branco pra rascunhar relações e organizar o pensamento.</p></article>
            </div>
          </div>
        </section>
        <section className="ai-section section-space" aria-labelledby="ai-title">
          <div className="page-width ai-layout">
            <div className="ai-copy"><p className="eyebrow">IA com o seu contexto</p><h2 id="ai-title">Converse com<br />o que você sabe.</h2><p>Leve suas notas pra conversa com um modelo local ou um provedor de IA que você escolher. Use seu acervo como contexto pra revisar ideias e fazer novas perguntas.</p><a className="text-link" href={LINKS.ai}>Veja como configurar a IA<ArrowUpRightIcon size={18} aria-hidden="true" /></a></div>
            <div className="context-diagram" aria-label="Fluxo: notas selecionadas fornecem contexto ao modelo de IA escolhido por você">
              <div className="context-label"><span>Seu contexto</span><span>Exemplo</span></div>
              <div className="context-files"><span><FileTextIcon size={18} aria-hidden="true" />Diário de leitura</span><span><FileTextIcon size={18} aria-hidden="true" />Ensaio sobre memória</span></div>
              <div className="context-path" aria-hidden="true"><span /><ArrowDownIcon size={20} /></div>
              <div className="context-center"><img src={asset('metis-icon.png')} width="36" height="36" alt="" /><div><strong>Métis</strong><span>Notas selecionadas na conversa</span></div></div>
              <div className="context-path" aria-hidden="true"><span /><ArrowDownIcon size={20} /></div>
              <div className="context-destinations"><div><HardDrivesIcon size={23} aria-hidden="true" /><strong>Modelo local</strong><span>Ollama ou LM Studio</span></div><div><BracketsCurlyIcon size={23} aria-hidden="true" /><strong>Provedor de IA</strong><span>Suas credenciais</span></div></div>
            </div>
            <div className="agent-note"><TerminalWindowIcon size={30} aria-hidden="true" /><div><h3>Seus agentes também podem trabalhar aqui.</h3><p>Com o servidor MCP e os agentes configurados, busque, leia, crie e atualize notas. Você escolhe as ferramentas que acessam seu acervo.</p></div><span className="agent-protocol">MCP</span></div>
            <p className="ai-cost-note">Modelos e agentes exigem configuração. Provedores externos podem cobrar pelo uso.</p>
          </div>
        </section>
        <section className="ownership-section section-space page-width" aria-labelledby="ownership-title">
          <div className="section-heading"><div><p className="eyebrow">Seus arquivos ficam com você</p><h2 id="ownership-title">Um acervo pra levar<br />pela vida.</h2></div><p>Escolha uma pasta no computador. Suas notas ficam em Markdown e abrem em outros editores. Você pode reunir vários acervos no Métis.</p></div>
          <div className="ownership-columns">
            <article className="ownership-item"><div className="file-tree" aria-label="Exemplo de uma pasta local com notas e anexos"><div><FolderOpenIcon size={23} aria-hidden="true" /><strong>Meu acervo</strong><span>Local</span></div><p><FileTextIcon size={18} aria-hidden="true" />diario-de-leitura.md</p><p><FileTextIcon size={18} aria-hidden="true" />ensaio-sobre-memoria.md</p><p><FilePdfIcon size={18} aria-hidden="true" />referencias.pdf</p></div><h3>Texto que continua seu.</h3><p>Leia e edite seus arquivos mesmo fora do Métis. Pra começar com uma pasta local, você não precisa criar uma conta.</p></article>
            <article className="ownership-item"><div className="history-example" aria-label="Exemplo de histórico com Git"><div><span className="history-dot" /><span><strong>Primeiro rascunho</strong><small>A ideia ganhou uma página</small></span><span className="history-hash" aria-hidden="true">a13e7b</span></div><div><span className="history-dot" /><span><strong>Referências da leitura</strong><small>Novas conexões no texto</small></span><span className="history-hash" aria-hidden="true">b42f9c</span></div><div><span className="history-dot" /><span><strong>Revisão do ensaio</strong><small>Uma versão pra revisitar</small></span><span className="history-hash" aria-hidden="true">c75a2d</span></div></div><h3>O caminho das suas ideias.</h3><p>Com Git, veja o que mudou e volte a versões anteriores. Configure um repositório remoto se quiser sincronizar seu acervo.</p></article>
          </div>
        </section>
        <section className="story-section" id="sobre" aria-labelledby="story-title">
          <div className="story-inner page-width">
            <div className="story-image"><img src={asset('images/metis-wisdom.webp')} srcSet={`${asset('images/metis-wisdom-640.webp')} 640w, ${asset('images/metis-wisdom.webp')} 1254w`} sizes="(max-width: 760px) calc(100vw - 40px), 50vw" width="1254" height="1254" alt="Busto feminino de mármore ao lado de um tablet, com a sombra do perfil numa parede verde pinho" loading="lazy" decoding="async" /></div>
            <div className="story-copy"><p className="eyebrow">Um nome com história</p><h2 id="story-title">Uma mente<br />dentro da outra.</h2><p>Métis era a titânide da sabedoria e do bom conselho. Na mitologia grega, Zeus a engoliu. Ela passou a aconselhá-lo de dentro da cabeça dele.</p><p>Um segundo cérebro morando dentro do primeiro. O nome e os dois perfis do nosso símbolo vêm dessa história.</p><div className="story-signature"><img src={asset('metis-icon.png')} width="52" height="52" alt="Símbolo do Métis: um perfil dentro de outro" /><span>Métis</span></div></div>
          </div>
        </section>
        <section className="open-section section-space page-width" id="codigo-aberto" aria-labelledby="open-title">
          <div className="open-copy"><p className="eyebrow">Feito pra ser compartilhado</p><h2 id="open-title">Gratuito.<br /><span>Código aberto.</span></h2><p>O Métis é um projeto open source. Você pode estudar o código, propor melhorias e construir a sua versão, seguindo a licença AGPL-3.0.</p><div className="hero-actions"><a className="button button-primary" href={LINKS.github}>Conheça o projeto<GithubLogoIcon size={20} aria-hidden="true" /></a><a className="text-link" href={LINKS.license}>Leia a licença<ArrowUpRightIcon size={17} aria-hidden="true" /></a></div></div>
          <div className="release-note"><span className="release-symbol" aria-hidden="true"><GitBranchIcon size={45} weight="light" /></span><p className="eyebrow">Em desenvolvimento</p><h3>Acompanhe o que<br />estamos construindo.</h3><p>O código já está disponível pra testar. A distribuição pública do app aguarda uma licença gratuita para o quadro branco.</p><a className="text-link" href={LINKS.start}>Como rodar no computador<ArrowRightIcon size={18} aria-hidden="true" /></a></div>
        </section>
        <section className="faq-section page-width" aria-labelledby="faq-title"><div><p className="eyebrow">Pra começar</p><h2 id="faq-title">Algumas<br />respostas.</h2><a className="text-link" href={LINKS.issues}>Converse com a gente no GitHub<ArrowUpRightIcon size={17} aria-hidden="true" /></a></div><div className="faq-list">{FAQS.map((item) => <details key={item.question}><summary>{item.question}<PlusIcon size={20} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div></section>
      </main>
      <footer className="site-footer"><div className="page-width footer-content"><a className="wordmark" href="#main"><img src={asset('metis-icon.png')} width="36" height="36" alt="" />Métis</a><p>Seu conhecimento, com você.</p><nav aria-label="Rodapé"><a href={LINKS.docs}>Documentação</a><a href={LINKS.issues}>Contribua</a><a href={LINKS.credits}>Créditos e licenças</a></nav></div></footer>
    </>
  )
}
