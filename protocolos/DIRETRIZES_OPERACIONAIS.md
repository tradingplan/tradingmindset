# Guia de Diretrizes Operacionais Gerais — MyTrading Quant

> **"Contexto Antes de Opinião"**  
> Este guia reúne os pilares conceituais e operacionais que orientam as decisões na mesa quantitativa. O objetivo é remover o viés emocional, operando estritamente na confluência de microestrutura de opções, posicionamento institucional e correlações de mercado.

---

## I. A Filosofia Central do Sistema

Traders amadores buscam adivinhar topos e fundos com indicadores gráficos atrasados. A mesa institucional opera definindo a **estrutura de risco e volatilidade** antes de abrir qualquer ordem.

O mercado se move pela necessidade de hedge dos Market Makers (formadores de mercado). A exposição Gamma (GEX) e as barreiras de opções indicam onde esses grandes players serão forçados a comprar ou vender o ativo subjacente para equilibrar suas carteiras (Delta Neutrality).

![Níveis Quantitativos](/help-images/00-example-levels1.png)

## II. Os Níveis Quantitativos (O que olhar)

Todos os dias, antes da abertura de cada mercado, localize no seu dashboard os 5 níveis principais convertidos para o preço de tela (Spot e Futuro):

1. **Put Wall (Muralha de Puts)**:
   - **O que é**: O nível de preço com a maior concentração de contratos de Put (opções de venda).
   - **Papel**: Funciona como o suporte mais forte da sessão sob condições normais de mercado.
2. **Call Wall (Muralha de Calls)**:
   - **O que é**: O nível de preço com a maior concentração de contratos de Call (opções de compra).
   - **Papel**: Funciona como a resistência mais forte da sessão sob condições normais.
3. **Gamma Flip**:
   - **O que é**: O divisor de águas da volatilidade. Nível onde o Gamma líquido transita de positivo para negativo.
   - **Papel**: Define a mudança de comportamento do mercado.
4. **Max Pain (Ponto de Máxima Dor)**:
   - **O que é**: O strike onde a maioria das opções em aberto expiraria sem valor financeiro (máximo prejuízo para os compradores de opções).
   - **Papel**: Funciona como uma força gravitacional sutil de atração do preço, principalmente próximo ao vencimento das opções.
5. **Expected Move (Faixa Esperada)**:
   - **O que é**: O limite superior e inferior de oscilação estatística esperada para o dia (calculado via volatilidade implícita das opções).
   - **Papel**: Define as fronteiras reais de stop e alvos de realização.

---

## III. Os Dois Regimes de Exposição Gamma (GEX)

A mecânica operacional muda completamente a depender do regime de Net GEX (positivo ou negativo):

### 1. Regime de Contenção (Long Gamma) — _Net GEX maior que zero_

- **Mecânica**: Os formadores de mercado atuam contra a tendência principal (compram nas quedas e vendem nas altas para fazer hedge).
- **Comportamento do Preço**: Reversão à média, consolidação, volatilidade baixa e movimentos limitados. O preço tende a respeitar rigorosamente a **Put Wall** e a **Call Wall**.
- **Como Operar**:
  - **Comprar**: Próximo à _Put Wall_ ou na extremidade inferior do _Expected Move_, aguardando rejeição institucional (absorção) para buscar o retorno à média.
  - **Vender**: Próximo à _Call Wall_ ou na extremidade superior do _Expected Move_, operando contra o movimento inicial de alta, buscando o retorno ao preço justo (Max Pain ou Gamma Flip).
  - **Invalidação**: Se o preço romper e fechar fora dos limites estabelecidos com volume anormal e sustentado.

### 2. Regime de Aceleração (Short Gamma) — _Net GEX menor que zero_

- **Mecânica**: Os formadores de mercado atuam a favor da tendência (vendem nas quedas e compram nas altas para se protegerem).
- **Comportamento do Preço**: Tendência direcional forte, expansão de volatilidade e movimentos explosivos. Níveis de suporte e resistência convencionais são rompidos facilmente.
- **Como Operar**:
  - **Comprar**: No rompimento confirmado para cima do _Gamma Flip_ ou da _Call Wall_, com stop curto e alvo no limite de expansão do dia.
  - **Vender**: No rompimento confirmado para baixo do _Gamma Flip_ ou da _Put Wall_, operando a favor do pânico/fluxo vendedor acelerado.
  - **Invalidação**: O preço reverter e fechar novamente dentro da faixa anterior (falso rompimento).

---

