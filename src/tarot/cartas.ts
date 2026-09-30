import tarotJsonData from '../data/tarot-trader-cartas.json';
import { Carta, TarotDataJson } from './types';

const data = tarotJsonData as unknown as TarotDataJson;

export const CARTAS: Carta[] = data.cartas;
export const AVISO_LEGAL: string = data.aviso;
export const REGRAS_DE_USO = data.regras_de_uso;
export const VERSAO_TAROT: string = data.versao;

export function buscarCartaPorId(id: string): Carta | undefined {
  return CARTAS.find((c) => c.id === id);
}

export function buscarCartaPorNumero(numero: number): Carta | undefined {
  return CARTAS.find((c) => c.numero === numero);
}
