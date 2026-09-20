import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { TradingAlarm, MacroNewsPreset } from '../types';

export const DEFAULT_MACRO_NEWS_PRESETS: MacroNewsPreset[] = [
  {
    id: 'payroll_usd',
    name: 'Payroll (EUA)',
    defaultTime: '09:30',
    impact: 'critical',
    currency: 'USD',
    description: 'Relatório oficial de empregos não-agrícolas dos EUA. Volatilidade extrema no dólar e índices.',
    suggestedLeadTime: 15,
  },
  {
    id: 'cpi_usd',
    name: 'CPI / Inflação EUA',
    defaultTime: '09:30',
    impact: 'critical',
    currency: 'USD',
    description: 'Índice de Preços ao Consumidor dos EUA. Impacto imediato em juros futuros e câmbio.',
    suggestedLeadTime: 15,
  },
  {
    id: 'fomc_rate',
    name: 'Decisão FOMC (Fed)',
    defaultTime: '15:00',
    impact: 'critical',
    currency: 'USD',
    description: 'Decisão da taxa de juros dos EUA + Coletiva de imprensa do presidente do Federal Reserve.',
    suggestedLeadTime: 15,
  },
  {
    id: 'powell_speech',
    name: 'Discurso Jerome Powell',
    defaultTime: '11:00',
    impact: 'high',
    currency: 'USD',
    description: 'Discurso público ou depoimento no Congresso do presidente do Fed.',
    suggestedLeadTime: 10,
  },
  {
    id: 'copom_selic',
    name: 'Decisão Copom (Selic)',
    defaultTime: '18:30',
    impact: 'high',
    currency: 'BRL',
    description: 'Divulgação da taxa básica de juros Selic pelo Banco Central do Brasil.',
    suggestedLeadTime: 15,
  },
  {
    id: 'ipca_brl',
    name: 'IPCA / Inflação Brasil',
    defaultTime: '09:00',
    impact: 'high',
    currency: 'BRL',
    description: 'Inflação oficial brasileira medida pelo IBGE. Impacto direto na curva de juros DI e Ibovespa.',
    suggestedLeadTime: 10,
  },
];

export const DEFAULT_ALARMS: TradingAlarm[] = [
  {
    id: 'alarm_pre_market',
    title: 'Checklist Pré-Mercado & Foco',
    subtitle: 'Preencha suas metas e ancore o foco antes da abertura',
    time: '08:30',
    enabled: true,
    days: [1, 2, 3, 4, 5], // Seg a Sex
    category: 'checklist_pre',
    sound: 'bell',
    actionTarget: 'protocol_pre',
  },
  {
    id: 'alarm_b3_open',
    title: 'Abertura Futuros B3 (WIN / WDO)',
    subtitle: 'Mini-Índice e Dólar abertos. Paciência até o candle confirmar',
    time: '08:55',
    enabled: true,
    days: [1, 2, 3, 4, 5],
    category: 'market_bell',
    sound: 'bell',
    actionTarget: 'none',
  },
  {
    id: 'alarm_ny_open',
    title: 'Abertura Wall Street (NYSE / Nasdaq)',
    subtitle: 'Entrada de fluxo estrangeiro e aumento súbito de volatilidade',
    time: '10:25',
    enabled: true,
    days: [1, 2, 3, 4, 5],
    category: 'market_bell',
    sound: 'warning',
    actionTarget: 'none',
  },
  {
    id: 'alarm_pause_lunch',
    title: 'Pausa Tática & Respiração',
    subtitle: 'Horário de almoço e redução de volume. Levante-se e beba água',
    time: '12:30',
    enabled: false,
    days: [1, 2, 3, 4, 5],
    category: 'pause_focus',
    sound: 'calm',
    actionTarget: 'audioteca',
  },
  {
    id: 'alarm_post_market',
    title: 'Checklist Pós-Mercado & Diário',
    subtitle: 'Pregão encerrado. Registre o cumprimento do plano e feche as telas',
    time: '17:30',
    enabled: true,
    days: [1, 2, 3, 4, 5],
    category: 'checklist_post',
    sound: 'chime',
    actionTarget: 'protocol_post',
  },
];

export const loadAlarms = async (): Promise<TradingAlarm[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS_LIST);
    if (!raw) {
      await saveAlarms(DEFAULT_ALARMS);
      return DEFAULT_ALARMS;
    }
    const parsed: TradingAlarm[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Erro ao carregar alarmes:', err);
    return DEFAULT_ALARMS;
  }
};

export const saveAlarms = async (alarms: TradingAlarm[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ALARMS_LIST, JSON.stringify(alarms));
  } catch (err) {
    console.error('Erro ao salvar alarmes:', err);
  }
};

export const toggleAlarm = async (alarmId: string, enabled: boolean): Promise<TradingAlarm[]> => {
  const alarms = await loadAlarms();
  const updated = alarms.map((a) => (a.id === alarmId ? { ...a, enabled } : a));
  await saveAlarms(updated);
  return updated;
};

export const addOrUpdateAlarm = async (alarm: TradingAlarm): Promise<TradingAlarm[]> => {
  const alarms = await loadAlarms();
  const index = alarms.findIndex((a) => a.id === alarm.id);
  let updated: TradingAlarm[];

  if (index >= 0) {
    updated = [...alarms];
    updated[index] = alarm;
  } else {
    updated = [alarm, ...alarms];
  }

  await saveAlarms(updated);
  return updated;
};

export const deleteAlarm = async (alarmId: string): Promise<TradingAlarm[]> => {
  const alarms = await loadAlarms();
  const updated = alarms.filter((a) => a.id !== alarmId);
  await saveAlarms(updated);
  return updated;
};

export const resetToDefaultAlarms = async (): Promise<TradingAlarm[]> => {
  await saveAlarms(DEFAULT_ALARMS);
  return DEFAULT_ALARMS;
};
