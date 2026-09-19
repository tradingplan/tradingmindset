import { QuantLevel, GEXRegime, AssetDirective, GoldManualPart } from '../types';

export const QUANT_GUIDELINES = {
  title: 'Guia de Diretrizes Operacionais Gerais',
  subtitle: 'MyTrading Quant — Mesa Institucional',
  motto: 'Contexto Antes de Opinião',
  philosophy: {
    intro:
      'Este guia reúne os pilares conceituais e operacionais que orientam as decisões na mesa quantitativa. O objetivo é remover o viés emocional, operando estritamente na confluência de microestrutura de opções, posicionamento institucional e correlações de mercado.',
    core:
      'Traders amadores buscam adivinhar topos e fundos com indicadores gráficos atrasados. A mesa institucional opera definindo a estrutura de risco e volatilidade antes de abrir qualquer ordem.',
    marketMakers:
      'O mercado se move pela necessidade de hedge dos Market Makers (formadores de mercado). A exposição Gamma (GEX) e as barreiras de opções indicam onde esses grandes players serão forçados a comprar ou vender o ativo subjacente para equilibrar suas carteiras (Delta Neutrality).',
  },
  levels: [
    {
      id: 'put_wall',
      name: 'Put Wall (Muralha de Puts)',
      badge: 'Suporte Máximo',
      whatIs: 'O nível de preço com a maior concentração de contratos de Put (opções de venda).',
      role: 'Funciona como o suporte mais forte da sessão sob condições normais de mercado.',
      color: '#10B981',
    },
    {
      id: 'call_wall',
      name: 'Call Wall (Muralha de Calls)',
      badge: 'Resistência Máxima',
      whatIs: 'O nível de preço com a maior concentração de contratos de Call (opções de compra).',
      role: 'Funciona como a resistência mais forte da sessão sob condições normais.',
      color: '#EF4444',
    },
    {
      id: 'gamma_flip',
      name: 'Gamma Flip (Zero Gamma)',
      badge: 'Divisor de Volatilidade',
      whatIs: 'Nível onde o Gamma líquido transita de positivo para negativo.',
      role: 'Define a mudança radical de comportamento do mercado (de contenção para aceleração).',
      color: '#06B6D4',
    },
    {
      id: 'max_pain',
      name: 'Max Pain (Máxima Dor)',
      badge: 'Atração de Preço',
      whatIs: 'O strike onde a maioria das opções em aberto expiraria sem valor financeiro.',
      role: 'Funciona como uma força gravitacional sutil de atração do preço, principalmente próximo ao vencimento.',
      color: '#8B5CF6',
    },
    {
      id: 'expected_move',
      name: 'Expected Move (Faixa Esperada)',
      badge: 'Fronteira Estatística',
      whatIs: 'O limite superior e inferior de oscilação estatística calculada via volatilidade implícita (IV).',
      role: 'Define as fronteiras reais para posicionamento seguro de stop e alvos de realização.',
      color: '#F59E0B',
    },
  ] as QuantLevel[],
  gexRegimes: [
    {
      id: 'long_gamma',
      title: 'Regime de Contenção (Long Gamma)',
      badge: 'Net GEX > 0',
      formula: 'Volatilidade Comprimida • Reversão à Média',
      mechanics:
        'Os formadores de mercado (dealers) atuam contra a tendência principal: compram nas quedas e vendem nas altas para rebalancear o Delta Hedge.',
      priceBehavior:
        'Reversão à média, consolidação e movimentos contidos. O preço tende a respeitar rigorosamente a Put Wall e a Call Wall.',
      howToBuy:
        'Próximo à Put Wall ou na extremidade inferior do Expected Move, aguardando absorção institucional para buscar o retorno à média.',
      howToSell:
        'Próximo à Call Wall ou na extremidade superior do Expected Move, operando contra o movimento inicial, buscando o retorno ao preço justo (Max Pain / Gamma Flip).',
      invalidation:
        'Se o preço romper e fechar fora dos limites estabelecidos com volume anormal, sustentado e expansão de volatilidade.',
      color: '#10B981',
    },
    {
      id: 'short_gamma',
      title: 'Regime de Aceleração (Short Gamma)',
      badge: 'Net GEX < 0',
      formula: 'Volatilidade Explosiva • Momentum Direcional',
      mechanics:
        'Os formadores de mercado atuam a favor da tendência: são forçados a vender nas quedas e comprar nas altas para se protegerem.',
      priceBehavior:
        'Tendência direcional forte, expansão violenta de volatilidade e movimentos explosivos. Suportes e resistências convencionais são rompidos facilmente.',
      howToBuy:
        'No rompimento confirmado para cima do Gamma Flip ou da Call Wall, com stop curto e alvo na expansão estatística do dia.',
      howToSell:
        'No rompimento confirmado para baixo do Gamma Flip ou da Put Wall, operando a favor do fluxo vendedor e do pânico institucional acelerado.',
      invalidation:
        'Se o preço reverter rapidamente e fechar novamente dentro da faixa anterior (falso rompimento / armadilha de liquidez).',
      color: '#EF4444',
    },
  ] as GEXRegime[],
  assetDirectives: [
    {
      id: 'gold',
      name: 'Ouro',
      symbol: 'GOLD (GC / XAUUSD)',
      flag: '🥇',
      whatToLook: [
        'DXY (Dólar Americano) e Yields de 10 Anos (US10Y): Correlação inversa clássica. Se DXY e US10Y sobem, o ouro sofre resistência.',
        'Relatório COT (Managed Money): Verifique se os grandes fundos estão aumentando ou reduzindo posições líquidas compradas.',
        'Prata (XAG) e Moedas de Commodities (AUD/USD, NZD/USD): Confluência de força no complexo de metais.',
      ],
      whenToBuy: [
        'Em Regime de Contenção, quando o preço do ouro testar a Put Wall e, simultaneamente, o DXY e os Yields US10Y mostrarem sinal de topo ou perda de força.',
        'Em Regime de Aceleração, no rompimento altista do Gamma Flip com o DXY enfraquecendo.',
      ],
      whenToSell: [
        'Em Regime de Contenção, quando testar a Call Wall sob fortalecimento do dólar/DXY.',
        'Em Regime de Aceleração, se o preço romper para baixo o Gamma Flip, com DXY e juros demonstrando forte pressão compradora.',
      ],
    },
    {
      id: 'hk50',
      name: 'Hang Seng',
      symbol: 'HK50 / HSI',
      flag: '🇭🇰',
      whatToLook: [
        'Warrants CBBC (Barreiras de Liquidação): Emissores buscam liquidar o varejo nos pontos de knock-out.',
        'Fluxo Southbound (Dinheiro Continental Chinês): Saldo diário de entrada de fluxo chinês. Saldo positivo apoia o índice.',
      ],
      whenToBuy: [
        'Quando o preço se aproxima de grande concentração de barreiras CBBC e há fluxo Southbound comprador forte na abertura asiática.',
      ],
      whenToSell: [
        'Em rompimento de canais de warrants para baixo, onde market makers aceleram vendas para liquidar o varejo comprado.',
      ],
    },
    {
      id: 'sp500',
      name: 'S&P 500 & Nasdaq',
      symbol: 'SP500 / NASDAQ-100',
      flag: '🇺🇸',
      whatToLook: [
        'VIX (para SP500) e VXN (para Nasdaq): Volatilidade implícita dita o dimensionamento algorítmico (Risk Parity).',
        'Magnificent 7 (Big Techs): Peso concentrado de Apple, Microsoft, Nvidia, Google dita o rumo do Nasdaq.',
      ],
      whenToBuy: [
        'Com VIX estável ou em queda, e o preço acima do Gamma Flip (Long Gamma). Reentradas em correções próximas ao Gamma Flip ou POC.',
      ],
      whenToSell: [
        'Com VIX em forte alta estrutural e o preço abaixo do Gamma Flip (Short Gamma / Aceleração). Evite compras contra a maré negativa.',
      ],
    },
  ] as AssetDirective[],
  checklist: [
    {
      id: 'chk_1',
      title: '1. Qual é o Regime GEX do Ativo no dia?',
      desc: 'É maior que zero (Contenção - buscar reversões nas extremidades) ou menor que zero (Aceleração - buscar rompimentos e momentum)?',
    },
    {
      id: 'chk_2',
      title: '2. Onde estão a Put Wall, Call Wall e o Gamma Flip?',
      desc: 'Estou ciente dessas zonas e sei que operar no meio da faixa é ruído estatístico?',
    },
    {
      id: 'chk_3',
      title: '3. As correlações macro estão confirmando a direção?',
      desc: 'Para o Ouro: O DXY e US10Y estão alinhados ou divergentes com a minha hipótese operacional?',
    },
    {
      id: 'chk_4',
      title: '4. Onde está o limite definido pelo Expected Move?',
      desc: 'Meu stop de invalidação está posicionado fora do Expected Move diário para evitar ser violinado pelo ruído intradiário?',
    },
    {
      id: 'chk_5',
      title: '5. A minha relação Risco/Retorno é favorável?',
      desc: 'O potencial de ganho até o próximo nível quantitativo relevante é no mínimo duas vezes maior (2:1) do que o stop?',
    },
  ],
  goldenRule:
    'Regra de Ouro da Mesa: Se o checklist não estiver totalmente alinhado ou se o preço estiver no meio do caminho entre a Put Wall e a Call Wall, a melhor operação é NÃO FAZER NADA. A preservação do capital é a primeira lei do trading quantitativo.',
};

