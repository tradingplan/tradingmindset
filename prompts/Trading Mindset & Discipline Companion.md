# 🧠 Plano do Aplicativo: *Trading Mindset & Discipline Companion*

### 1. Visão do Produto & Problema que Resolve
No trading de futuros (índice, dólar, commodities, cripto), **a técnica representa 20% do resultado e o controle comportamental 80%**. Os maiores sabotadores são:
* **Entrar por FOMO / Ansiedade** (não esperar o setup confirmar);
* **Revenge Trading / Tilt** (aumentar a mão após um loss para "recuperar");
* **Overtrading** (operar por tédio após o horário ou meta batida);
* **Hesitação** (medo de clicar após um dia ruim).

O app mobile funciona como o seu **"Coach de Mesa de Operações"** sempre à mão ao lado do teclado, com **3 pilares**:
1. **Áudios de Ancoragem (Voz & Frequências):** Afirmações de identidade vencedora, preparação matinal, foco sniper e descompressão pós-sessão com reprodução em segundo plano.
2. **Protocolo de Checklists Obrigatórios:** Pré-Mercado, Durante o Trade e Pós-Mercado com pontuação diária de disciplina.
3. **Botão de Emergência SOS Tilt (Reset Rápido de 90s):** Áudio de intervenção rápida para tirar a mão do mouse antes de fazer besteira na plataforma.

---

### 2. Estrutura das 4 Telas Principais

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRADING MIND COMPANION                          │
├───────────────┬────────────────┬───────────────┬───────────────────────┤
│ 📋 PROTOCOLO  │ 🎙️ AUDIOTECA   │ 🚨 SOS TILT   │ 📖 MEU PLANO & REGRAS │
│ Checklists de │ Afirmações,    │ Intervenção   │ Leis de Risco,        │
│ Pré, Durante  │ Meditações e   │ de 90s para   │ Setups e Gatilhos     │
│ e Pós-Mercado │ Reprogramação  │ cortar o loss │ de Auto-Sabotagem     │
└───────────────┴────────────────┴───────────────┴───────────────────────┘
```

#### A. Tab 1: Protocolo & Checklists do Dia
* **Pré-Mercado:** Checagem de sono/humor, calendário econômico (notícias), limite máximo de perda do dia estabelecido, meta clara, confirmação de risco.
* **Validador de Entrada (Sniper):** O setup deu sinal no gráfico? O stop técnico cabe no bolso? A relação risco/retorno é vantajosa?
* **Pós-Mercado:** Respeitou as regras? Fechou a plataforma no limite? Score de disciplina de 0 a 100%.

#### B. Tab 2: Santuário de Áudios & Afirmações
* **Pré-Abertura (5 a 10 min):** *"A Mente do Trader Disciplinado"*, *"Eu sou um Executor de Probabilidades"*, *"Paciência de Franco-Atirador"*.
* **Áudios de Foco (Looping de Fundo):** Ondas Alfa e Binaural Beats para operar concentrado sem música distrativa.
* **Pós-Loss (3 min):** *"O Loss é apenas o Custo do Negócio"*, *"Protegendo meu Capital Psicológico"*.
* **Encerramento / Sono:** *"Desligando o Mercado da Mente"*, *"Sono Reparador para o Próximo Pregão"*.

#### C. Tab 3: Botão SOS Tilt (Intervenção Rápida)
* Um botão de destaque vermelho/âmbar acessível com 1 toque.
* Dispara um áudio de 60 a 90 segundos com condução de respiração (técnica 4-7-8) e comando de parada imediata: *"Tire as mãos do teclado agora. Respire fundo. Nenhum trade vai mudar sua vida hoje, mas uma violação de stop pode destruir meses de trabalho."*

#### D. Tab 4: Minhas Leis Inegociáveis & Mental Models
* Cartões visuais rápidos:
  * Regra de Risco: *Loss Máximo do Dia = R$ X ou Y pontos*.
  * Regra de Operações: *Máximo de Z trades por sessão*.
  * Leis de Mark Douglas (*Trading in the Zone*) e Jared Tendler (*The Mental Game of Trading*).

---

# 🚀 Master Prompt para Iniciar o Projeto no Repositório

Copie e cole o prompt abaixo ao iniciar a sessão no seu projeto `tradingplan`:

````markdown
# MASTER PROMPT — Criação do Aplicativo Mobile "Trading Mindset & Discipline Companion"

Atue como Engenheiro de Software Sênior especializado em React Native, Expo SDK 57 (TypeScript) e Psicologia de Trading de Alta Performance.

O objetivo é criar um aplicativo mobile nativo Android/iOS (Offline-First) focado em **disciplina, reprogramação mental, áudios de afirmação e protocolos de execução para traders de futuros**.

O aplicativo deve complementar a plataforma de gestão de trading existente em `D:\projects\tradingplan\tradingplanpro`, funcionando como um coach móvel de mesa de operações que fica sempre ao lado das telas do trader.

---

## 🎨 Design System & Estética Visual
- **Tema:** Dark Mode de Mesa de Operações / Terminal Financeiro de Luxo.
- **Paleta de Cores:**
  - Fundo Primário: `Obsidian Deep` (`#0B0E14` / `#11151C`)
  - Cartões e Superfícies: `#1A1F2C` / `#22283A`
  - Acentos de Disciplina / Sucesso: `Emerald Green` (`#10B981` / `#059669`)
  - Acentos de Alerta / SOS: `Crimson Red / Amber` (`#EF4444` / `#F59E0B`)
  - Destaques & Tipografia: `Electric Cyan` (`#06B6D4`) e `Pure White / Silver` (`#F8FAFC` / `#94A3B8`)
