import { supabase, isSupabaseConfigured } from './supabase';
import { DailyProtocolState, HistoryDayScore } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../storage/storageKeys';
import {
  DEFAULT_PRE_MARKET,
  DEFAULT_SNIPER,
  DEFAULT_POST_MARKET,
} from '../storage/protocolDefaults';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline' | 'unauthenticated';

type SyncListener = (status: SyncStatus, lastSyncedAt?: Date) => void;
const syncListeners: Set<SyncListener> = new Set();

let currentStatus: SyncStatus = 'idle';
let lastSyncedTime: Date | undefined;

export function getSyncStatus(): { status: SyncStatus; lastSyncedAt?: Date } {
  return { status: currentStatus, lastSyncedAt: lastSyncedTime };
}

export function subscribeSyncStatus(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener(currentStatus, lastSyncedTime);
  return () => syncListeners.delete(listener);
}

function updateSyncStatus(status: SyncStatus) {
  currentStatus = status;
  if (status === 'synced') {
    lastSyncedTime = new Date();
  }
  syncListeners.forEach((fn) => fn(currentStatus, lastSyncedTime));
}

export function protocolToDbRecord(protocol: DailyProtocolState, userId?: string) {
  return {
    ...(userId ? { user_id: userId } : {}),
    date: protocol.date,
    pre_market: protocol.preMarket || DEFAULT_PRE_MARKET,
    sniper_check: protocol.sniperCheck || DEFAULT_SNIPER,
    post_market: protocol.postMarket || DEFAULT_POST_MARKET,
    discipline_score: protocol.postMarket?.disciplineScore ?? 100,
    mental_note: protocol.postMarket?.mentalNote ?? '',
    is_locked: protocol.isLocked ?? false,
    completed_at: protocol.completedAt || null,
    updated_at: new Date().toISOString(),
  };
}

export function dbRecordToProtocol(row: any): DailyProtocolState {
  return {
    date: row.date,
    preMarket: {
      ...DEFAULT_PRE_MARKET,
      ...(row.pre_market || {}),
    },
    sniperCheck: {
      ...DEFAULT_SNIPER,
      ...(row.sniper_check || {}),
    },
    postMarket: {
      ...DEFAULT_POST_MARKET,
      ...(row.post_market || {}),
      mentalNote: row.mental_note ?? row.post_market?.mentalNote ?? DEFAULT_POST_MARKET.mentalNote,
      disciplineScore: row.discipline_score ?? row.post_market?.disciplineScore ?? DEFAULT_POST_MARKET.disciplineScore,
    },
    isLocked: row.is_locked ?? false,
    completedAt: row.completed_at || undefined,
  };
}

/**
 * Trata erros de autenticação ou clock skew (PGRST303 / JWT issued at future)
 */
async function handleAuthError(error: any): Promise<boolean> {
  if (
    error?.code === 'PGRST303' ||
    error?.message?.includes('JWT issued at future') ||
    error?.status === 401 ||
    error?.code === 'PGRST301'
  ) {
    if (__DEV__) {
      console.warn('[Sync] Sessão com clock skew ou token expirado. Renovando token...');
    }
    try {
      const { data, error: refreshErr } = await supabase.auth.refreshSession();
      if (!refreshErr && data?.session) {
        return true;
      }
    } catch {
      // Ignora erro no refresh
    }
  }
  return false;
}

/**
 * Envia um protocolo individual para o Supabase
 */
export async function pushProtocolToSupabase(protocol: DailyProtocolState): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    updateSyncStatus('offline');
    return false;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      updateSyncStatus('unauthenticated');
      return false;
    }

    updateSyncStatus('syncing');

    const record = protocolToDbRecord(protocol, user.id);

    let { error } = await supabase
      .from('daily_protocols')
      .upsert(record, { onConflict: 'user_id, date' });

    if (error) {
      const recovered = await handleAuthError(error);
      if (recovered) {
        const retry = await supabase
          .from('daily_protocols')
          .upsert(record, { onConflict: 'user_id, date' });
        error = retry.error;
      }
    }

    if (error) {
      console.warn('[Sync] Aviso ao enviar protocolo ao Supabase:', error.message || error);
      updateSyncStatus('error');
      return false;
    }

    updateSyncStatus('synced');
    return true;
  } catch (err: any) {
    console.warn('[Sync] Falha no push de protocolo:', err?.message || err);
    updateSyncStatus('error');
    return false;
  }
}

