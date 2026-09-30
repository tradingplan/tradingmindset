import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserTier, UserTierState } from '../types';
import {
  resolveUserTier,
  loadCachedTier,
  DEFAULT_FREE_TIER_STATE,
} from '../services/tierService';
import { supabase } from '../services/supabase';

interface TierContextValue extends UserTierState {
  refreshTier: () => Promise<void>;
  paywallVisible: boolean;
  paywallFeature: string;
  openPaywall: (featureName?: string) => void;
  closePaywall: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalVisible: boolean;
}

const TierContext = createContext<TierContextValue>({
  ...DEFAULT_FREE_TIER_STATE,
  refreshTier: async () => {},
  paywallVisible: false,
  paywallFeature: '',
  openPaywall: () => {},
  closePaywall: () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isAuthModalVisible: false,
});

export const TierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tierState, setTierState] = useState<UserTierState>(DEFAULT_FREE_TIER_STATE);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  const refreshTier = useCallback(async () => {
    try {
      const state = await resolveUserTier();
      setTierState(state);
    } catch {
      const cached = await loadCachedTier();
      setTierState(cached);
    }
  }, []);

  useEffect(() => {
    // 1. Carrega primeiro do cache para renderização ultra-rápida
    loadCachedTier().then((cached) => setTierState(cached));

    // 2. Resolve estado oficial com Supabase
    refreshTier();

    // 3. Escuta eventos de login/logout
    let authSubscription: { unsubscribe: () => void } | undefined;
    try {
      const { data } = supabase.auth.onAuthStateChange(() => {
        refreshTier();
      });
      authSubscription = data?.subscription;
    } catch (err) {
      if (__DEV__) console.warn('[TierContext] onAuthStateChange error:', err);
    }

    return () => {
      authSubscription?.unsubscribe?.();
    };
  }, [refreshTier]);

  const openPaywall = useCallback((featureName: string = 'Recurso Exclusivo PRO') => {
    setPaywallFeature(featureName);
    setPaywallVisible(true);
  }, []);

  const closePaywall = useCallback(() => {
    setPaywallVisible(false);
    setPaywallFeature('');
  }, []);

  const openAuthModal = useCallback(() => {
    setIsAuthModalVisible(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalVisible(false);
  }, []);

  return (
    <TierContext.Provider
      value={{
        ...tierState,
        refreshTier,
        paywallVisible,
        paywallFeature,
        openPaywall,
        closePaywall,
        openAuthModal,
        closeAuthModal,
        isAuthModalVisible,
      }}
    >
      {children}
    </TierContext.Provider>
  );
};

export const useUserTier = (): TierContextValue => {
  return useContext(TierContext);
};
