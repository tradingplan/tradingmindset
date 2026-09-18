import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyProtocolState, GoldenRule, HistoryDayScore, SOSEvent } from '../types';
import { STORAGE_KEYS } from './storageKeys';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DEFAULT_PRE_MARKET: DailyProtocolState['preMarket'] = {
  sleepQuality: 4,
  emotionalState: 'Calmo',
  checkedNews: false,
  maxLossValue: 'R$ 300,00',
  targetProfitValue: 'R$ 600,00',
  maxTrades: 3,
  commitmentAffirmed: false,
};

export const DEFAULT_SNIPER: DailyProtocolState['sniperCheck'] = {
  candleClosed: false,
  technicalStopDefined: false,
  riskRewardFavorable: false,
  tradesExecutedToday: 0,
};

export const DEFAULT_POST_MARKET: DailyProtocolState['postMarket'] = {
  respectedMaxLoss: true,
  stoppedOnTimeOrTarget: true,
  hadImpulsiveTrades: false,
  mentalNote: '',
  disciplineScore: 100,
};

export const DEFAULT_GOLDEN_RULES: GoldenRule[] = [
  {
    id: 'rule-1',
    number: 1,
    title: 'Aceitação Total do Risco',
    rule: 'Antes de clicar, o risco financeiro já está aceito e precificado. Se o stop for acionado, é apenas o custo do negócio.',
    isCustom: false,
  },
  {
    id: 'rule-2',
    number: 2,
    title: 'Limite Inviolável de Perda Diária',
    rule: 'Atingiu o stop diário estabelecido? A plataforma é desligada imediatamente, sem exceção e sem vingança.',
    isCustom: false,
  },
  {
    id: 'rule-3',
    number: 3,
    title: 'Paciência de Franco-Atirador',
    rule: 'Não opero por tédio. Apenas executo quando o setup gráfico cumpre 100% dos parâmetros pré-definidos.',
    isCustom: false,
  },
];

export function calculateDisciplineScore(
  pre: DailyProtocolState['preMarket'],
  sniper: DailyProtocolState['sniperCheck'],
  post: DailyProtocolState['postMarket']
): number {
  let score = 0;

  // Pré-Mercado (30 pontos)
  if (pre.checkedNews) score += 10;
  if (pre.commitmentAffirmed) score += 10;
  if (pre.maxLossValue.trim().length > 0) score += 10;

  // Sniper Entry (30 pontos)
  if (sniper.candleClosed) score += 10;
  if (sniper.technicalStopDefined) score += 10;
  if (sniper.riskRewardFavorable) score += 10;

  // Pós-Mercado (40 pontos)
  if (post.respectedMaxLoss) score += 20;
  if (post.stoppedOnTimeOrTarget) score += 10;
  if (!post.hadImpulsiveTrades) score += 10;

  return Math.min(100, Math.max(0, score));
}

export async function loadTodayProtocol(): Promise<DailyProtocolState> {
  const today = getTodayDateString();
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.DAILY_PROTOCOL_PREFIX}${today}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading protocol:', err);
  }

  return {
    date: today,
    preMarket: { ...DEFAULT_PRE_MARKET },
    sniperCheck: { ...DEFAULT_SNIPER },
    postMarket: { ...DEFAULT_POST_MARKET },
  };
}

export async function saveProtocol(protocol: DailyProtocolState): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.DAILY_PROTOCOL_PREFIX}${protocol.date}`;
    await AsyncStorage.setItem(key, JSON.stringify(protocol));

    // Update history day entry
    const rawHist = await AsyncStorage.getItem(STORAGE_KEYS.DISCIPLINE_HISTORY);
    let history: HistoryDayScore[] = rawHist ? JSON.parse(rawHist) : [];
    
    const existingIndex = history.findIndex((h) => h.date === protocol.date);
    const dayScore: HistoryDayScore = {
      date: protocol.date,
      score: protocol.postMarket.disciplineScore,
      respectedLoss: protocol.postMarket.respectedMaxLoss,
      violationsCount: (protocol.postMarket.hadImpulsiveTrades ? 1 : 0) + (protocol.postMarket.respectedMaxLoss ? 0 : 1),
      tradesCount: protocol.sniperCheck.tradesExecutedToday,
      notes: protocol.postMarket.mentalNote,
    };

    if (existingIndex >= 0) {
      history[existingIndex] = dayScore;
    } else {
      history.push(dayScore);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.DISCIPLINE_HISTORY, JSON.stringify(history));
    await updateStreak(history);
  } catch (err) {
    console.error('Error saving protocol:', err);
  }
}

async function updateStreak(history: HistoryDayScore[]): Promise<number> {
  let streak = 0;
  // Sort descending by date
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
  for (const day of sorted) {
    if (day.score >= 70 && day.respectedLoss) {
      streak += 1;
    } else {
      break;
    }
  }
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, String(streak));
  return streak;
}

export async function getStreakCount(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STREAK);
    return val ? parseInt(val, 10) : 3; // Default starting streak for motivation
  } catch {
    return 3;
  }
}

export async function getDisciplineHistory(): Promise<HistoryDayScore[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DISCIPLINE_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading history:', err);
  }

  // Initial demo history for rich initial experience
  const today = new Date();
  const sampleHistory: HistoryDayScore[] = [];
  for (let i = 6; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    sampleHistory.push({
      date: dStr,
      score: 80 + Math.floor(Math.random() * 20),
      respectedLoss: true,
      violationsCount: 0,
      tradesCount: 2 + (i % 3),
      notes: 'Sessão executada com disciplina cirúrgica.',
    });
  }
  return sampleHistory;
}

export async function loadGoldenRules(): Promise<GoldenRule[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.GOLDEN_RULES);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading rules:', err);
  }
  return DEFAULT_GOLDEN_RULES;
}

export async function saveGoldenRules(rules: GoldenRule[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GOLDEN_RULES, JSON.stringify(rules));
  } catch (err) {
    console.error('Error saving rules:', err);
  }
}

export async function recordSOSEvent(event: SOSEvent): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SOS_EVENTS);
    const list: SOSEvent[] = raw ? JSON.parse(raw) : [];
    list.unshift(event);
    await AsyncStorage.setItem(STORAGE_KEYS.SOS_EVENTS, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving SOS event:', err);
  }
}
