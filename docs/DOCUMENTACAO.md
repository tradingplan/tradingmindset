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

---

## 1. Visão Geral e Arquitetura do Aplicativo

O aplicativo foi desenvolvido em **React Native com Expo SDK 57** e **TypeScript**, projetado especificamente para atuar como o companheiro psicológico e operacional diário de traders de futuros, mini-índice, dólar e ações.

### 🛠️ Stack Tecnológica
- **Framework:** React Native 0.86 + Expo SDK 57
- **Linguagem:** TypeScript
- **Engine de Áudio:** `expo-audio` ~57.0.5 (Background playback, Lock screen controls)
- **Armazenamento Offline:** `expo-file-system` (Streaming sob demanda + Cache de download persistente)
- **Persistência de Dados:** `@react-native-async-storage/async-storage` (Salva checklists, score e histórico)
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

