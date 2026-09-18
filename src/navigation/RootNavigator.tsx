import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootTabParamList } from '../types';
import { Colors, Typography } from '../theme';
import { ProtocolScreen } from '../screens/ProtocolScreen';
import { AudioScreen } from '../screens/AudioScreen';
import { SOSTiltScreen } from '../screens/SOSTiltScreen';
import { RulesScreen } from '../screens/RulesScreen';
import { MiniPlayer } from '../components/MiniPlayer';
import { AudioModal } from '../components/AudioModal';
import {
  ClipboardList,
  Headphones,
  AlertOctagon,
  BookOpen,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomBarHeight = Platform.OS === 'ios' ? 88 : 60 + insets.bottom;

  return (
    <NavigationContainer>
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