## IV. Diretrizes Específicas por Ativo

### 🥇 Ouro (GOLD - GC / XAUUSD)

- **O que olhar**:
  1. **DXY (Dólar Americano)** e **Yields de 10 Anos (US10Y)**: O ouro possui correlação inversa de longo prazo com o dólar e com os juros reais. Se o DXY e o US10Y estiverem subindo, o ouro enfrentará grande resistência para avançar.
  2. **Relatório COT (Managed Money)**: Verifique se os grandes fundos especulativos estão aumentando ou reduzindo suas posições compradas líquidas.
- **Quando Comprar**:
  - Em Regime de Contenção, quando o preço do ouro testar a **Put Wall** e, simultaneamente, o DXY e os Yields US10Y mostrarem sinal de topo ou queda na sessão.
- **Quando Vender**:
  - Em Regime de Contenção, quando testar a **Call Wall** sob valorização do dólar/DXY.
  - Em Regime de Aceleração, se o preço romper para baixo o **Gamma Flip**, com o DXY demonstrando força compradora no dia.

### 🇭🇰 Hang Seng (HK50)

- **O que olhar**:
  1. **Warrants CBBC (Barreiras de Liquidação)**: O mercado de Hong Kong é repleto de Warrants (CBBC). Os emissores tentam empurrar o mercado para liquidar as barreiras de varejo (pontos de "knock-out"). Identifique onde estão concentrados esses patamares.
  2. **Fluxo Southbound (Dinheiro Continental)**: Verifique o saldo diário de entrada de fluxo chinês. Fluxo positivo apoia o mercado; fluxo negativo abre espaço para quedas acentuadas.
- **Quando Comprar**:
  - Quando o preço estiver se aproximando de uma grande concentração de barreiras de CBBC (liquidez para reversão) e houver fluxo Southbound comprador forte na abertura da sessão chinesa.
- **Quando Vender**:
  - Em rompimento de canais de warrants para baixo, onde os market makers aceleram as vendas para liquidar posições compradas do varejo.

### 🇺🇸 S&P 500 (SP500) e Nasdaq-100 (NASDAQ)

- **O que olhar**:
  1. **VIX (para SP500)** e **VXN (para Nasdaq)**: A volatilidade implícita dita o tamanho das posições. Se o VIX estiver caindo, os algoritmos institucionais (Risk Parity) compram ações sistematicamente.
  2. **Magnificent 7 (Big Techs)**: O peso concentrado de Apple, Microsoft, Nvidia, etc., dita o rumo do Nasdaq. Monitore a abertura das ações líderes.
- **Quando Comprar**:
  - Com o VIX estável ou em queda, e o preço acima do **Gamma Flip** (Regime de Long Gamma). Procure reentradas nas correções próximas ao Gamma Flip ou pontos de Volume Profile relevantes (POC).
- **Quando Vender**:
  - Com o VIX em forte alta estrutural e o preço abaixo do **Gamma Flip** (Regime de Short Gamma / Aceleração de Queda). Evite compras contra a maré de aceleração de gama negativa.

---

## V. O Checklist Diário Disciplinador

Antes de clicar no botão e abrir qualquer operação, preencha mentalmente ou por escrito:

- [ ] **1. Qual é o Regime GEX do Ativo no dia?**  
      _É maior que zero (Contenção - buscar reversões nas extremidades) ou menor que zero (Aceleração - buscar rompimentos e momentum)?_
- [ ] **2. Onde estão localizados a Put Wall, Call Wall e o Gamma Flip?**  
      _Estou ciente dessas zonas e sei que operar dentro do meio da faixa é ruído estatístico?_
- [ ] **3. As correlações macro estão confirmando a direção?**  
      _(Exemplo para o Ouro: O DXY e US10Y estão alinhados ou divergentes com a minha hipótese?)_
- [ ] **4. Onde está o limite de risco definido pelo Expected Move?**  
      _Meu stop de invalidação está posicionado fora do Expected Move diário para evitar ser violinado pelo ruído intradiário?_
- [ ] **5. A minha relação Risco/Retorno é favorável?**  
      _O potencial de ganho até o próximo nível quantitativo relevante é no mínimo duas vezes maior do que o risco que estou assumindo no stop?_

> **Regra de Ouro da Mesa**: Se o checklist não estiver totalmente alinhado ou se o preço estiver no meio do caminho entre a Put Wall e a Call Wall, a melhor operação é **não fazer nada**. A preservação do capital é a primeira lei do trading quantitativo.
