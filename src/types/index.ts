export type RootTabParamList = {
  Protocol: undefined;
  Audioteca: undefined;
  SOSTilt: undefined;
  Rules: undefined;
};

export interface PreMarketChecklist {
  sleepQuality: number; // 1 to 5
  emotionalState: 'Calmo' | 'Focado' | 'Ansioso' | 'Cansado' | 'Eufórico';
  checkedNews: boolean;
  maxLossValue: string; // e.g. "R$ 300" or "10 pts"
  targetProfitValue: string; // e.g. "R$ 600"
  maxTrades: number; // e.g. 3
  commitmentAffirmed: boolean;
}

export interface SniperEntryChecklist {
  candleClosed: boolean;
  technicalStopDefined: boolean;
  riskRewardFavorable: boolean; // min 2:1
  tradesExecutedToday: number;
}

export interface PostMarketChecklist {
  respectedMaxLoss: boolean;
  stoppedOnTimeOrTarget: boolean;
  hadImpulsiveTrades: boolean;
  mentalNote: string;
  disciplineScore: number; // 0 to 100
}

export interface DailyProtocolState {
  date: string; // YYYY-MM-DD
  preMarket: PreMarketChecklist;
  sniperCheck: SniperEntryChecklist;
  postMarket: PostMarketChecklist;
  completedAt?: string;
  isLocked?: boolean;
}

export interface HistoryDayScore {
  date: string;
  score: number;
  respectedLoss: boolean;
  violationsCount: number;
  tradesCount: number;
  notes?: string;
}

export type AudioCategory = 
  | 'pre_market'
  | 'binaural_focus'
  | 'post_loss'
  | 'decompression'
  | 'trading_zone_book'
  | 'auto_hypnosis'
  | 'emotional_consistency';

export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: AudioCategory;
  durationSeconds: number;
  formattedDuration: string;
  sourceUri: string; // local require or remote / web audio generator uri
  isLocalAsset?: boolean;
  isBinauralGen?: boolean;
  binauralFreq?: number; // e.g. 10 for Alpha, 6 for Theta
  coverImage?: string;
  description: string;
}

export interface GoldenRule {
  id: string;
  number: number;
  title: string;
  rule: string;
  isCustom?: boolean;
}

export interface SOSEvent {
  id: string;
  timestamp: string;
  completedBreathing: boolean;
  durationSeconds: number;
  reason?: string;
}

export type ProtocolSubTab = 'pre' | 'sniper' | 'post' | 'diretrizes' | 'gold' | 'history';

export interface QuantLevel {
  id: string;
  name: string;
  badge: string;
  whatIs: string;
  role: string;
  color: string;
}

export interface GEXRegime {
  id: 'long_gamma' | 'short_gamma';
  title: string;
  badge: string;
  formula: string;
  mechanics: string;
  priceBehavior: string;
  howToBuy: string;
  howToSell: string;
  invalidation: string;
  color: string;
}

export interface AssetDirective {
  id: 'gold' | 'hk50' | 'sp500';
  name: string;
  symbol: string;
  flag: string;
  whatToLook: string[];
  whenToBuy: string[];
  whenToSell: string[];
}

export interface GoldManualChapter {
  id: string;
  partId: string;
  chapterNumber: number;
  title: string;
  summary: string;
  keyTakeaways: string[];
  contentSections: {
    title: string;
    text?: string;
    table?: {
      headers: string[];
      rows: string[][];
    };
    callout?: {
      type: 'concept' | 'warning' | 'gold_analyst' | 'case_study';
      title: string;
      text: string;
    };
  }[];
}

export interface GoldManualPart {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  dominationPoints: string[];
  chapters: GoldManualChapter[];
}