/**
 * Busca o protocolo de uma data específica na nuvem
 */
export async function fetchProtocolFromSupabase(date: string): Promise<DailyProtocolState | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return null;

    let { data, error } = await supabase
      .from('daily_protocols')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      const recovered = await handleAuthError(error);
      if (recovered) {
        const retry = await supabase
          .from('daily_protocols')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', date)
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) {
      console.warn('[Sync] Aviso ao buscar protocolo:', error.message || error);
      return null;
    }

    if (data) {
      return dbRecordToProtocol(data);
    }
  } catch (err: any) {
    console.warn('[Sync] Falha na busca de protocolo:', err?.message || err);
  }

  return null;
}

/**
 * Sincroniza tudo: envia dados locais pendentes e busca novidades da nuvem
 */
export async function syncAllProtocols(): Promise<{ success: boolean; updatedCount: number; errorMsg?: string }> {
  if (!isSupabaseConfigured()) {
    updateSyncStatus('offline');
    return { success: false, updatedCount: 0, errorMsg: 'Supabase não configurado' };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      updateSyncStatus('unauthenticated');
      return { success: false, updatedCount: 0, errorMsg: 'Usuário não autenticado' };
    }

    updateSyncStatus('syncing');

    // 1. Busca todos os protocolos do usuário no Supabase
    let { data: cloudProtocols, error } = await supabase
      .from('daily_protocols')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      const recovered = await handleAuthError(error);
      if (recovered) {
        const retry = await supabase
          .from('daily_protocols')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        cloudProtocols = retry.data;
        error = retry.error;
      }
    }

    if (error) {
      console.warn('[Sync] Aviso ao puxar protocolos da nuvem:', error.message || error);
      updateSyncStatus('error');
      const msg = error.code === 'PGRST303' || error.message?.includes('JWT issued at future')
        ? 'Horário do dispositivo desincronizado com o servidor. Verifique data e hora automáticas.'
        : 'Erro ao comunicar com a nuvem.';
      return { success: false, updatedCount: 0, errorMsg: msg };
    }

    // 2. Grava os dados da nuvem localmente no AsyncStorage
    let updatedCount = 0;
    const historyList: HistoryDayScore[] = [];

    if (cloudProtocols && cloudProtocols.length > 0) {
      for (const row of cloudProtocols) {
        const protocol = dbRecordToProtocol(row);
        const key = `${STORAGE_KEYS.DAILY_PROTOCOL_PREFIX}${protocol.date}`;
        
        // Salva cache do dia
        await AsyncStorage.setItem(key, JSON.stringify(protocol));

        // Monta entrada para o histórico
        historyList.push({
          date: protocol.date,
          score: protocol.postMarket?.disciplineScore ?? 100,
          respectedLoss: protocol.postMarket?.respectedMaxLoss ?? true,
          violationsCount: (protocol.postMarket?.hadImpulsiveTrades ? 1 : 0) + (protocol.postMarket?.respectedMaxLoss ? 0 : 1),
          tradesCount: protocol.sniperCheck?.tradesExecutedToday ?? 0,
          notes: protocol.postMarket?.mentalNote ?? '',
        });
        updatedCount++;
      }

      // Atualiza lista de histórico consolidado
      await AsyncStorage.setItem(STORAGE_KEYS.DISCIPLINE_HISTORY, JSON.stringify(historyList));
    }

    updateSyncStatus('synced');
    return { success: true, updatedCount };
  } catch (err: any) {
    console.warn('[Sync] Erro inesperado na sincronização:', err?.message || err);
    updateSyncStatus('error');
    return { success: false, updatedCount: 0, errorMsg: err?.message || 'Falha de conexão' };
  }
}

/**
 * Escuta atualizações do Supabase em tempo real (opcional / realtime)
 */
export function subscribeToRealtimeProtocols(onUpdate: (protocol: DailyProtocolState) => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('daily_protocols_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'daily_protocols',
      },
      (payload) => {
        if (payload.new && (payload.new as any).date) {
          const protocol = dbRecordToProtocol(payload.new);
          onUpdate(protocol);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
