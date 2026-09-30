# 📘 Guia Completo de Desenvolvimento, Distribuição e Manutenção
## Trading Mindset & Discipline Companion

Este documento é o guia definitivo de arquitetura, desenvolvimento, gerenciamento de ativos, testes locais, geração de pacotes (.apk) e publicação na Google Play Store para o aplicativo **Trading Mindset & Discipline Companion**.

---

## 📑 Sumário
1. [Visão Geral e Arquitetura do Aplicativo](#1-visão-geral-e-arquitetura-do-aplicativo)
2. [Estrutura dos Módulos do Sistema](#2-estrutura-dos-módulos-do-sistema)
3. [Hospedagem e Gestão de Áudios no GitHub Releases](#3-hospedagem-e-gestão-de-áudios-no-github-releases)
4. [Como Adicionar, Editar e Remover Áudios do Catálogo](#4-como-adicionar-editar-e-remover-áudios-do-catálogo)
5. [Ambiente de Desenvolvimento e Testes no Expo Go](#5-ambiente-de-desenvolvimento-e-testes-no-expo-go)
6. [Geração do APK Standalone para Teste no Celular](#6-geração-do-apk-standalone-para-teste-no-celular)
7. [Publicação Oficial na Google Play Store (Produção)](#7-publicação-oficial-na-google-play-store-produção)
8. [Boas Práticas e Resolução de Problemas (Troubleshooting)](#8-boas-práticas-e-resolução-de-problemas-troubleshooting)
9. [Como Adicionar Novos Documentos, Protocolos e Formatos Recomendados](#9-como-adicionar-novos-documentos-protocolos-e-formatos-recomendados)
10. [Sistema de Alarmes, Lembretes e Gestão de Notificações Locais](#10-sistema-de-alarmes-lembretes-e-gestão-de-notificações-locais)
11. [Módulo Tarot Trader (Reflexão Psicológica & Arquétipos Comportamentais)](#11-módulo-tarot-trader-reflexão-psicológica--arquétipos-comportamentais)
12. [Arquitetura de Proteção e Monetização: Opção A (Venda Externa Hotmart/Kiwify + Login Supabase)](#12-arquitetura-de-proteção-e-monetização-opção-a-venda-externa-hotmartkiwify--login-supabase)
13. [Guia Prático de Teste dos Níveis de Acesso (Anônimo, PRO e Superadmin)](#13-guia-prático-de-teste-dos-níveis-de-acesso-anônimo-pro-e-superadmin)

---

## 1. Visão Geral e Arquitetura do Aplicativo

O aplicativo foi desenvolvido em **React Native com Expo SDK 57** e **TypeScript**, projetado especificamente para atuar como o companheiro psicológico e operacional diário de traders de futuros, mini-índice, dólar e ações.

### 🛠️ Stack Tecnológica
- **Framework:** React Native 0.86 + Expo SDK 57 (Architecture New Architecture ready)
- **Linguagem:** TypeScript
- **Backend & Autenticação:** Supabase (PostgreSQL, Row Level Security, Real-time Sync)
- **Engine de Áudio:** `expo-audio` ~57.0.5 (Background playback, Lock screen controls)
- **Armazenamento Offline:** `expo-file-system` (Streaming sob demanda + Cache de download persistente)
- **Persistência de Dados & Cache de Planos:** `@react-native-async-storage/async-storage` (Salva checklists, score, histórico do tarot e plano de acesso offline)
- **Gestão de Acesso & Paywall:** React Context API (`TierContext`) + `tierService.ts`
- **Ícones:** `lucide-react-native`
- **Design System:** Dark Mode Fintech/Cyberpunk de alto contraste:
  - Fundo Primário: `#0B0E14`
  - Fundo de Cartões: `#141824`
  - Acento Cyan (Foco/Hiperfoco): `#06B6D4`
  - Acento Esmeralda (Ganhos/Disciplina): `#10B981`
  - Acento Âmbar (Atenção/Estudo): `#F59E0B`
  - Acento Crimson (Stop/Anti-Tilt): `#EF4444`

---

## 2. Estrutura dos Módulos do Sistema

### 1. Protocolo Operacional Diário (`ProtocolScreen.tsx`)
- **Pré-Market:** Checagem de sono (1 a 5 estrelas), estado emocional, validação de notícias econômicas no calendário (ex: Payroll, CPI), limite financeiro de perda máxima, meta de lucro e confirmação do termo de compromisso.
- **Sniper Entry Check:** Checklist rápido antes de cada clique: confirmação de fechamento do candle no tempo gráfico, stop técnico posicionado e relação risco/retorno favorável mínima de 2:1.
- **Pós-Market:** Avaliação do cumprimento do plano de trade, cálculo automatizado do Score de Disciplina (0 a 100%) e bloqueio do dia para evitar operações após o encerramento do pregão.

### 2. Audioteca de Alta Performance (`AudioScreen.tsx` + `AudioContext.tsx`)
- **Streaming & Cache Offline:** Reproduz faixas via nuvem ou baixa diretamente para a memória local do celular para tocar em modo avião.
- **Player Flutuante (MiniPlayer) & Modal:** MiniPlayer inteligente integrado com `SafeAreaInsets` para evitar sobreposição da barra de navegação/gestos do Android.
- **Ajuste de Velocidade:** Reprodução em 0.8x, 1.0x, 1.25x, 1.5x e 2.0x.
- **Sleep Timer:** Desligamento programado automático em 15, 30, 45 ou 60 minutos.
- **Sintetizador Binaural Web/Audio nativo:** Gera frequências em tempo real (Alfa 10Hz, Teta 6Hz, Gama 40Hz) sem necessidade de arquivos externos.

### 3. S.O.S Anti-Tilt & Trava de Emergência (`SOSTiltScreen.tsx`)
- Intervenção imediata ao sofrer um stop loss doloroso ou sentir perda de controle emocional.
- **Respiração Guiada 4-7-8:** Animação com contagem de tempo (Inspire 4s $\rightarrow$ Segure 7s $\rightarrow$ Expire 8s).
- **Timer de Resfriamento Obrigatório:** Contagem regressiva para afastar o trader das telas antes de qualquer nova decisão.

### 4. Regras de Ouro (`RulesScreen.tsx`)
- Princípios inegociáveis de gestão de risco e consistência.
- Permite adicionar, marcar e gerenciar regras personalizadas pelo usuário.

---

## 3. Hospedagem e Gestão de Áudios no GitHub Releases

Para evitar que o aplicativo ficasse pesado (+300MB no instalador) ou que fosse necessário pagar por servidores em nuvem (como AWS S3), a arquitetura utiliza o **GitHub Releases** como CDN gratuita e ilimitada.

### Como Funciona a Conexão
1. O repositório no GitHub deve ser **PÚBLICO**.
2. Os arquivos MP3 são anexados como artefatos dentro de um **Release** (ex: tag `v1.0.0`).
3. O aplicativo monta as URLs diretas de download e streaming:
   `https://github.com/{OWNER}/{REPO}/releases/download/{TAG}/{FILENAME}`

### ⚙️ Arquivo de Configuração
O arquivo central de configuração é:
📁 `src/config/githubAudioConfig.ts`

```typescript
export const GITHUB_AUDIO_CONFIG = {
  owner: 'tradingplan',    // Seu usuário/organização no GitHub
  repo: 'tradingmindset',  // Nome do repositório
  tag: 'v1.0.0',          // Tag do Release onde os MP3s estão hospedados

  getReleaseBaseUrl(): string {
    return `https://github.com/${this.owner}/${this.repo}/releases/download/${this.tag}`;
  },

  getTrackDownloadUrl(filename: string): string {
    const encoded = encodeURIComponent(filename);
    return `${this.getReleaseBaseUrl()}/${encoded}`;
  },
};
```

> ⚠️ **Regra Fundamental de Nomes de Arquivo no GitHub:**
> Quando você faz upload de um arquivo com espaços, acentos ou parênteses, o GitHub **automaticamente substitui espaços e caracteres especiais por pontos (`.`)** ou remove acentos.
> 
> *Exemplo:*
> - Nome original: `01. O Caminho para o Sucesso.mp3`
> - Nome no Release do GitHub: `01.O.Caminho.para.o.Sucesso.mp3`
> 
> Sempre verifique o nome final do arquivo na página do Release para colocar exatamente o mesmo no catálogo do app!

---

## 4. Como Adicionar, Editar e Remover Áudios do Catálogo

O arquivo central onde todo o acervo de áudio é registrado é:
📁 `src/audio/audioCatalog.ts`

### Estrutura de um Áudio no Catálogo
```typescript
{
  id: 'track-exemplo-1',              // ID único obrigatório
  title: 'Título da Faixa',           // Nome principal exibido no card e player
  subtitle: 'Subtítulo explicativo',  // Descrição curta da função do áudio
  author: 'Nome do Autor ou Voz',     // Autor / Narrador
  category: 'auto_hypnosis',          // Categoria (veja a lista abaixo)
  durationSeconds: 780,               // Duração exata em segundos
  formattedDuration: '13:00',         // Duração legível em texto
  sourceUri: 'Meu.Arquivo.No.Release.mp3', // Nome do arquivo no GitHub Release
  description: 'Explicação detalhada dos benefícios da faixa.',
}
```

### Categorias Disponíveis (`category`):
| Categoria no Código | Nome Exibido no App | Descrição |
| :--- | :--- | :--- |
| `'pre_market'` | Preparação Matinal & Blindagem | Afirmações e postura pré-pregão |
| `'binaural_focus'` | Frequências Foco & Binaural Beats | Ondas Alfa, Teta e Gama geradas pelo app |
| `'post_loss'` | Recuperação Pós-Loss & Anti-Tilt | Bloqueio do cérebro reativo e desarmamento de vingança |
| `'decompression'` | Descompressão & Sono Reparador | Meditações para desligar do mercado |
| `'trading_zone_book'` | Audiolivro Trading in the Zone | 12 capítulos da obra de Mark Douglas |
| `'auto_hypnosis'` | Auto-Hipnose & Reprogramação | Sessões de transe para reprogramação de crenças financeiras |
| `'emotional_consistency'` | Consistência Emocional | Esquemas emocionais, autoimagem e superação do luto no mercado (Thais) |

### Passo a Passo: Adicionando um Novo Áudio
1. Acesse o seu repositório no GitHub: `https://github.com/tradingplan/tradingmindset/releases`.
2. Edite o release `v1.0.0` e anexe o novo arquivo `.mp3`.
3. Anote o nome exato que o GitHub gerou para o arquivo.
4. Abra `src/audio/audioCatalog.ts` e insira o novo objeto no array `AUDIO_CATALOG`.
5. Salve o arquivo. O aplicativo no celular atualizará a lista imediatamente!

### Passo a Passo: Removendo um Áudio
1. Abra `src/audio/audioCatalog.ts`.
2. Encontre o bloco correspondente ao áudio e apague o objeto `{ ... }`.
3. Salve o arquivo.

---

## 5. Ambiente de Desenvolvimento e Testes no Expo Go

### Pré-requisitos
- **Node.js:** Versão 18 ou superior.
- **Git:** Instalado e configurado.
- **Celular Android/iOS:** Com o aplicativo **Expo Go** instalado (baixado da Play Store / App Store).

### Iniciando o Projeto Localmente
No terminal do projeto (`d:\projects\tradingplan\tradingmindset`), execute:

```bash
# 1. Instalar dependências respeitando a versão do Expo SDK 57
npm install --legacy-peer-deps

# 2. Iniciar o servidor de desenvolvimento Metro
npm start -c
```

### Conectando o Celular
1. Certifique-se de que o computador e o celular estão conectados na **mesma rede Wi-Fi**.
2. Abra o aplicativo **Expo Go** no celular.
3. No Android: Clique em **"Scan QR Code"** e aponte para o QR Code no terminal.
4. O aplicativo carregará o bundle JavaScript completo em segundos.

### Atalhos Úteis no Terminal do Metro
- Pressione **`r`** para recarregar o aplicativo no celular.
- Pressione **`d`** para abrir o menu do desenvolvedor no celular.
- Pressione **`c`** para limpar o cache do Metro bundler.

---

## 6. Geração do APK Standalone para Teste no Celular

Para instalar o aplicativo diretamente no celular como um arquivo `.apk` independente (sem depender do Expo Go ou de Wi-Fi):

### Configurações Realizadas
1. **`app.json`:**
   - Pacote Android configurado: `"package": "com.tradingplan.tradingmindset"`
   - Permissões de reprodução em segundo plano configuradas.
2. **`eas.json`:**
   - Perfil `preview` configurado com `"buildType": "apk"`.

### Comandos de Compilação do APK
Execute no PowerShell/Terminal:

```bash
# 1. Fazer login na conta do Expo (crie gratuitamente em https://expo.dev se não tiver)
npx eas-cli login

# 2. Disparar a criação do APK na nuvem da Expo
npx eas-cli build -p android --profile preview
```

### Instalação no Celular
1. Ao concluir o processo, o terminal exibirá um **link de download** e um **QR Code**.
2. Abra o link no navegador do celular ou escaneie o QR Code.
3. Baixe o arquivo `.apk` e clique em **Instalar** (permita "Instalar de fontes desconhecidas" no Android se solicitado).

---

## 7. Publicação Oficial na Google Play Store (Produção)

Para disponibilizar o aplicativo para o público geral na Play Store:

### 1. Pré-requisitos
- Conta de desenvolvedor no **Google Play Console** (taxa única de $25 cobrada pelo Google).
- Ficha do app preparada (Ícone 512x512, Banner 1024x500, Capturas de tela).

### 2. Geração do Android App Bundle (`.aab`)
O Google Play exige o formato `.aab` (e não `.apk`) para publicação em produção:

```bash
npx eas-cli build -p android --profile production
```

> 🔐 **Keystore de Assinatura:** O EAS Build criará e guardará a chave de assinatura criptográfica (Keystore) do aplicativo de forma segura e automática.

### 3. Envio para a Play Store
Você pode enviar o arquivo `.aab` gerado diretamente pela interface web do Google Play Console ou pelo comando automático:

```bash
npx eas-cli submit -p android
```

### 4. Etapas no Google Play Console
1. **Painel do App:** Crie um novo aplicativo com o nome **Trading Mindset & Discipline Companion**.
2. **Classificação de Conteúdo & Privacidade:** Preencha o questionário padrão (aplicativo de produtividade / finanças).
3. **Faixas de Teste:**
   - **Teste Fechado:** Envie para amigos ou para si mesmo para testar.
   - **Produção:** Envie para a revisão final do Google (geralmente aprovado em 2 a 5 dias úteis).

---

## 8. Boas Práticas e Resolução de Problemas (Troubleshooting)

### ❓ "Expo Audio status error: Source error"
- **Causa:** O aplicativo tentou tocar um arquivo cujo link retornou 404 (arquivo não existe ou o nome no Release está diferente) ou o repositório no GitHub está como *Privado*.
- **Solução:**
  1. Certifique-se de que o repositório `tradingplan/tradingmindset` está configurado como **Public** no GitHub.
  2. Verifique se o nome no campo `sourceUri` em `audioCatalog.ts` é idêntico ao nome do arquivo na página de Releases.

### ❓ Limpeza de Cache de Áudios Corrompidos
O aplicativo possui rotina automatizada (`cleanInvalidCachedFiles`) que detecta e remove arquivos com tamanho inferior a 50KB baixados com falha. Para forçar a limpeza manual em código:
```typescript
import { clearAllOfflineAudios } from './src/audio/offlineAudioStore';
await clearAllOfflineAudios();
```

### ❓ MiniPlayer cobrindo os botões de navegação do Android
O aplicativo utiliza `useSafeAreaInsets()` do `react-native-safe-area-context` para calcular dinamicamente a altura da barra inferior:
```typescript
const insets = useSafeAreaInsets();
const bottomBarHeight = 60 + Math.max(insets.bottom, 10);
// MiniPlayer posicionado em: bottom: bottomBarHeight + 6
```
Isso garante que em qualquer aparelho Android (com botões virtuais ou gestos), o player nunca sobreponha os botões do sistema operacional.

---

## 9. Como Adicionar Novos Documentos, Protocolos e Formatos Recomendados

No ecossistema React Native / Expo, diferentes tipos de conteúdo pedem formatos específicos para oferecer a melhor experiência ao usuário (velocidade, interatividade, layout responsivo e consumo de memória).

---

### 📊 Comparativo de Formatos: Qual Escolher?

| Formato | Ideal Para | Vantagens | Como é Renderizado |
| :--- | :--- | :--- | :--- |
| **JSON / TypeScript Estruturado (`.ts` / `.json`)** | **Checklists interativos, questionários, planos de trade** | ⚡ Interativo (permite salvar respostas, calcular scores, botões, filtros, persistência local via AsyncStorage). | Componentes nativos React Native (`<Card>`, `<TouchableOpacity>`, `<TextInput>`). |
| **Markdown (`.md`) / Texto Puro (`.txt`)** | **Manuais operacionais, transcrições de áudios, termos de conduta** | 📄 Leve, fácil de ler e manter, adaptação perfeita ao Dark Mode e tipografia do app. | Componente `<Text>` nativo ou leitor de Markdown estilizado. |
| **PDF (`.pdf`)** | **E-books diagramados, apostilas, relatórios de backtest** | 📚 Preserva a diagramação visual original e paginação exata do autor. | Aberto diretamente no visualizador do celular com `expo-sharing` ou `Linking.openURL`. |

---

### 🛠️ Cenário 1: Como Adicionar um Novo Protocolo Interativo (Checklist)

Se você quiser criar um novo protocolo interativo (ex: *"Checklist de Final de Semana / Revisão Semanal"* ou *"Plano de Recuperação de Drawdown"*):

#### 1. Defina a Estrutura em `src/types/index.ts`
```typescript
export interface WeeklyReviewProtocol {
  id: string;
  totalTrades: number;
  winRate: number;
  followedPlanPercentage: number;
  mainMistake: string;
  adjustmentForNextWeek: string;
}
```

#### 2. Crie o Card/Tela correspondente
Crie o componente em `src/components/` ou `src/screens/` usando a paleta de cores `Colors` e os componentes base do design system (`<Card>`, `<Text>`, etc.).

#### 3. Salve o Estado no AsyncStorage
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('@weekly_review', JSON.stringify(data));
```

---

### 🛠️ Cenário 2: Como Adicionar Textos de Apoio e Manuais Operacionais (`.txt` ou `.md`)

Para textos longos de leitura rápida no app (como o conteúdo de `protocolos/O STOP não é o problema.txt`):

1. Crie um arquivo em `src/data/protocolsData.ts`:
```typescript
export const PROTOCOLS_GUIDES = {
  stopMindset: {
    title: 'O STOP Não é o Problema',
    author: 'Trading Mindset',
    content: `O stop loss não representa um fracasso pessoal, mas o custo operacional...`,
  },
};
```
2. No componente/tela, renderize o texto dentro de um `<ScrollView>` com a tipografia do tema:
```tsx
<ScrollView style={{ padding: 16 }}>
  <Text style={{ color: Colors.cyan, fontSize: 18, fontWeight: 'bold' }}>
    {PROTOCOLS_GUIDES.stopMindset.title}
  </Text>
  <Text style={{ color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 12 }}>
    {PROTOCOLS_GUIDES.stopMindset.content}
  </Text>
</ScrollView>
```

---

### 🛠️ Cenário 3: Como Disponibilizar E-books e Apostilas em PDF (`.pdf`)

Para documentos ricos em PDF (como `Protocolo-de-Recondicionamento-de-21-Dias.pdf`):

#### Opção A: Hospedado no GitHub Release (Recomendado — Mantém o APK leve)
1. Anexe o arquivo `.pdf` no mesmo Release `v1.0.0` do GitHub.
2. No app, crie um botão de download/abertura:
```tsx
import { Linking } from 'react-native';
import { GITHUB_AUDIO_CONFIG } from '../config/githubAudioConfig';

const handleOpenPdf = () => {
  const pdfUrl = GITHUB_AUDIO_CONFIG.getTrackDownloadUrl('Protocolo-de-Recondicionamento-de-21-Dias.pdf');
  Linking.openURL(pdfUrl);
};
```

#### Opção B: Embutido no Aplicativo
Coloque o arquivo na pasta `assets/docs/` e abra usando `expo-sharing` ou biblioteca de visualização.

---

> 🚀 **Dica de Ouro:** Para tudo o que exige **ação e preenchimento diário** (ex: diário de trade, checagem pré-mercado), utilize **JSON/TypeScript**. Para materiais de **leitura e estudo profundo**, utilize **PDF hospedado no Release** ou **Markdown integrado no app**.

---

## 10. Sistema de Alarmes, Lembretes e Gestão de Notificações Locais

O aplicativo conta com uma infraestrutura completa de **Alarmes Programáveis, Alertas de Notícias Macroeconômicas e Timers de Mesa**, executados **100% de forma local no dispositivo** sem necessidade de conexão com a internet ou servidores externos.

### 🏛️ 1. Arquitetura do Sistema de Alarmes

O módulo de alarmes é dividido em 4 camadas bem definidas:

1. **Camada de Tipos (`src/types/index.ts`):**
   - `TradingAlarm`: Representa a rotina ou evento (id, horário `HH:mm`, dias da semana `[1..5]`, categoria, som, ação de destino e status ativo/inativo).
   - `MacroNewsPreset`: Presets rápidos de notícias (Payroll, CPI, FOMC, Copom Selic, etc.).
   - `NotificationActionTarget`: Destino de navegação (`protocol_pre`, `protocol_post`, `audioteca`, `sos_tilt`, `rules`, `none`).

2. **Camada de Persistência (`src/storage/alarmStore.ts`):**
   - Armazena a lista de alarmes no `@react-native-async-storage/async-storage` sob a chave `@tradingmindset:alarms_list`.
   - Disponibiliza as rotinas padrão recomendadas de fábrica:
     - `08:30` — Checklist Pré-Mercado & Foco
     - `08:55` — Abertura Mercado Futuro B3 (Dólar & Mini-Índice)
     - `10:25` — Abertura Wall Street (NYSE / Nasdaq)
     - `12:30` — Pausa Tática & Respiração (Horário de Almoço)
     - `17:30` — Checklist Pós-Mercado & Diário de Bordo

3. **Camada de Serviço Nativo (`src/services/alarmService.ts`):**
   - Integra com a biblioteca oficial `expo-notifications`.
   - **Canais Android (Notification Channels):**
     - `trading-alarms-high`: Canal de alta prioridade com som, vibração e banner na tela de bloqueio.
     - `trading-news-urgent`: Canal de alerta crítico para eventos de volatilidade.
     - `trading-timers-live`: Canal dedicado aos cronômetros de mesa (cool-down e pausas).
   - **Agendamento de Rotinas Recorrentes:** Utiliza `SchedulableTriggerInputTypes.CALENDAR` mapeando os dias da semana (Segunda a Sexta) e horário exato.
   - **Agendamento de Notícias (Alerta Duplo Inteligente):**
     - *Alerta 1 (Aviso Prévio):* Dispara 10 a 15 minutos antes do horário da notícia (ex: 09:15 para o Payroll das 09:30), instruindo o trader a proteger stops ou zerar contratos.
     - *Alerta 2 (Alerta Imediato):* Dispara no minuto exato (09:30) com aviso de alta volatilidade para evitar ordens a mercado impulsivas.
   - **Sincronização Automática:** O método `syncAllAlarmsWithSystem()` garante que qualquer alteração de estado (ligar/desligar alarme) seja imediatamente refletida no agendador nativo do sistema operacional.

4. **Camada de Interface (`src/components/alarms/AlarmsModal.tsx` & `src/components/Header.tsx`):**
   - **Ícone de Sino no Topo do App:** Exibe um badge com a contagem de alarmes ativos no dia. Ao clicar, abre o modal de gerenciamento.
   - **Aba "Rotinas Diárias":** Chaves liga/desliga instantâneas, visualização dos dias da semana e formulário para criar novos alarmes customizados com horário e ação vinculada.
   - **Aba "Notícias Macro":** Cards dos principais eventos econômicos com botão de ativação em 1 toque para o pregão de hoje.
   - **Aba "Timers Live (Mesa)":** Contador regressivo visual e sonoro para uso com o celular ao lado do monitor (Cool-down de 15 min pós-loss, pausa de 60 min anti-fadiga e respiração de 5 min).
   - **Botão de Teste Imediato (3s):** Permite ao trader disparar uma notificação instantânea para validar volume, banner e vibração no aparelho.

---

### 📲 2. Permissões e Configurações no `app.json`

Para garantir que o Android e o iOS permitam o disparo de notificações mesmo com o app minimizado ou aparelho bloqueado, o `app.json` inclui:

```json
"android": {
  "permissions": [
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.VIBRATE",
    "android.permission.RECEIVE_BOOT_COMPLETED",
    "android.permission.SCHEDULE_EXACT_ALARM"
  ]
},
"plugins": [
  "expo-audio",
  [
    "expo-notifications",
    {
      "icon": "./assets/icon.png",
      "color": "#06B6D4"
    }
  ]
]
```

---

### 🔗 3. Deep Linking (Navegação ao Clicar na Notificação)

Quando o trader toca em uma notificação emitida pelo aplicativo (ex: *"Checklist Pré-Mercado & Foco"*):
1. O listener `Notifications.addNotificationResponseReceivedListener` configurado em `src/navigation/RootNavigator.tsx` intercepta a interação.
2. Lê o payload `actionTarget` enviado na notificação.
3. Direciona o aplicativo diretamente para a tela ou aba correspondente (`Protocol`, `Audioteca`, `SOSTilt`, `Rules`).

---

### 🛠️ 4. Como Adicionar Novos Presets de Notícias Econômicas

Caso deseje adicionar novos eventos padrão à lista de 1 toque (ex: Vencimento de Opções, Taxa de Desemprego na Europa, etc.), basta editar o array `DEFAULT_MACRO_NEWS_PRESETS` em `src/storage/alarmStore.ts`:

```typescript
{
  id: 'options_expiry',
  name: 'Vencimento de Opções B3',
  defaultTime: '16:30',
  impact: 'high',
  currency: 'BRL',
  description: 'Exercício de opções sobre ações e índices. Forte distorção de fluxo e volatilidade no book.',
  suggestedLeadTime: 15,
}
```

---

## 11. Módulo Tarot Trader (Reflexão Psicológica & Arquétipos Comportamentais)

O módulo **Tarot Trader** foi projetado para atuar como uma âncora de reflexão diária e identificação precoce de armadilhas psicológicas e emocionais antes ou durante o pregão.

### 📁 Localização do Arquivo de Dados
Os dados e as 22 cartas de arquétipos comportamentais estão localizados em:
`src/data/tarot-trader-cartas.json`

O aplicativo importa este arquivo estático de forma desacoplada através do módulo `src/tarot/cartas.ts`. Nenhuma chamada de rede externa é realizada.

### 🃏 Estrutura do JSON e Formato dos Campos

Cada carta segue a seguinte estrutura de dados:

```json
{
  "numero": 1,
  "id": "vingador-do-mercado",
  "arquetipo": "O Vingador do Mercado",
  "emocao": "FÚRIA / RAIVA",
  "polaridade": "bear",
  "icone": "zap",
  "psych_load": 75,
  "vies": "Revenge trading",
  "sabedoria": "O mercado é impessoal e não deve nada a você. Tentar 'bater de frente' com a tendência para se vingar de um prejuízo anterior só trará perdas ainda maiores.",
  "sinais": [
    "Entrar logo após um stop, sem setup definido",
    "Aumentar o tamanho da posição para 'recuperar'"
  ],
  "antidoto": "Encerre a sessão ao atingir a perda máxima diária. Sem exceções.",
  "fonte": "clear"
}
```

* **`numero`** *(number)*: Índice sequencial da carta (1 a 22).
* **`id`** *(string)*: Identificador único em formato kebab-case (ex: `vingador-do-mercado`).
* **`arquetipo`** *(string)*: Nome editorial do arquétipo comportamental exibido em destaque.
* **`emocao`** *(string)*: Emoção ou estado predominante ligado ao padrão.
* **`polaridade`** *(string)*: `"bear"` (armadilha psicológica / viés destrutivo, cor `#E22A22`) ou `"bull"` (hábito disciplinado / comportamento consistente, cor `#1FA938`).
* **`icone`** *(string)*: Nome do ícone do pacote `lucide-react-native` em kebab-case (ex: `zap`, `ghost`, `shield-check`). Mapeado estaticamente em `src/tarot/icons.ts`.
* **`psych_load`** *(number)*: Carga psicológica base (0 a 100%).
* **`vies`** *(string)*: Classificação técnica do viés cognitivo associado.
* **`sabedoria`** *(string)*: Reflexão filosófica e prática inegociável.
* **`sinais`** *(array de strings)*: Lista de comportamentos observáveis para diagnóstico rápido.
* **`antidoto`** *(string)*: Ação corretiva prescritiva imediata.
* **`fonte`** *(string)*: Origem conceitual da literatura comportamental.

### 📊 Faixas de Status de Viés (`biasStatus`)

O sistema calcula o status operacional com base na carga psicológica final (`psychLoad`), que aplica uma variação sutil de $\pm 8\%$ sobre a carga base:

| Faixa de Psych Load | Status (`biasStatus`) | Classificação Operacional | Cor Visual |
| :--- | :--- | :--- | :--- |
| **< 40%** | `STABLE_FLOW` | Zona de Fluxo e Calma | Verde (`#1FA938`) |
| **40% a 59%** | `CAUTION_DRIFT` | Deriva / Atenção Redobrada | Vermelho (`#E22A22`) |
| **60% a 79%** | `UNSTABLE_OVERLOAD` | Sobrecarga Emocional Elevada | Vermelho (`#E22A22`) |
| **$\ge$ 80%** | `CRITICAL_TILT` | Risco Crítico de Tilt Iminente | Vermelho (`#E22A22`) |

### 🔒 Regra de Uma Carta por Dia & Persistência

1. **Fuso Horário Local:** A verificação utiliza a data local do dispositivo (`dataLocalHoje()`, formato `YYYY-MM-DD`), impedindo viradas indevidas às 21h que ocorreriam com `toISOString()`.
2. **Imutabilidade Diária:** Uma vez puxada a carta, a leitura é salva no AsyncStorage sob a chave `tarot:ultima-leitura`. Reabrir o app no mesmo dia carrega a carta já revelada sem permitir novos sorteios.
3. **Histórico de 90 Dias:** As últimas 90 leituras são preservadas em `tarot:historico` para acompanhamento de tendências comportamentais.
4. **Revalidação Automática:** Ao atravessar a meia-noite com o app aberto ou em background, o retorno para o primeiro plano (`AppState`) detecta a mudança de data e libera o sorteio do novo dia.

### ✍️ Como Adicionar ou Editar Cartas

1. Abra o arquivo `src/data/tarot-trader-cartas.json`.
2. Adicione ou edite o objeto dentro do array `"cartas"`.
3. Certifique-se de que o `numero` e o `id` sejam únicos, que o campo `polaridade` seja `"bear"` ou `"bull"`, e que o ícone exista no mapa estático de `src/tarot/icons.ts`.
4. Execute os testes automatizados para validar a integridade:
   ```bash
   npm run test:tarot
   ```

---

## 12. Arquitetura de Proteção e Monetização: Opção A (Venda Externa Hotmart/Kiwify + Login Supabase)

O **Trading Mindset** implementa uma arquitetura de acesso em 3 níveis (**Freemium Multiplataforma**) projetada para proteger o conteúdo intelectual proprietário, monetizar via plataformas externas (Hotmart / Kiwify / Eduzz / Stripe) e cumprir integralmente as diretrizes de publicação da **Google Play Store** (isenção de taxas de 15% a 30% do Google Play In-App Billing).

### 🛡️ Matriz de Recursos por Nível de Acesso

| Recurso / Módulo | Nível `free` (Convidado) | Nível `premium` (Trader PRO) | Nível `superadmin` |
| :--- | :---: | :---: | :---: |
| **Checklist Pré-Market** | Liberado (Básico) | Liberado Completo | Liberado Irrestrito |
| **SOS Tilt & Respiração 4-7-8** | Liberado | Liberado Completo | Liberado Irrestrito |
| **Tarot Trader (Carta do Dia)** | 1 Carta/dia + Sabedoria | 1 Carta/dia + Sabedoria | 1 Carta/dia + Sabedoria |
| **Histórico do Tarot Trader** | Últimos 3 dias | **90 Dias Completos** | 90 Dias Completos |
| **Áudios de Degustação (3 faixas)** | Liberado | Liberado | Liberado |
| **Catálogo de Áudios (+20 faixas)** | Bloqueado (`🔒 PRO`) | **100% Liberado** | 100% Liberado |
| **Download Offline (Modo Avião)** | Bloqueado (`🔒 PRO`) | **Liberado** | Liberado |
| **Backup & Sincronização em Nuvem** | Não disponível | **Tempo Real (Supabase)** | Tempo Real (Supabase) |
| **Badge Visual no Header** | `FREE` (Gera Paywall) | `PRO` (Verde Esmeralda) | `ADMIN` (Ouro) |
| **Reconhecimento Automático** | Convidado / Sem conta | Assinante Web | `tradingplan.br@gmail.com` |

---

### 🎵 Faixas de Degustação Liberadas no Plano Free (`FREE_TRACK_IDS`)
As 3 seguintes faixas foram selecionadas estrategicamente para ancorar o trader e gerar desejo de upgrade:
1. `track-pre-1`: **O STOP Não é o Problema (Versão com IA)** — 05:45 (Áudio narrado de alta clareza)
2. `track-pre-2`: **O STOP Não é o Problema (Versão Original)** — 05:45 (Áudio acústico clássico)
3. `binaural-alpha-10hz`: **Ondas Alfa (10 Hz) — Flow State Sniper** — 15:00 (Sintetizador binaural puro)

Todas as demais 17+ faixas (frequências Theta, Delta, auto-hipnose de ancoragem e audiolivro The Disciplined Trader) são protegidas pelo paywall nativo `PaywallModal`.

---

### 🗄️ Estrutura do Supabase para Liberação Automática (SQL)

Para gerenciar o plano dos usuários no Supabase, execute o seguinte script no **SQL Editor** do Supabase:

```sql
-- 1. Criação da tabela de perfis de usuário
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text default 'user' check (role in ('user', 'admin')),
  plan text default 'free' check (plan in ('free', 'premium', 'pro')),
  plan_expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitação de Segurança por Linha (RLS)
alter table public.profiles enable row level security;

create policy "Usuários podem ler seus próprios perfis"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seus próprios perfis"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Trigger para criar perfil automaticamente no primeiro login/cadastro
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, plan)
  values (
    new.id,
    new.email,
    case when lower(new.email) in ('tradingplan.br@gmail.com', 'admin@tradingplan.com.br') then 'admin' else 'user' end,
    case when lower(new.email) in ('tradingplan.br@gmail.com', 'admin@tradingplan.com.br') then 'premium' else 'free' end
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

### 🔗 Integração do Webhook (Kiwify / Hotmart / Eduzz)

Quando um cliente compra o acesso na **Kiwify** ou **Hotmart**:
1. A plataforma de vendas dispara um webhook POST com o evento `order.approved` contendo o `email` do comprador.
2. Seu backend (ou Supabase Edge Function) atualiza a tabela `profiles` do Supabase:
   ```sql
   update public.profiles
   set plan = 'premium',
       plan_expires_at = now() + interval '1 year'
   where lower(email) = lower('email_do_comprador@gmail.com');
   ```
3. O cliente baixa o app na Google Play Store, faz login com o mesmo e-mail e tem acesso **Trader PRO** liberado instantaneamente no celular e no computador.

---

### 📜 Conformidade com as Diretrizes da Google Play Store (Reader & Multiplatform App)

Para evitar a cobrança de 15% a 30% da taxa de In-App Billing do Google e garantir aprovação sem ressalvas:
1. **Modelo Reader / Multiplataforma:** O aplicativo é classificado como uma extensão multiplataforma de um serviço web pré-existente (`tradingplan.com.br`).
2. **Sem Botões Diretos de Checkout:** O modal de Paywall exibe apenas os benefícios do plano PRO e o botão **"JÁ SOU ASSINANTE — FAZER LOGIN"**, sem botões diretos de compra com link externo embutido na ficha do Google.
3. **Persistência Offline:** O plano é armazenado em cache (`@tradingmindset:user_tier`), garantindo que usuários pagantes mantenham acesso às músicas e histórico mesmo sem internet (no modo avião).

---

## 13. Guia Prático de Teste dos Níveis de Acesso (Anônimo, PRO e Superadmin)

Para alternar de plano e testar as proteções diretamente no celular ou no navegador:

### 🧪 Como Alternar para o Modo Anônimo / Free (Logout)
Existem 3 formas rápidas no app:
1. **Pelo Badge do Header:** Toque no badge de plano (`ADMIN` ou `PRO`) no canto superior direito da barra de métricas e selecione **"Desconectar (Modo Anônimo)"**.
2. **Pelo Ícone da Nuvem:** Toque no ícone de nuvem (`☁️`) no canto superior direito e clique em **"Desconectar desta Conta"**.
3. **Pela Aba Leis & Regras:** Na aba **Leis & Regras**, role até a seção **"Sessão & Nível de Acesso"** e toque em **"Desconectar (Modo Anônimo)"**.

### 🔍 O que Validar no Modo Anônimo / Convidado:
* **Audioteca:**
  * As 3 faixas de degustação tocam normalmente.
  * As outras 17+ faixas exibem o selo dourado `🔒 PRO` e abrem o `PaywallModal` ao serem clicadas.
  * O botão de download offline abre o `PaywallModal`.
  * Um banner promocional do Plano PRO é exibido no topo do catálogo.
* **Tarot Trader:**
  * O sorteio da carta do dia, antídoto e sabedoria funcionam livremente.
  * O histórico exibe os últimos 3 dias e um card para desbloqueio dos 90 dias completos com o plano PRO.
* **Header:**
  * O badge exibe `FREE` em ciano. Ao clicar nele, exibe as opções de upgrade ou login.

### 👑 Como Retornar para o Modo Superadmin:
1. Toque no badge `FREE` ou no ícone da nuvem (`☁️`).
2. Digite seu e-mail de superadmin (`tradingplan.br@gmail.com`) e sua senha.
3. O app reconhecerá automaticamente o e-mail, exibirá o badge dourado `ADMIN` no header e desbloqueará 100% dos áudios, downloads e histórico sem qualquer restrição.




