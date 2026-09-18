# 🧠 Implementation Plan: *Trading Mindset & Discipline Companion* Mobile App

Construção do aplicativo mobile nativo (Android/iOS/Web) **Trading Mindset & Discipline Companion**, focado em psicologia de trading, disciplina operacional, protocolos de checklist diários, santuário de áudios/frequências com mini player persistente e botão de emergência SOS Tilt para controle de risco.

---

## 🎨 Design System & Estética Visual
- **Tema:** Dark Mode de Mesa de Operações / Terminal Financeiro de Alta Performance.
- **Paleta de Cores:**
  - Background Primário: `Obsidian Deep` (`#0B0E14` / `#11151C`)
  - Cartões & Superfícies: `#161B26` / `#1E2538` com bordas sutis em `#2A324B`
  - Acentos de Disciplina / Sucesso: `Emerald Green` (`#10B981` / `#059669`)
  - Acentos de Alerta / SOS: `Crimson Red` (`#EF4444`) e `Amber Gold` (`#F59E0B`)
  - Destaques & Acentos Tecnológicos: `Electric Cyan` (`#06B6D4`) e `Pure White / Silver` (`#F8FAFC` / `#94A3B8`)
- **Feedback Tátil & Visual:** Haptics ao preencher etapas, micro-animações de progresso e respiração guiada 4-7-8 pulsante.

---

## 🏗️ Arquitetura Técnica & Dependências

- **Core:** React Native + Expo (TypeScript) + `@react-navigation/native` + `@react-navigation/bottom-tabs`
- **Áudio & Som:** `expo-av` / Web Audio API com gerenciador de áudio unificado para reprodução contínua, faixas locais (`audios/Identidade`, `audios/Insights`, `audios/Meditations`, `audios/Trading-in-the-Zone`), frequências binaurais (Alfa 10Hz, Teta 6Hz, Lo-Fi) e Mini Player flutuante global
- **Persistência Offline:** `@react-native-async-storage/async-storage` para persistir checklists, streaks, diário de bordo e regras personalizadas 100% offline
- **Ícones & UI:** `lucide-react-native` / `@expo/vector-icons` + `react-native-safe-area-context` + `react-native-reanimated`

---

## 📱 Estrutura de Telas e Módulos

```
tradingmindset/
├── assets/                       # Ícones, splash, fontes e mídias estáticas
├── audios/                       # Arquivos de áudio existentes (Identidade, Insights, Meditações, Trading in the Zone)
├── src/
│   ├── components/               # Componentes reutilizáveis
│   │   ├── Header.tsx            # Header com Score do dia, Streak e status do mercado
│   │   ├── MiniPlayer.tsx        # Mini player flutuante persistente acima das tabs
│   │   ├── AudioModal.tsx        # Player de áudio expandido (scrubber, 0.8x-1.5x, +/-15s, sleep timer)
│   │   ├── BreathingCircle.tsx   # Orbe animado de respiração 4-7-8 com feedback visual
│   │   ├── DisciplineCard.tsx    # Card de progresso e score
│   │   └── Card.tsx              # Componente base de container glassmorphic
│   ├── screens/                  # Telas das 4 tabs principais
│   │   ├── ProtocolScreen.tsx    # Tab 1: Checklists Pré, Sniper Entry e Pós-Mercado + Score
│   │   ├── AudioScreen.tsx       # Tab 2: Santuário de Áudios & Binaurais (Organizado em categorias)
│   │   ├── SOSTiltScreen.tsx     # Tab 3: Botão de Emergência & Protocolo 90s Reset
│   │   └── RulesScreen.tsx       # Tab 4: Leis de Mark Douglas, Jared Tendler e Minhas 3 Leis de Ouro
│   ├── audio/                    # Motor de áudio (AudioContext, playlist, binaural generator)
│   │   ├── AudioContext.tsx      # Provedor global de estado de áudio e player
│   │   └── audioCatalog.ts       # Mapeamento do acervo de faixas e binaurais
│   ├── storage/                  # Gerenciador de armazenamento local
│   │   ├── storageKeys.ts        # Chaves de armazenamento
│   │   └── disciplineStore.ts    # CRUD para checklist, score, streak e regras
│   ├── theme/                    # Tokens de design, cores, tipografia e espaçamentos
│   │   └── index.ts
│   ├── types/                    # Tipagens TypeScript completas
│   │   └── index.ts
│   └── navigation/               # Configuração das Bottom Tabs e navegação
│       └── RootNavigator.tsx
├── App.tsx                       # Ponto de entrada com Providers
├── app.json                      # Configuração Expo
└── package.json
```

