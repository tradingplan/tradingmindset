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
