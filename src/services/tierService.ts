import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import { UserTier, UserTierState } from '../types';

export const STORAGE_KEY_USER_TIER = '@tradingmindset:user_tier';

// Lista de faixas gratuitas de degustação (3 áudios abertos a qualquer usuário)
export const FREE_TRACK_IDS: string[] = [
  'track-pre-1',         // O STOP Não é o Problema (IA)
  'track-pre-2',         // O STOP Não é o Problema (Original)
  'binaural-alpha-10hz', // Ondas Alfa (10 Hz) — Flow State Sniper
];

// E-mails com privilégio Superadmin automático
const SUPERADMIN_EMAILS = [
  'tradingplan.br@gmail.com',
  'admin@tradingplan.com.br',
  'contato@tradingplan.com.br',
];

export const DEFAULT_FREE_TIER_STATE: UserTierState = {
  tier: 'free',
  isPremium: false,
  isSuperadmin: false,
  isLoggedIn: false,
  email: null,
  planName: 'Convidado (Free)',
};

/**
 * Retorna se uma faixa de áudio faz parte do pacote gratuito de degustação
 */
export function isTrackFree(trackId: string): boolean {
  return FREE_TRACK_IDS.includes(trackId);
}

/**
 * Verifica se um usuário com determinado nível pode reproduzir a faixa
 */
export function canAccessTrack(trackId: string, tier: UserTier): boolean {
  if (tier === 'superadmin' || tier === 'premium') {
    return true;
  }
  return isTrackFree(trackId);
}

/**
 * Verifica se o nível possui acesso a sincronização em nuvem
 */
export function canAccessCloudSync(tier: UserTier): boolean {
  return tier === 'premium' || tier === 'superadmin';
}

/**
 * Verifica se o nível possui acesso ao histórico completo de 90 dias do Tarot e Auditoria
 */
export function canAccessFullHistory(tier: UserTier): boolean {
  return tier === 'premium' || tier === 'superadmin';
}

/**
 * Salva o estado do plano em cache no AsyncStorage para funcionamento offline
 */
export async function saveCachedTier(state: UserTierState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_USER_TIER, JSON.stringify(state));
  } catch (err) {
    if (__DEV__) console.warn('[TierService] Erro ao salvar cache de nível:', err);
  }
}

/**
 * Lê o estado de plano salvo em cache
 */
export async function loadCachedTier(): Promise<UserTierState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_USER_TIER);
    if (!raw) return DEFAULT_FREE_TIER_STATE;
    const parsed = JSON.parse(raw);
    return parsed || DEFAULT_FREE_TIER_STATE;
  } catch {
    return DEFAULT_FREE_TIER_STATE;
  }
}

/**
 * Avalia a sessão atual do Supabase e retorna o nível de acesso correto
 */
export async function resolveUserTier(): Promise<UserTierState> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_FREE_TIER_STATE;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user || !user.email) {
      const freeState = DEFAULT_FREE_TIER_STATE;
      await saveCachedTier(freeState);
      return freeState;
    }

    const emailNormalized = user.email.toLowerCase().trim();

    // 1. Verificação de Superadmin
    const isSuperAdminByEmail = SUPERADMIN_EMAILS.includes(emailNormalized);
    const isSuperAdminByMeta =
      user.app_metadata?.role === 'admin' ||
      user.user_metadata?.role === 'admin';

    if (isSuperAdminByEmail || isSuperAdminByMeta) {
      const adminState: UserTierState = {
        tier: 'superadmin',
        isPremium: true,
        isSuperadmin: true,
        isLoggedIn: true,
        email: emailNormalized,
        planName: 'Superadmin Vitalício',
      };
      await saveCachedTier(adminState);
      return adminState;
    }

    // 2. Verificação de Plano Premium nos metadados ou tabela de perfis
    let isPremium = false;
    let planTitle = 'Trader PRO (Ativo)';

    // Checagem em metadados do Auth
    if (
      user.user_metadata?.plan === 'premium' ||
      user.app_metadata?.plan === 'premium' ||
      user.user_metadata?.is_pro === true
    ) {
      isPremium = true;
    }

    // Checagem na tabela 'profiles' do Supabase se existir
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, role, plan_expires_at')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        if (profile.role === 'admin') {
          const adminState: UserTierState = {
            tier: 'superadmin',
            isPremium: true,
            isSuperadmin: true,
            isLoggedIn: true,
            email: emailNormalized,
            planName: 'Superadmin Vitalício',
          };
          await saveCachedTier(adminState);
          return adminState;
        }

        if (profile.plan === 'premium' || profile.plan === 'pro') {
          if (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date()) {
            isPremium = true;
          }
        }
      }
    } catch {
      // Ignora erro se a tabela profiles ainda não tiver sido criada
    }

    if (isPremium) {
      const premiumState: UserTierState = {
        tier: 'premium',
        isPremium: true,
        isSuperadmin: false,
        isLoggedIn: true,
        email: emailNormalized,
        planName: planTitle,
      };
      await saveCachedTier(premiumState);
      return premiumState;
    }

    // 3. Usuário autenticado, porém em plano Free
    const authFreeState: UserTierState = {
      tier: 'free',
      isPremium: false,
      isSuperadmin: false,
      isLoggedIn: true,
      email: emailNormalized,
      planName: 'Membro Gratuito',
    };
    await saveCachedTier(authFreeState);
    return authFreeState;
  } catch (err) {
    if (__DEV__) console.warn('[TierService] Erro ao resolver nível de acesso:', err);
    return loadCachedTier();
  }
}