---

## 📋 Detalhamento dos Módulos

### 1. Tab 1: Protocolo de Operações & Score Diário (`ProtocolScreen.tsx`)
- **Pré-Mercado:**
  - Avaliação de humor/energia (1 a 5 estrelas);
  - Checagem de calendário econômico (horários de volatilidade);
  - Definição do Stop Máximo Diário (R$ / Pontos) e Meta;
  - Confirmação de compromisso de execução sem hesitação.
- **Validador de Entrada (Sniper Entry):**
  - Setup 100% confirmado no fechamento de candle?
  - Stop técnico estrutural posicionado e dentro do gerenciamento?
  - Relação Risco/Retorno mínima de 2:1?
  - Contador de operações do dia vs Limite estabelecido.
- **Pós-Mercado & Fechamento:**
  - Respeitou o limite de perda?
  - Parou no horário estipulado?
  - Cálculo automático de **Discipline Score (0-100%)** do dia.
  - Diário de bordo rápido / Nota mental persistida no histórico.

### 2. Tab 2: Santuário de Áudios & Frequências (`AudioScreen.tsx`)
- **Categorias:**
  - 🌅 *Preparação Matinal & Blindagem Mental* (A Mente do Trader Disciplinado, Executor de Probabilidades, O Stop não é o problema);
  - 🎧 *Frequências Foco & Binaural Beats* (Ondas Alfa 10Hz, Ondas Teta 6Hz, Flow State Lo-Fi);
  - 🛡️ *Recuperação Pós-Loss & Anti-Vingança* (O Loss como Custo Operacional, Neurociência do Loss);
  - 🌙 *Descompressão & Sono Reparador* (Meditações Guiadas e Desligamento do Mercado);
  - 📚 *Audiolivro Especial Trading in the Zone (12 Capítulos de Mark Douglas)*.
- **Player & Controles:** Mini player flutuante persistente, Scrubber de tempo, Play/Pause, Skip +/-15s, Velocidade (0.8x a 1.5x) e Timer de desligamento.

### 3. Tab 3: Botão de Emergência SOS Tilt (`SOSTiltScreen.tsx`)
- Botão militar/financeiro de emergência em destaque vermelho/âmbar.
- Disparo com feedback tátil e áudio imediato.
- **Respiração Guiada 4-7-8** (Inspire 4s, Segure 7s, Expire 8s) com círculo expansivo animado.
- Mensagens de comando: *"Tire as mãos do mouse agora"*, *"O mercado estará aqui amanhã, proteja seu capital"*.
- Timer de contagem regressiva de 90 segundos com botão final de recuperação e registro de evento.

### 4. Tab 4: Leis Inegociáveis & Mental Models (`RulesScreen.tsx`)
- **As 5 Verdades Fundamentais** de Mark Douglas (*Trading in the Zone*).
- **O Mapa do Tilt** de Jared Tendler (*The Mental Game of Trading*).
- **Leis de Execução** de Tom Hougaard (*Best Loser Wins*).
- **Minhas 3 Leis de Ouro:** Gestor interativo para o trader salvar e editar suas 3 regras inquebráveis, com modo "Juramento Pré-Pregão".

---

## 🧪 Plano de Verificação

### Testes Automatizados & Checagem de Tipos
- Execução de `npx tsc --noEmit` para garantir 100% de integridade no TypeScript sem nenhum erro.
- Validação das rotas de áudio e arquivos existentes.

### Validação no Navegador e Mobile
- Inicialização do servidor Expo dev (`npm run web` / `npx expo start --web`).
- Teste de navegação entre as 4 tabs.
- Teste do ciclo completo de checklist (Pré, Sniper, Pós) e cálculo do score.
- Teste da reprodução de áudio, mini player flutuante e modal de áudio com controle de velocidade.
- Teste do SOS Tilt com animação de respiração 4-7-8 e contagem regressiva.
- Teste de persistência offline (recarregar página mantendo dados salvos).
