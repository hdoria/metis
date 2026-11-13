export const LINKS = {
  github: 'https://github.com/hdoria/metis',
  docs: 'https://github.com/hdoria/metis/blob/main/site/docs.md',
  start: 'https://github.com/hdoria/metis#run-the-desktop-app',
  issues: 'https://github.com/hdoria/metis/issues',
  ai: 'https://github.com/hdoria/metis/blob/main/site/concepts/ai.md',
  license: 'https://github.com/hdoria/metis/blob/main/LICENSE',
  credits: `${import.meta.env.BASE_URL}creditos.html`,
}

export const MOBILE_SCREENSHOTS: string[] = []

export const DEMO_NOTES = [
  {
    id: 'ideias',
    title: 'Uma ideia puxa outra',
    category: 'Reflexão',
    excerpt: 'O que eu aprendo encontra o que já sei.',
    paragraphs: [
      'Às vezes, uma frase de um livro explica algo que eu estava tentando resolver há semanas.',
      'Quero guardar essas aproximações. Uma nota de leitura pode virar uma pergunta. A pergunta pode virar um projeto.',
    ],
    thought: 'Escrever é dar tempo a uma ideia.',
    related: ['leitura', 'projetos'],
  },
  {
    id: 'leitura',
    title: 'Diário de leitura',
    category: 'Leitura',
    excerpt: 'As páginas que continuam comigo depois do livro.',
    paragraphs: [
      'Terminei um capítulo e anotei a pergunta que ficou: quanto do que leio eu consigo explicar com minhas próprias palavras?',
      'Vou experimentar escrever uma nota curta depois de cada leitura. Se ela conversar com alguma ideia antiga, deixo um link entre as duas.',
    ],
    thought: 'Uma boa pergunta também é uma forma de lembrar.',
    related: ['ideias', 'perguntas'],
  },
  {
    id: 'projetos',
    title: 'Um projeto de cada vez',
    category: 'Projeto',
    excerpt: 'Abrir espaço para fazer o que eu comecei.',
    paragraphs: [
      'Esta semana, quero terminar o primeiro rascunho do ensaio. As notas de leitura já estão aqui, junto das perguntas que ainda preciso responder.',
      'O próximo passo é pequeno: escolher uma ideia e escrever uma página sobre ela. Depois volto para revisar.',
    ],
    thought: 'Próximo passo: uma página, hoje.',
    related: ['leitura', 'perguntas'],
  },
  {
    id: 'perguntas',
    title: 'Perguntas para guardar',
    category: 'Ideia',
    excerpt: 'Algumas respostas precisam de mais de um dia.',
    paragraphs: [
      'O que mudou na minha opinião depois da última leitura? Qual ideia merece uma segunda tentativa?',
      'Vou deixar essas perguntas aqui. Quando encontrar algo que ajude a respondê-las, volto e acrescento a conexão.',
    ],
    thought: 'Posso voltar a uma pergunta antes de ter a resposta.',
    related: ['ideias', 'projetos'],
  },
] as const

export const FAQS = [
  {
    question: 'O Métis é gratuito?',
    answer: 'Sim. O app é gratuito e tem código aberto. Serviços opcionais que você conectar, como provedores de IA ou hospedagem, podem cobrar pelo uso.',
  },
  {
    question: 'Onde ficam minhas notas?',
    answer: 'No desktop, suas notas ficam em arquivos Markdown no seu computador. Você escolhe a pasta e pode abrir esses arquivos em outros editores. O histórico e a sincronização por Git são opcionais.',
  },
  {
    question: 'Preciso criar uma conta?',
    answer: 'Você pode usar uma pasta local no desktop sem criar uma conta. Integrações e sincronização com serviços externos usam as contas que você escolher conectar.',
  },
  {
    question: 'A IA faz parte do app?',
    answer: 'Você escolhe se quer usar IA. Conecte um modelo local com Ollama ou LM Studio, ou configure um provedor hospedado com suas credenciais. Esses serviços podem cobrar. Agentes e o servidor MCP também precisam de configuração.',
  },
  {
    question: 'O que significa ser open source?',
    answer: 'O código do Métis está no GitHub sob a licença AGPL-3.0. Você pode estudar, modificar e distribuir o projeto seguindo os termos da licença. Sugestões e contribuições são bem-vindas.',
  },
  {
    question: 'Já posso instalar?',
    answer: 'O projeto está em desenvolvimento. Quem quer testar agora pode compilar o código seguindo as instruções do repositório. A distribuição pública do app aguarda uma licença gratuita para o quadro branco.',
  },
]
