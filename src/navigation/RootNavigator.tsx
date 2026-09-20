import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootTabParamList, NotificationActionTarget } from '../types';
import { Colors, Typography } from '../theme';
import { ProtocolScreen } from '../screens/ProtocolScreen';
import { AudioScreen } from '../screens/AudioScreen';
import { SOSTiltScreen } from '../screens/SOSTiltScreen';
import { RulesScreen } from '../screens/RulesScreen';
import { MiniPlayer } from '../components/MiniPlayer';
import { AudioModal } from '../components/AudioModal';
import * as Notifications from 'expo-notifications';
import { initNotifications, syncAllAlarmsWithSystem } from '../services/alarmService';
import { loadAlarms } from '../storage/alarmStore';
import {
  ClipboardList,
  Headphones,
  AlertOctagon,
  BookOpen,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigationRef = useNavigationContainerRef<RootTabParamList>();
  const bottomBarHeight = Platform.OS === 'ios' ? 88 : 60 + insets.bottom;

  useEffect(() => {
    // 1. Inicializar permissões e canais nativos
    const setupAlarms = async () => {
      await initNotifications();
      const alarms = await loadAlarms();
      await syncAllAlarmsWithSystem(alarms);
    };
    setupAlarms();

    // 2. Listener para cliques em notificações
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const target = data?.actionTarget as NotificationActionTarget | undefined;

      if (navigationRef.isReady() && target) {
        if (target === 'protocol_pre' || target === 'protocol_post') {
          navigationRef.navigate('Protocol');
        } else if (target === 'audioteca') {
          navigationRef.navigate('Audioteca');
        } else if (target === 'sos_tilt') {
          navigationRef.navigate('SOSTilt');
        } else if (target === 'rules') {
          navigationRef.navigate('Rules');
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors.backgroundSecondary,
              borderTopColor: Colors.border,
              borderTopWidth: 1,
              height: bottomBarHeight,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : (Platform.OS === 'ios' ? 28 : 8),
              paddingTop: 8,
            },
            tabBarActiveTintColor: Colors.cyan,
            tabBarInactiveTintColor: Colors.textMuted,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: Typography.fontWeight.semiBold,
              marginTop: 2,
            },
          }}
        >
          <Tab.Screen
            name="Protocol"
            component={ProtocolScreen}
            options={{
              tabBarLabel: 'Protocolo',
              tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
            }}
          />

          <Tab.Screen
            name="Audioteca"
            component={AudioScreen}
            options={{
              tabBarLabel: 'Audioteca',
              tabBarIcon: ({ color, size }) => <Headphones size={size} color={color} />,
            }}
          />

          <Tab.Screen
            name="SOSTilt"
            component={SOSTiltScreen}
            options={{
              tabBarLabel: 'SOS Tilt',
              tabBarActiveTintColor: Colors.crimson,
              tabBarIcon: ({ color, size }) => (
                <View style={styles.sosTabIconContainer}>
                  <AlertOctagon size={size + 2} color={color} />
                </View>
              ),
            }}
          />

          <Tab.Screen
            name="Rules"
            component={RulesScreen}
            options={{
              tabBarLabel: 'Leis & Regras',
              tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
            }}
          />
        </Tab.Navigator>

        {/* Persistent Floating Mini Player */}
        <MiniPlayer bottomOffset={bottomBarHeight} />

        {/* Full Expanded Audio Modal */}
        <AudioModal />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sosTabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
