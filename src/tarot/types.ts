export interface Carta {
  numero: number;
  id: string;
  arquetipo: string;
  emocao: string;
  polaridade: 'bear' | 'bull';
  icone: string;
  psych_load: number;
  vies: string;
  sabedoria: string;
  sinais: string[];
  antidoto: string;
  fonte: string;
}

export type BiasStatus = 'STABLE_FLOW' | 'CAUTION_DRIFT' | 'UNSTABLE_OVERLOAD' | 'CRITICAL_TILT';

export interface Leitura {
  data: string; // "YYYY-MM-DD" no fuso do aparelho
  cartaId: string;
  psychLoad: number; // valor final com variação de -8 a +8
  biasStatus: BiasStatus;
}

export interface TarotDataJson {
  versao: string;
  idioma: string;
  aviso: string;
  regras_de_uso: {
    psych_load: string;
    bias_status: {
      STABLE_FLOW: string;
      CAUTION_DRIFT: string;
      UNSTABLE_OVERLOAD: string;
      CRITICAL_TILT: string;
    };
    polaridade: string;
  };
  cartas: Carta[];
}