- **Sensação:** Foco cirúrgico, sem poluição visual, tipografia moderna e feedback tátil (*Haptics*) em todas as interações.

---

## 🏗️ Arquitetura Técnica & Dependências Principais
- **Framework:** React Native + Expo SDK 57 + TypeScript + React Navigation (Bottom Tabs).
- **Áudio Nativo:** `expo-audio` com suporte a reprodução em segundo plano (*background playback*), tela bloqueada e mini player flutuante permanente acima da barra de navegação.
- **Persistência Local:** `expo-sqlite` (ou `@react-native-async-storage/async-storage`) para guardar checklists diários, histórico de disciplina e notas rápidas 100% offline.
- **Háptica:** `expo-haptics` para resposta de toque sólida ao confirmar itens do checklist ou acionar o SOS Tilt.

---

## 📱 Módulos e Telas Necessárias

### 1. Tab 1: Protocolo de Operações (Checklists Diários)
- **Checklist Pré-Mercado:** Verificação de estado emocional, calendário de notícias, definição do loss diário máximo aceito, meta do dia e leitura das regras.
- **Checklist Durante o Trade (Sniper Entry):** Validação de 3 etapas antes de entrar (Contexto gráfico OK? Stop técnico definido? Risco/Retorno compensa?).
- **Checklist Pós-Mercado:** Autoavaliação de disciplina (0% a 100%), registro de se houve violação de plano e nota mental rápida.

### 2. Tab 2: Santuário de Áudios & Afirmações
- Catálogo categorizado:
  1. *Preparação Matinal & Blindagem Mental* (afirmações de paciência, aceitação de risco e execução sem hesitação);
  2. *Sons de Concentração / Frequências Foco* (Binaural beats / LoFi calmo para tocar durante o pregão);
  3. *Recuperação Pós-Loss* (reprogramação para aceitar a perda como custo operacional e não vingar o mercado);
  4. *Descompressão Pós-Mercado & Sono* (desligar o cérebro das cotações).
- Mini Player persistente e Modal de Player Completo com controle de velocidade (0.8x a 1.5x) e salto +/-15s.

### 3. Tab 3: Botão SOS Tilt (Intervenção Imediata)
- Botão proeminente de emergência para momentos de fúria, overtrading ou quebra de regra.
- Dispara uma condução de áudio e visual de 90 segundos com respiração guiada (4-7-8) forçando o trader a tirar as mãos do teclado e preservar o capital.

### 4. Tab 4: Leis de Risco & Mental Models
- Cards interativos com as regras invioláveis de gerenciamento de capital (ex: Mark Douglas, Jared Tendler, Tom Hougaard).
- Espaço para o trader cadastrar suas próprias 3 Leis de Ouro que nunca podem ser quebradas.

---

## ⚙️ Diretrizes de Engenharia
1. Crie o projeto no padrão modular limpo (`src/screens`, `src/components`, `src/audio`, `src/database`, `src/theme`).
2. Garanta que o player de áudio não sobreponha faixas e tenha controles de safe area corretos no Android.
3. Mantenha o código 100% tipado com TypeScript e compilável sem erros (`npx tsc --noEmit`).
````