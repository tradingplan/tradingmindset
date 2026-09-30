import AsyncStorage from '@react-native-async-storage/async-storage';
import { Carta, BiasStatus, Leitura } from './types';
import { CARTAS, buscarCartaPorId } from './cartas';

export const TAROT_STORAGE_KEYS = {
  ULTIMA_LEITURA: 'tarot:ultima-leitura',
  HISTORICO: 'tarot:historico',
  LEMBRETE_ATIVO: 'tarot:lembrete-ativo',
};

const MAX_HISTORICO = 90;

/**
 * Retorna a faixa de viés comportamental de acordo com a carga psicológica.
 * >= 80: CRITICAL_TILT
 * 60 a 79: UNSTABLE_OVERLOAD
 * 40 a 59: CAUTION_DRIFT
 * < 40: STABLE_FLOW
 */
export function biasStatus(load: number): BiasStatus {
  if (load >= 80) return 'CRITICAL_TILT';
  if (load >= 60) return 'UNSTABLE_OVERLOAD';
  if (load >= 40) return 'CAUTION_DRIFT';
  return 'STABLE_FLOW';
}

/**
 * Retorna o título legível e formatado em português para o status de viés.
 */
export function formatarBiasStatus(status: BiasStatus): string {
  switch (status) {
    case 'STABLE_FLOW':
      return 'FLUXO ESTÁVEL';
    case 'CAUTION_DRIFT':
      return 'DERIVA / ATENÇÃO';
    case 'UNSTABLE_OVERLOAD':
      return 'SOBRECARGA';
    case 'CRITICAL_TILT':
      return 'TILT CRÍTICO';
    default:
      return status;
  }
}

/**
 * Retorna a descrição amigável do status de viés.
 */
export function formatarDescricaoBias(status: BiasStatus): string {
  switch (status) {
    case 'STABLE_FLOW':
      return 'Zona de Fluxo Estável';
    case 'CAUTION_DRIFT':
      return 'Deriva / Atenção Redobrada';
    case 'UNSTABLE_OVERLOAD':
      return 'Sobrecarga Emocional Elevada';
    case 'CRITICAL_TILT':
      return 'Risco Crítico de Tilt Iminente';
    default:
      return '';
  }
}

/**
 * Retorna a data local atual formatada como "YYYY-MM-DD".
 * Usa o fuso do aparelho e evita problemas de UTC às 21h no Brasil.
 */
export function dataLocalHoje(dateObj: Date = new Date()): string {
  const ano = dateObj.getFullYear();
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dia = String(dateObj.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Sorteia uma carta aleatória e aplica variação de -8 a +8 no psych_load (clamp 0..100).
 * Permite injeção de data e gerador randômico para testes determinísticos.
 */
export function sortear(
  agora: Date = new Date(),
  random: () => number = Math.random
): { carta: Carta; psychLoad: number; status: BiasStatus } {
  if (CARTAS.length === 0) {
    throw new Error('Nenhuma carta encontrada no baralho de Tarot Trader.');
  }

  const index = Math.floor(random() * CARTAS.length);
  const carta = CARTAS[Math.min(index, CARTAS.length - 1)];

  // Variação de -8 a +8
  const delta = Math.round(random() * 16 - 8);
  const rawLoad = carta.psych_load + delta;
  const psychLoad = Math.max(0, Math.min(100, rawLoad));
  const status = biasStatus(psychLoad);

  return {
    carta,
    psychLoad,
    status,
  };
}

/**
 * Carrega a leitura de hoje se ela existir no AsyncStorage.
 */
export async function obterLeituraHoje(dataHoje?: string): Promise<Leitura | null> {
  const hoje = dataHoje || dataLocalHoje();
  try {
    const raw = await AsyncStorage.getItem(TAROT_STORAGE_KEYS.ULTIMA_LEITURA);
    if (!raw) return null;

    const leitura: Leitura = JSON.parse(raw);
    if (!leitura || leitura.data !== hoje || !leitura.cartaId) {
      return null;
    }

    return leitura;
  } catch (error) {
    if (__DEV__) {
      console.warn('[TarotService] Erro ao ler última leitura do AsyncStorage:', error);
    }
    return null;
  }
}

/**
 * Carrega o histórico de leituras (máximo 90 itens).
 */
export async function obterHistorico(): Promise<Leitura[]> {
  try {
    const raw = await AsyncStorage.getItem(TAROT_STORAGE_KEYS.HISTORICO);
    if (!raw) return [];
    const list: Leitura[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch (error) {
    if (__DEV__) {
      console.warn('[TarotService] Erro ao carregar histórico do Tarot:', error);
    }
    return [];
  }
}

/**
 * Puxa a carta do dia.
 * Se já existir leitura para hoje, retorna a mesma (garante 1 carta por dia).
 * Se não existir, sorteia uma nova carta, persiste a leitura e adiciona ao histórico.
 */
export async function puxarCarta(
  agora: Date = new Date(),
  random: () => number = Math.random
): Promise<{ leitura: Leitura; carta: Carta; isNova: boolean }> {
  const hoje = dataLocalHoje(agora);

  // 1. Verifica se já temos leitura válida para a data atual
  const existente = await obterLeituraHoje(hoje);
  if (existente) {
    const cartaExistente = buscarCartaPorId(existente.cartaId);
    if (cartaExistente) {
      return {
        leitura: existente,
        carta: cartaExistente,
        isNova: false,
      };
    }
  }

  // 2. Sorteia nova carta
  const { carta, psychLoad, status } = sortear(agora, random);

  const novaLeitura: Leitura = {
    data: hoje,
    cartaId: carta.id,
    psychLoad,
    biasStatus: status,
  };

  try {
    // 3. Salva leitura de hoje
    await AsyncStorage.setItem(
      TAROT_STORAGE_KEYS.ULTIMA_LEITURA,
      JSON.stringify(novaLeitura)
    );

    // 4. Atualiza histórico (mantém limite de 90)
    const historicoAtual = await obterHistorico();
    // Filtra para não duplicar mesma data
    const historicoFiltrado = historicoAtual.filter((item) => item.data !== hoje);
    const novoHistorico = [novaLeitura, ...historicoFiltrado].slice(0, MAX_HISTORICO);

    await AsyncStorage.setItem(
      TAROT_STORAGE_KEYS.HISTORICO,
      JSON.stringify(novoHistorico)
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('[TarotService] Erro ao salvar leitura de Tarot no AsyncStorage:', error);
    }
  }

  return {
    leitura: novaLeitura,
    carta,
    isNova: true,
  };
}

/**
 * Helper para testes: limpa o storage do Tarot.
 */
export async function limparTarotStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      TAROT_STORAGE_KEYS.ULTIMA_LEITURA,
      TAROT_STORAGE_KEYS.HISTORICO,
    ]);
  } catch (error) {
    if (__DEV__) {
      console.warn('[TarotService] Erro ao limpar storage do Tarot:', error);
    }
  }
}
