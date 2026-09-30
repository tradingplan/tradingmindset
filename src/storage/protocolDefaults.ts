import { DailyProtocolState, GoldenRule } from '../types';

export function getTodayDateString(dateObj: Date = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
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
  {
    id: 'rule-4',
    number: 4,
    title: 'Seguir o Plano à Risca',
    rule: 'O trader de alta performance executa o que foi planejado a frio, ignorando a euforia e o medo do calor do mercado.',
    isCustom: false,
  },
];
