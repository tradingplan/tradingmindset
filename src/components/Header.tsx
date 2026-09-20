import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { Flame, ShieldCheck, Activity, Award, Bell } from 'lucide-react-native';
import { getStreakCount } from '../storage/disciplineStore';
import { loadAlarms } from '../storage/alarmStore';
import { AlarmsModal } from './alarms/AlarmsModal';
import { NotificationActionTarget } from '../types';

interface HeaderProps {
  score?: number;
  onPressScore?: () => void;
  onNavigateToTarget?: (target: NotificationActionTarget) => void;
}

export const Header: React.FC<HeaderProps> = ({ score = 100, onPressScore, onNavigateToTarget }) => {
  const insets = useSafeAreaInsets();
  const topSafeAreaPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20) + Spacing.xs;

  const [streak, setStreak] = useState(3);
  const [activeAlarmsCount, setActiveAlarmsCount] = useState(0);
  const [isAlarmsModalVisible, setIsAlarmsModalVisible] = useState(false);
  const [marketStatus, setMarketStatus] = useState({ text: 'PREGÃO ATIVO', color: Colors.emerald, open: true });

  useEffect(() => {
    loadStreak();
    checkMarketStatus();
    loadActiveAlarms();
    const interval = setInterval(() => {
      checkMarketStatus();
      loadActiveAlarms();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStreak = async () => {
    const s = await getStreakCount();
    setStreak(s);
  };

  const loadActiveAlarms = async () => {
    try {
      const list = await loadAlarms();
      const count = list.filter((a) => a.enabled).length;
      setActiveAlarmsCount(count);
    } catch {}
  };

  const checkMarketStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();

    if (day === 0 || day === 6) {
      setMarketStatus({ text: 'MERCADO FECHADO', color: Colors.textMuted, open: false });
    } else if (hours >= 8 && hours < 9) {
      setMarketStatus({ text: 'PRÉ-MERCADO (BLINDAGEM)', color: Colors.amber, open: false });
    } else if (hours >= 9 && hours < 18) {
      setMarketStatus({ text: 'PREGÃO AO VIVO', color: Colors.emerald, open: true });
    } else {
      setMarketStatus({ text: 'PÓS-MERCADO (AUDITORIA)', color: Colors.cyan, open: false });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topSafeAreaPadding }]}>
      {/* Top Row: Title, Market Status & Alarms Button */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.brandBadge}>
            <Activity size={14} color={Colors.cyan} />
          </View>
          <View>
            <Text style={styles.brandTitle}>TRADING MINDSET</Text>
            <Text style={styles.brandSubtitle}>COMPANION DE ALTA PERFORMANCE</Text>
          </View>
        </View>

        <View style={styles.topRightActions}>
          <View style={[styles.marketPill, { borderColor: marketStatus.color }]}>
            <View style={[styles.statusDot, { backgroundColor: marketStatus.color }]} />
            <Text style={[styles.marketText, { color: marketStatus.color }]}>{marketStatus.text}</Text>
          </View>

          {/* Alarm Quick Bell Button */}
          <TouchableOpacity
            style={styles.bellHeaderBtn}
            onPress={() => setIsAlarmsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Bell size={16} color={activeAlarmsCount > 0 ? Colors.cyan : Colors.textMuted} />
            {activeAlarmsCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{activeAlarmsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Alarms Modal */}
      <AlarmsModal
        visible={isAlarmsModalVisible}
        onClose={() => {
          setIsAlarmsModalVisible(false);
          loadActiveAlarms();
        }}
        onNavigateToTarget={onNavigateToTarget}
      />

      {/* Metrics Bar */}
      <View style={styles.metricsRow}>
        {/* Discipline Score Metric */}
        <TouchableOpacity style={styles.metricCard} onPress={onPressScore} activeOpacity={0.8}>
          <View style={styles.metricIconBoxEmerald}>
            <ShieldCheck size={18} color={Colors.emerald} />
          </View>
          <View>
            <Text style={styles.metricLabel}>SCORE DO DIA</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.metricValue, { color: score >= 80 ? Colors.emerald : score >= 50 ? Colors.amber : Colors.crimson }]}>
                {score}%
              </Text>
              <Text style={styles.metricSub}>
                {score >= 80 ? 'EXCELENTE' : score >= 50 ? 'ATENÇÃO' : 'CRÍTICO'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Streak Metric */}
        <View style={styles.metricCard}>
          <View style={styles.metricIconBoxAmber}>
            <Flame size={18} color={Colors.amber} />
          </View>
          <View>
            <Text style={styles.metricLabel}>CONSISTÊNCIA</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.metricValue, { color: Colors.amber }]}>{streak}</Text>
              <Text style={styles.metricSub}>DIAS NO PLANO</Text>
            </View>
          </View>
        </View>

        {/* Mode Pill */}
        <View style={styles.metricCardCompact}>
          <Award size={18} color={Colors.cyan} />
          <Text style={styles.modeText}>SNIPER</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  brandTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.fontWeight.medium,
    letterSpacing: 0.5,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bellHeaderBtn: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.cyan,
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  bellBadgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: Typography.fontWeight.bold,
  },
  marketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(11, 14, 20, 0.6)',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  marketText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  metricCardCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  modeText: {
    color: Colors.cyan,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  metricIconBoxEmerald: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.emeraldGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconBoxAmber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.amberGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.fontWeight.semiBold,
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  metricSub: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: Typography.fontWeight.medium,
  },
});
