import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from './src/audio/AudioContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { WebLoginScreen } from './src/screens/WebLoginScreen';
import { supabase } from './src/services/supabase';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    Platform.OS === 'web' ? null : true
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      checkWebAuth();

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(Boolean(session?.user));
      });

      return () => {
        authListener?.subscription?.unsubscribe?.();
      };
    }
  }, []);

  const checkWebAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(Boolean(data?.session?.user));
    } catch {
      setIsAuthenticated(false);
    }
  };

  // Loading state for Web initialization
  if (Platform.OS === 'web' && isAuthenticated === null) {
    return (
      <SafeAreaProvider style={styles.webRoot}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06B6D4" />
        </View>
      </SafeAreaProvider>
    );
  }

  // Web Gate: show login screen if not authenticated
  if (Platform.OS === 'web' && !isAuthenticated) {
    return (
      <SafeAreaProvider style={styles.webRoot}>
        <StatusBar style="light" />
        <WebLoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.webRoot}>
      <AudioProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AudioProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#07090E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
