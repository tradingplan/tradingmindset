import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from './src/audio/AudioContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AudioProvider>
    </SafeAreaProvider>
  );
}
