import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Carta, Leitura } from './types';
import { buscarCartaPorId } from './cartas';
import {
  obterLeituraHoje,
  obterHistorico,
  puxarCarta,
  dataLocalHoje,
  limparTarotStorage,
} from './tarotService';

export interface UseTarotReturn {
  carregando: boolean;
  leitura: Leitura | null;
  carta: Carta | null;
  historico: Leitura[];
  puxar: () => Promise<{ leitura: Leitura; carta: Carta; isNova: boolean }>;
  recarregar: () => Promise<void>;
  limparParaTestes: () => Promise<void>;
}

export function useTarot(): UseTarotReturn {
  const [carregando, setCarregando] = useState<boolean>(true);
  const [leitura, setLeitura] = useState<Leitura | null>(null);
  const [carta, setCarta] = useState<Carta | null>(null);
  const [historico, setHistorico] = useState<Leitura[]>([]);
  const dataRef = useRef<string>(dataLocalHoje());

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      const hoje = dataLocalHoje();
      dataRef.current = hoje;

      const leituraAtual = await obterLeituraHoje(hoje);
      if (leituraAtual) {
        setLeitura(leituraAtual);
        const cartaEncontrada = buscarCartaPorId(leituraAtual.cartaId);
        setCarta(cartaEncontrada || null);
      } else {
        setLeitura(null);
        setCarta(null);
      }

      const listaHistorico = await obterHistorico();
      setHistorico(listaHistorico);
    } catch (error) {
      if (__DEV__) {
        console.warn('[useTarot] Erro ao carregar dados do Tarot:', error);
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();

    // Revalidação ao voltar para o primeiro plano (caso vire a meia-noite)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const hojeAtual = dataLocalHoje();
        if (hojeAtual !== dataRef.current) {
          carregarDados();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [carregarDados]);

  const puxar = useCallback(async () => {
    setCarregando(true);
    try {
      const resultado = await puxarCarta();
      setLeitura(resultado.leitura);
      setCarta(resultado.carta);

      const listaAtualizada = await obterHistorico();
      setHistorico(listaAtualizada);

      return resultado;
    } finally {
      setCarregando(false);
    }
  }, []);

  const limparParaTestes = useCallback(async () => {
    await limparTarotStorage();
    setLeitura(null);
    setCarta(null);
    setHistorico([]);
  }, []);

  return {
    carregando,
    leitura,
    carta,
    historico,
    puxar,
    recarregar: carregarDados,
    limparParaTestes,
  };
}