export const GOLD_MANUAL_PARTS: GoldManualPart[] = [
  {
    id: 'parte_1',
    number: 'Parte I',
    title: 'Fundamentos do Ouro',
    subtitle: 'O que move e por que o Ouro é o ativo de refúgio mais importante do mercado global',
    dominationPoints: [
      'O mercado global de commodities e o lugar do ouro nele',
      'Os cinco grandes impulsionadores de preço (Dólar, Demanda, Juros, Geopolítica, Produção)',
      'A metodologia GRAM do World Gold Council para decompor retornos',
      'Contexto fundamentalista global e fontes confiáveis de pesquisa',
      'Relatório COT da CFTC: lendo o posicionamento do dinheiro institucional',
    ],
    chapters: [
      {
        id: 'cap_1_1',
        partId: 'parte_1',
        chapterNumber: 1,
        title: 'O mercado de commodities e o lugar do ouro',
        summary: 'Entenda o tabuleiro global de commodities em que o ouro joga e sua dupla natureza de reserva.',
        keyTakeaways: [
          'O ouro é commodity industrial/joalheira e, simultaneamente, ativo monetário de reserva de valor.',
          'Commodities denominadas em dólar têm sensibilidade direta às oscilações do DXY.',
          'CFDs e contratos futuros alavancam ganhos e perdas — exigem gestão rigorosa de margem.',
        ],
        contentSections: [
          {
            title: 'As quatro categorias de commodities',
            text: 'O comércio de commodities permite diversificar além de ações tradicionais, negociando matérias-primas essenciais da economia global.',
            table: {
              headers: ['Categoria', 'Exemplos'],
              rows: [
                ['Agrícolas', 'Cacau, algodão, milho, café, pecuária, açúcar'],
                ['Energéticas', 'Gás natural, petróleo bruto, gasolina, carvão, urânio'],
                ['Metálicas', 'Básicos (cobre, minério, zinco) e Preciosos (ouro, prata, platina)'],
                ['Ambientais', 'Certificados de energia renovável, créditos de carbono'],
              ],
            },
            callout: {
              type: 'concept',
              title: 'O DÓLAR COMO DENOMINADOR COMUM',
              text: 'A maioria das commodities é denominada em dólares. Dólar mais forte torna as commodities mais caras para compradores internacionais (reduzindo demanda); dólar mais fraco torna-as mais baratas (aumentando demanda).',
            },
          },
          {
            title: 'Instrumentos de Negociação',
            text: 'Existem quatro formas de se expor ao ouro: CFDs (sem posse física, sujeitos a swap), Futuros (CME/COMEX com data fixa), Opções sobre futuros e Compra física.',
            callout: {
              type: 'warning',
              title: 'ATENÇÃO: CFDS SÃO PRODUTOS ALAVANCADOS',
              text: 'Uma margem de 10% significa depositar apenas 10% do valor total. A alavancagem amplia perdas na mesma proporção dos ganhos. Opere sempre com stop técnico.',
            },
          },
        ],
      },
      {
        id: 'cap_1_2',
        partId: 'parte_1',
        chapterNumber: 2,
        title: 'O que realmente move o preço do ouro',
        summary: 'As cinco forças que determinam para onde o ouro caminha.',
        keyTakeaways: [
          'Dólar (DXY) e Ouro possuem correlação inversa histórica.',
          'Bancos centrais compram ouro como reserva estratégica desdolarizada.',
          'Juros reais mais altos aumentam custo de oportunidade de carregar ouro.',
          'Crises geopolíticas causam ralis de refúgio (safe-haven).',
        ],
        contentSections: [
          {
            title: 'As 5 Forças Principais',
            text: '1. Dólar Americano (relação inversa).\n2. Demanda Estrutural (Joias, ETFs GLD/IAU, Bancos Centrais e Indústria).\n3. Oferta e Produção Mineral (Recurso finito com custo crescente de extração).\n4. Taxas de Juros Reais (Custo de oportunidade do capital).\n5. Geopolítica e Conflitos (Busca por refúgio soberano).',
            table: {
              headers: ['Contexto Econômico', 'Efeito Esperado no Ouro'],
              rows: [
                ['Juros sobem em economia forte', 'Bearish (capital migra para risco)'],
                ['Juros sobem com desconfiança / recessão', 'Neutro / Resiliente'],
                ['Inflação persistente acelera', 'Bullish (hedge de poder de compra)'],
              ],
            },
            callout: {
              type: 'gold_analyst',
              title: 'COM O GOLD ANALYST',
              text: 'O Gold Analyst já cruza automaticamente DXY, US10Y e notícias geopolíticas em um placar consolidado de 0 a 100.',
            },
          },
        ],
      },
      {
        id: 'cap_1_3',
        partId: 'parte_1',
        chapterNumber: 3,
        title: 'A metodologia GRAM do World Gold Council',
        summary: 'Decomposição matemática do retorno do ouro em 4 grandes pilares.',
        keyTakeaways: [
          'GRAM: Gold Return Attribution Model do WGC.',
          'Quatro grupos: Expansão Econômica, Risco e Incerteza, Custo de Oportunidade e Momentum.',
          'Permite diagnosticar com precisão quais drivers estão no controle do mercado.',
        ],
        contentSections: [
          {
            title: 'Os 4 Pilares do GRAM',
            text: '1. Expansão Econômica: Renda e riqueza global.\n2. Risco e Incerteza: Fluxos em ações, volatilidade implícita (VIX), balanço do Fed e petróleo.\n3. Custo de Oportunidade: Juros nominais de 10 anos e taxas de câmbio.\n4. Momentum & Tendências: Retorno defasado, fluxos de ETFs e compras especulativas na COMEX.',
            callout: {
              type: 'concept',
              title: 'O PRINCÍPIO POR TRÁS DO GRAM',
              text: 'Agrupar dezenas de dados em poucos temas dominantes para saber se o ouro está reagindo a juros, medo geopolítico ou puro momentum.',
            },
          },
        ],
      },
      {
        id: 'cap_1_4',
        partId: 'parte_1',
        chapterNumber: 4,
        title: 'Contexto global e as fontes certas de pesquisa',
        summary: 'Como montar uma rotina de análise fundamentalista sem ruído.',
        keyTakeaways: [
          'Fontes primárias: World Gold Council, CFTC, MacroMicro, CME QuikStrike.',
          'Filtre notícias: Foque em Fed, CPI/PCE, Payroll, Geopolítica e Reservas de Bancos Centrais.',
        ],
        contentSections: [
          {
            title: 'Fontes Profissionais de Dados',
            text: 'Mantenha em seu radar: World Gold Council (gold.org), CFTC (relatório COT semanal), MacroMicro e portais de metais como Metals Daily e BullionVault.',
            callout: {
              type: 'warning',
              title: 'A POLÍTICA MONETÁRIA É O FIEL DA BALANÇA',
              text: 'Mesmo em cenário geopolítico tenso, se o Fed for agressivamente restritivo com juros reais altos, o ouro enfrentará ventos contrários.',
            },
          },
        ],
      },
      {
        id: 'cap_1_5',
        partId: 'parte_1',
        chapterNumber: 5,
        title: 'O Relatório COT: lendo o posicionamento do dinheiro grande',
        summary: 'Como ler as posições líquidas dos grandes fundos (Managed Money) e comerciais na CFTC.',
        keyTakeaways: [
          'Publicado toda sexta-feira às 20h30 BRT pela CFTC.',
          'Managed Money (especuladores institucionais) seguem tendência.',
          'Commercials (produtores/bancos) fazem hedge contra oscilações.',
          'Extremos de posicionamento (>90% ou <10%) sinalizam risco iminente de reversão.',
        ],
        contentSections: [
          {
            title: 'Managed Money vs Commercials',
            text: 'O COT mede os contratos abertos na COMEX. Quando o Managed Money atinge máximas históricas de compra, resta pouco fluxo novo para sustentar a alta, configurando oportunidade contrarian de reversão.',
            table: {
              headers: ['Participante', 'Comportamento Típico'],
              rows: [
                ['Commercials (Hedgers)', 'Compram na baixa, vendem na alta (proteção de estoques)'],
                ['Managed Money (Fundos)', 'Seguem tendência até a exaustão total do movimento'],
              ],
            },
            callout: {
              type: 'gold_analyst',
              title: 'COT INDEX AUTOMATIZADO',
              text: 'O Gold Analyst calcula o COT Index de 26 e 156 semanas, emitindo alertas automáticos de sobrecompra ou sobrevenda institucional.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'parte_2',
    number: 'Parte II',
    title: 'O Mercado Macro Correlacionado',
    subtitle: 'As forças que se movem em paralelo ao ouro e antecipam a direção gráfica',
    dominationPoints: [
      'VIX e DXY como termômetros essenciais de aversão e apetite ao risco',
      'ETFs (GLD, GDX), US10Y, TIPS e TLT no painel de correlações',
      'Currency Strength Meter e a Matriz do Ouro',
      'Checklist Risk ON / Risk OFF de 8 passos no pré-mercado',
      'Templates visuais de confluência no TradingView',
    ],
    chapters: [
      {
        id: 'cap_2_1',
        partId: 'parte_2',
        chapterNumber: 1,
        title: 'VIX, DXY e o painel de correlações-chave',
        summary: 'Aprenda a ler os pares certos para enxergar o movimento do ouro antes do candle fechar.',
        keyTakeaways: [
          'DXY: Cesta do dólar (EUR 57.6%, JPY 13.6%, GBP 11.9%). Relação inversa forte.',
          'VIX: Expectativa de volatilidade do S&P 500. Relação positiva com o ouro em pânico.',
          'US10Y / TIPS: Juros nominais e títulos protegidos de inflação.',
        ],
        contentSections: [
          {
            title: 'Composição do DXY e Correlações',
            text: 'O euro representa mais da metade do DXY. Portanto, variações no EUR/USD afetam diretamente o índice dólar e o ouro.',
            table: {
              headers: ['Ativo Correlacionado', 'Relação com o Ouro', 'Reatividade'],
              rows: [
                ['DXY (Índice Dólar)', 'Inversa (-)', 'Rápida (Scalp/Intraday)'],
                ['US10Y (Yield 10 Anos)', 'Inversa (-)', 'Estrutural / Médio Prazo'],
                ['Prata (XAG)', 'Direta (+)', 'Alta Sensibilidade'],
                ['AUD/USD & NZD/USD', 'Direta (+)', 'Moedas Commodity'],
                ['GDX (Mineradoras)', 'Direta (+)', 'Sentimento Antecipado'],
              ],
            },
            callout: {
              type: 'concept',
              title: 'CONFLUÊNCIA DE CORRELAÇÕES',
              text: 'DXY caindo + US10Y caindo + AUD subindo + VIX subindo formam o alinhamento de maior probabilidade para compras no ouro.',
            },
          },
        ],
      },
      {
        id: 'cap_2_2',
        partId: 'parte_2',
        chapterNumber: 2,
        title: 'Força das moedas e a Matriz do Ouro',
        summary: 'Identifique se o mercado está em modo Risk-ON ou Risk-OFF através das moedas.',
        keyTakeaways: [
          'Currency Strength Meter compara moedas principais contra suas cestas.',
          'Moedas commodity fortes (AUD, CAD, NZD) = Risk-ON.',
          'Moedas refúgio fortes (USD, JPY, CHF) = Risk-OFF.',
        ],
        contentSections: [
          {
            title: 'A Matriz do Ouro',
            text: 'A Matriz do Ouro cruza as moedas contra o próprio ouro para discernir se a alta do metal é por fraqueza do dólar ou por força intrínseca do ouro.',
            callout: {
              type: 'concept',
              title: 'DIAGRAMA DE FORÇAS DO OURO',
              text: 'DXY (Inversa) e US10Y (Inversa) puxam para baixo. Moedas-commodity e Prata puxam para cima.',
            },
          },
        ],
      },
      {
        id: 'cap_2_3',
        partId: 'parte_2',
        chapterNumber: 3,
        title: 'O checklist Risk ON/OFF de 8 passos',
        summary: 'A rotina exata ensinada pelo Curso Gold para o pré-mercado matinal.',
        keyTakeaways: [
          'Passo 1 a 8: Fechamento D-1, Bolsas Globais, DXY, Commodities, Yields, Correlações, Calendário e Notícias.',
          'Reduz o tempo de preparação e impede o operador de abrir ordens às cegas.',
        ],
        contentSections: [
          {
            title: 'Os 8 Passos da Preparação',
            text: '1. Fechamento da sessão anterior\n2. Bolsas mundiais (Ásia, Europa, Futuros EUA)\n3. Força do DXY e emergentes\n4. Commodities (Petróleo, Prata, Cobre)\n5. Yields dos títulos (US10Y e US02Y)\n6. Correlações com o Ouro\n7. Horários de notícias no Calendário Econômico\n8. Manchetes filtradas de bancos centrais',
            callout: {
              type: 'warning',
              title: 'TRABALHE SEMPRE DE FORMA REATIVA',
              text: 'Não se apegue a um viés se os números macro e o fluxo invalidarem sua hipótese no início da sessão.',
            },
          },
        ],
      },
      {
        id: 'cap_2_4',
        partId: 'parte_2',
        chapterNumber: 4,
        title: 'Templates operacionais de correlação',
        summary: 'Como organizar as telas no TradingView para capturar padrões em segundos.',
        keyTakeaways: [
          'Multi-telas com GC, DXY, US10Y, XAGUSD e SP500 no mesmo timeframe.',
          'Foco em divergências e confirmações visuais.',
        ],
        contentSections: [
          {
            title: 'Organização de Telas',
            text: 'Configure telas lado a lado no TradingView com os ativos-chave. Quando o DXY rompe uma máxima mas o ouro se recusa a cair, uma divergência institucional está em curso.',
          },
        ],
      },
    ],
  },
  {
    id: 'parte_3',
    number: 'Parte III',
    title: 'Rastreamento de Preço, Volume e Open Interest',
    subtitle: 'Volume Profile, Setups Institucionais, Open Interest nas Opções do GC e ETF GLD',
    dominationPoints: [
      'Volume Profile: POC, Área de Valor (VAH/VAL), HVN e LVN',
      'Os 4 formatos do perfil de volume: P, b, D e B',
      'Os 3 setups institucionais: Acumulação Lateral, Spikes e Rejeição em V',
      'Open Interest nas opções da COMEX e ferramenta QuikStrike',
      'A relevância do ETF GLD e o impacto das opções 0DTE',
    ],
    chapters: [
      {
        id: 'cap_3_1',
        partId: 'parte_3',
        chapterNumber: 1,
        title: 'Volume Profile: o rastro dos grandes players',
        summary: 'Aprenda a ler onde 80% do volume institucional foi executado na escala de preço.',
        keyTakeaways: [
          'POC (Point of Control): Preço de maior volume da sessão.',
          'Área de Valor (Value Area): 70% do volume negociado.',
          'HVN: Nós de alto volume (ímãs/suportes). LVN: Nós de baixo volume (zonas de rejeição/passagem rápida).',
        ],
        contentSections: [
          {
            title: 'Formatos do Perfil de Volume',
            text: 'O formato do perfil revela o equilíbrio das forças institucionais.',
            table: {
              headers: ['Formato', 'Formação', 'Leitura Operacional'],
              rows: [
                ['P', 'Alta rápida e consolidação no topo', 'Sinal comprador / Fim de baixa'],
                ['b', 'Queda forte e consolidação no fundo', 'Sinal vendedor / Fim de alta'],
                ['D', 'POC centralizado e simétrico', 'Equilíbrio e indecisão (Range)'],
                ['B', 'Dois perfis D sobrepostos', 'Distribuição dupla / Rompimento'],
              ],
            },
            callout: {
              type: 'concept',
              title: 'PULLBACK NO NÓ DE ALTO VOLUME (HVN)',
              text: 'Preço abaixo do HVN atua como resistência. Preço acima atua como suporte sólido.',
            },
          },
        ],
      },
      {
        id: 'cap_3_2',
        partId: 'parte_3',
        chapterNumber: 2,
        title: 'Os 3 setups institucionais e o Sistema Profile',
        summary: 'Padrões gráficos de acumulação, agressão direcional e absorção.',
        keyTakeaways: [
          'Setup 1: Acumulações laterais (montagem silenciosa de lote).',
          'Setup 2: Spikes direcionais agressivos (deslocamento com volume fino).',
          'Setup 3: Rejeições extremas em V (absorção e armadilha de liquidez).',
          'A regra do primeiro toque: Maior probabilidade de reação.',
        ],
        contentSections: [
          {
            title: 'O Sistema Profile',
            text: 'Marque suportes e resistências nos limites de volume D-1 e D-2. Dê prioridade para confluências entre POCs anteriores e níveis de opções.',
          },
        ],
      },
      {
        id: 'cap_3_3',
        partId: 'parte_3',
        chapterNumber: 3,
        title: 'Open Interest nas opções do GC',
        summary: 'Contratos em aberto ao final do dia revelam criação ou liquidação de posições.',
        keyTakeaways: [
          'Volume conta trocas no dia. Open Interest (OI) conta contratos retidos no pernoite.',
          'OI subindo com preço subindo = Tendência de alta confirmada por dinheiro novo.',
          'OI caindo = Exaustão e realização de lucros.',
        ],
        contentSections: [
          {
            title: 'Leitura de Open Interest',
            text: 'Através do QuikStrike da CME, mapeie a concentração de OI em calls e puts para identificar barreiras institucionais.',
          },
        ],
      },
      {
        id: 'cap_3_4',
        partId: 'parte_3',
        chapterNumber: 4,
        title: 'A ETF GLD: open interest, fluxos e opções 0DTE',
        summary: 'O ETF mais líquido do mundo como termômetro institucional do ouro físico.',
        keyTakeaways: [
          'GLD detém ouro físico em custódia. Compras de GLD forçam compras de barras físicas.',
          'Opções 0DTE na GLD causam rebalanceamentos intradiários imediatos nos futuros GC.',
        ],
        contentSections: [
          {
            title: 'Por que rastrear a GLD',
            text: 'A cadeia de opções da GLD é a fonte primária utilizada para calcular os níveis de Gamma Exposure (GEX) do ouro.',
          },
        ],
      },
    ],
  },
  {
    id: 'parte_4',
    number: 'Parte IV',
    title: 'Gamma Exposure e Volatilidade',
    subtitle: 'Delta Hedge do Market Maker, Mecânica do GEX e Níveis Estruturais',
    dominationPoints: [
      'Opções básicas e o impacto das 0DTE no day trade',
      'O Delta Hedging dos Market Makers e a neutralidade de risco',
      'GEX Profile: Call Wall, Put Wall e Gamma Flip',
      'Regimes de Contenção (Long Gamma) vs Aceleração (Short Gamma)',
      'Volatilidade Implícita (IV) e Expected Move',
    ],
    chapters: [
      {
        id: 'cap_4_1',
        partId: 'parte_4',
        chapterNumber: 1,
        title: 'O básico sobre opções e as 0DTE',
        summary: 'Como as opções determinam os movimentos do ativo subjacente.',
        keyTakeaways: [
          'Call = Direito de compra. Put = Direito de venda.',
          '0DTE = Opções com vencimento no mesmo dia. Alta sensibilidade de gamma.',
        ],
        contentSections: [
          {
            title: 'Estratégias Básicas',
            text: 'Long Call, Long Put, Covered Call e Protective Put.',
            callout: {
              type: 'warning',
              title: 'RISCO DE GAMMA NAS 0DTE',
              text: 'No dia do vencimento, o gamma explode, obrigando dealers a comprarem e venderem grandes volumes de futuros a cada tick de oscilação.',
            },
          },
        ],
      },
      {
        id: 'cap_4_2',
        partId: 'parte_4',
        chapterNumber: 2,
        title: 'O Delta Hedge do Market Maker',
        summary: 'A mecânica por trás das atrações de preço e suportes/resistências ocultos.',
        keyTakeaways: [
          'Market Maker busca lucrar com o spread e manter Delta Neutro.',
          'Ao vender call, compra o ativo subjacente. Ao vender put, vende o ativo subjacente.',
          'Essa necessidade mecânica cria as barreiras invisíveis no gráfico.',
        ],
        contentSections: [
          {
            title: 'Mecânica do Delta Hedge',
            text: 'Se o preço sobe e o delta da call vendida aumenta de 0.5 para 0.7, o dealer compra mais 20 ações/futuros para reequilibrar seu livro. Esse processo amplifica tendências em Short Gamma e amortece em Long Gamma.',
          },
        ],
      },
      {
        id: 'cap_4_3',
        partId: 'parte_4',
        chapterNumber: 3,
        title: 'O GEX Profile: a mecânica da exposição gamma',
        summary: 'O coração quantitativo: Call Wall, Put Wall e Gamma Flip.',
        keyTakeaways: [
          'Call Wall: Teto da sessão em dias normais (dealers vendem na aproximação).',
          'Put Wall: Piso da sessão em dias normais (dealers compram na aproximação).',
          'Gamma Flip: O divisor de águas entre calmaria estatística e volatilidade direcional.',
        ],
        contentSections: [
          {
            title: 'Os Três Níveis-Chave',
            text: '1. Call Wall (Resistência máxima de gamma de calls)\n2. Gamma Flip (Ponto zero de gamma)\n3. Put Wall (Suporte máximo de gamma de puts)',
            table: {
              headers: ['Regime', 'Posição dos Dealers', 'Comportamento do Preço'],
              rows: [
                ['GEX Positivo (Long Gamma)', 'Compram na baixa, vendem na alta', 'Contenção, reversão e range'],
                ['GEX Negativo (Short Gamma)', 'Vendem na baixa, compram na alta', 'Aceleração e rompimentos explosivos'],
              ],
            },
            callout: {
              type: 'case_study',
              title: 'CASO REAL: TODOS OS VENCIMENTOS IMPORTAM',
              text: 'Olhar apenas opções semanais gera leituras falsas de regime. O grosso do gamma do ouro reside nos vencimentos mensais institucionais.',
            },
          },
        ],
      },
      {
        id: 'cap_4_4',
        partId: 'parte_4',
        chapterNumber: 4,
        title: 'Volatilidade Implícita e Expected Move',
        summary: 'Como calcular a oscilação estatística esperada para o dia.',
        keyTakeaways: [
          'Volatilidade Implícita (IV) precifica incerteza futura no valor do straddle.',
          'Expected Move define os limites estatísticos de 1 desvio padrão.',
          'Stops operacionais devem respeitar os limites do Expected Move.',
        ],
        contentSections: [
          {
            title: 'Expected Move na Prática',
            text: 'O Expected Move traduz a IV em dólares reais de amplitude de movimento para a sessão.',
          },
        ],
      },
    ],
  },
  {
    id: 'parte_5',
    number: 'Parte V',
    title: 'O Gold Analyst na Prática',
    subtitle: 'Os 4 Motores, Relatório Pré-Mercado, 9 Ferramentas e Workflow Diário',
    dominationPoints: [
      'Os 4 motores analíticos: GEX, Correlações, COT e Notícias',
      'Calibração de precisão e conversão ao vivo GLD -> GC / XAUUSD',
      'Relatório Pré-Mercado com os 3 cenários operacionais',
      'As 9 ferramentas de consulta sob demanda',
      'Workflow operacional diário: Pré-abertura e Sessão de Nova York',
    ],
    chapters: [
      {
        id: 'cap_5_1',
        partId: 'parte_5',
        chapterNumber: 1,
        title: 'Por que construímos o Gold Analyst',
        summary: 'Superando a assimetria entre o trader de varejo e a mesa institucional.',
        keyTakeaways: [
          'Automatiza a coleta pesada de dados de 4 fontes simultâneas.',
          'Não é robô de sinal nem executor automático — é um copiloto de inteligência analítica.',
        ],
        contentSections: [
          {
            title: 'Os Quatro Motores',
            text: 'GEX (Intraday), Correlações Macro (Diário), COT (Semanal) e Notícias & Sentimento (24-48h).',
          },
        ],
      },
      {
        id: 'cap_5_2',
        partId: 'parte_5',
        chapterNumber: 2,
        title: 'Motor 1 — GEX: calculado do zero',
        summary: 'Pipeline de precificação Black-Scholes e calibração contra o mercado.',
        keyTakeaways: [
          'Baixa a cadeia de opções completa da GLD.',
          'Calcula gregas contrato a contrato.',
          'Converte strikes para GC futuros e XAUUSD com paridade dinâmica.',
        ],
        contentSections: [
          {
            title: 'História de Calibração',
            text: 'A calibração com dados mensais alinhou os dados perfeitamente com os terminais Barchart e QuikStrike.',
          },
        ],
      },
      {
        id: 'cap_5_3',
        partId: 'parte_5',
        chapterNumber: 3,
        title: 'Motor 2 — Correlações: placar ponderado',
        summary: 'Placar ponderado e detecção automática de quebra de correlação.',
        keyTakeaways: [
          'Monitora 14 ativos em tempo real.',
          'Identifica quando ouro e DXY sobem juntos (demanda física extrema).',
        ],
        contentSections: [
          {
            title: 'Divergências Reais',
            text: 'Sinaliza tensões macro quando correlações históricas se invertem temporariamente.',
          },
        ],
      },
      {
        id: 'cap_5_4',
        partId: 'parte_5',
        chapterNumber: 4,
        title: 'Motor 3 — COT e Motor 4 — Notícias',
        summary: 'Posicionamento institucional e radar de notícias filtrado.',
        keyTakeaways: [
          'Calcula COT Index de 156 semanas.',
          'Classifica sentimento de notícias em escala Bullish/Bearish.',
        ],
        contentSections: [
          {
            title: 'Veredicto Consolidado',
            text: 'Classificação objetiva de viés institucional.',
          },
        ],
      },
      {
        id: 'cap_5_5',
        partId: 'parte_5',
        chapterNumber: 5,
        title: 'O Relatório Pré-Mercado e as 9 ferramentas',
        summary: 'As 9 ferramentas sob demanda e a estrutura dos 3 cenários operacionais.',
        keyTakeaways: [
          'gold_relatorio_premarket, gold_sentimento, gold_gex, gold_niveis_estruturais, gold_correlacoes, gold_cot, gold_noticias, gold_validacao_intraday, gold_cotacoes.',
          'Cenários operacionais: Base (Range), Bullish (Rompimento alta) e Bearish (Rompimento baixa).',
        ],
        contentSections: [
          {
            title: 'As 9 Ferramentas',
            table: {
              headers: ['Ferramenta', 'Entrega'],
              rows: [
                ['gold_relatorio_premarket', 'Relatório-mestra com os 4 motores e cenários'],
                ['gold_sentimento', 'Síntese rápida de viés e regime GEX'],
                ['gold_gex', 'Walls, Gamma Flip e Expected Move'],
                ['gold_niveis_estruturais', 'Tabela nos 3 instrumentos (GLD/GC/XAUUSD)'],
                ['gold_correlacoes', 'Placar macro ponderado e Risk ON/OFF'],
                ['gold_cot', 'Posição CFTC e COT Index histórico'],
                ['gold_noticias', 'Manchetes filtradas das últimas 24-48h'],
                ['gold_validacao_intraday', 'Checagem de respeito aos níveis no intraday'],
                ['gold_cotacoes', 'Snapshot de todo o tabuleiro do ouro'],
              ],
            },
          },
        ],
      },
      {
        id: 'cap_5_6',
        partId: 'parte_5',
        chapterNumber: 6,
        title: 'O workflow diário e encerramento do método',
        summary: 'A rotina operacional de execução antes e durante a sessão de Nova York.',
        keyTakeaways: [
          '08h-09h BRT: Relatório pré-mercado, COT e Notícias.',
          '10h-17h BRT: Consulta de níveis estruturais antes de abrir ordens.',
          'A preservação de capital e a execução disciplinada são inegociáveis.',
        ],
        contentSections: [
          {
            title: 'Workflow Diário',
            text: 'Conclua a preparação matinal antes da abertura e opere somente quando houver confluência entre níveis quantitativos e confirmação macro.',
          },
        ],
      },
    ],
  },
];
