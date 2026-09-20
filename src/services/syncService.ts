import { supabase, isSupabaseConfigured } from './supabase';
import { DailyProtocolState, HistoryDayScore } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../storage/storageKeys';

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
    pre_market: protocol.preMarket,
    sniper_check: protocol.sniperCheck,
    post_market: protocol.postMarket,
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
    preMarket: row.pre_market || {},
    sniperCheck: row.sniper_check || {},
    postMarket: {
      ...row.post_market,
      mentalNote: row.mental_note ?? row.post_market?.mentalNote ?? '',
      disciplineScore: row.discipline_score ?? row.post_market?.disciplineScore ?? 100,
    },
    isLocked: row.is_locked ?? false,
    completedAt: row.completed_at || undefined,
  };
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

    const { error } = await supabase
      .from('daily_protocols')
      .upsert(record, { onConflict: 'user_id, date' });

    if (error) {
      console.error('[Sync] Error pushing protocol to Supabase:', error);
      updateSyncStatus('error');
      return false;
    }

    updateSyncStatus('synced');
    return true;
  } catch (err) {
    console.error('[Sync] Unexpected push error:', err);
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

    const { data, error } = await supabase
      .from('daily_protocols')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      console.error('[Sync] Error fetching protocol:', error);
      return null;
    }

    if (data) {
      return dbRecordToProtocol(data);
    }
  } catch (err) {
    console.error('[Sync] Fetch error:', err);
  }

  return null;
}

/**
 * Sincroniza tudo: envia dados locais pendentes e busca novidades da nuvem
 */
export async function syncAllProtocols(): Promise<{ success: boolean; updatedCount: number }> {
  if (!isSupabaseConfigured()) {
    updateSyncStatus('offline');
    return { success: false, updatedCount: 0 };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      updateSyncStatus('unauthenticated');
      return { success: false, updatedCount: 0 };
    }

    updateSyncStatus('syncing');

    // 1. Busca todos os protocolos do usuário no Supabase
    const { data: cloudProtocols, error } = await supabase
      .from('daily_protocols')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('[Sync] Error pulling cloud protocols:', error);
      updateSyncStatus('error');
      return { success: false, updatedCount: 0 };
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
  } catch (err) {
    console.error('[Sync] Full sync error:', err);
    updateSyncStatus('error');
    return { success: false, updatedCount: 0 };
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
