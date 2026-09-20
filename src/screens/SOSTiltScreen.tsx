import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { Card } from '../components/Card';
import { BreathingCircle } from '../components/BreathingCircle';
import { recordSOSEvent } from '../storage/disciplineStore';
import * as Haptics from 'expo-haptics';
import {
  AlertOctagon,
  ShieldAlert,
  Flame,
  Power,
  RotateCcw,
  CheckCircle,
  Heart,
  Radio,
  Zap,
} from 'lucide-react-native';

export const SOSTiltScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topSafeAreaPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20) + Spacing.sm;
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [completedProtocol, setCompletedProtocol] = useState(false);

  const triggerSOS = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
    setIsSOSActive(true);
    setCompletedProtocol(false);
  };

  const handleFinishSOS = async (reason: string) => {
    setIsSOSActive(false);
    setCompletedProtocol(true);
    await recordSOSEvent({
      id: `sos-${Date.now()}`,
      timestamp: new Date().toISOString(),
      completedBreathing: true,
      durationSeconds: 90,
      reason,
    });
  };

  const handleCancelSOS = () => {
    setIsSOSActive(false);
  };

  return (
    <View style={styles.container}>
      {isSOSActive ? (
        /* ACTIVE PROTOCOL SCREEN (90s IMMERSIVE RESET) */
        <ScrollView contentContainerStyle={[styles.activeScrollContent, { paddingTop: topSafeAreaPadding }]} showsVerticalScrollIndicator={false}>
          <View style={styles.emergencyBanner}>
            <AlertOctagon size={20} color={Colors.crimson} />
            <Text style={styles.emergencyBannerText}>INTERVENÇÃO DE EMERGÊNCIA ANTI-TILT</Text>
          </View>

          {/* 4-7-8 Breathing Orb & Reality Commands */}
          <BreathingCircle
            totalSeconds={90}
            isActive={isSOSActive}
            onComplete={() => handleFinishSOS('Tempo de 90s completado com sucesso')}
          />

          {/* Action Decision Buttons */}
          <View style={styles.sosActionRow}>
            <TouchableOpacity
              style={styles.calmBtn}
              onPress={() => handleFinishSOS('Trader retomou o controle')}
            >
              <CheckCircle size={18} color="#0B0E14" />
              <Text style={styles.calmBtnText}>ESTOU CALMO E NO CONTROLE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shutdownBtn}
              onPress={() => handleFinishSOS('Trader optou por desligar a plataforma')}
            >
              <Power size={18} color={Colors.crimson} />
              <Text style={styles.shutdownBtnText}>DESLIGAR PLATAFORMA HOJE</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelLink} onPress={handleCancelSOS}>
            <Text style={styles.cancelLinkText}>Cancelar Intervenção</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* IDLE SCREEN (TACTICAL SOS LAUNCHPAD) */
        <ScrollView contentContainerStyle={[styles.idleScrollContent, { paddingTop: topSafeAreaPadding }]} showsVerticalScrollIndicator={false}>
          {/* Header Description */}
          <View style={styles.idleHeader}>
            <View style={styles.idleTagRow}>
              <ShieldAlert size={16} color={Colors.crimson} />
              <Text style={styles.idleTagText}>ZONA DE PROTEÇÃO PATRIMONIAL</Text>
            </View>
            <Text style={styles.idleTitle}>Botão de Emergência SOS Tilt</Text>
            <Text style={styles.idleSubtitle}>
              Acione instantaneamente se sentir vontade de dobrar a mão, vingar um loss ou quebrar o plano.
            </Text>
          </View>

          {/* Big Emergency Panic Button */}
          <View style={styles.panicButtonWrapper}>
            <TouchableOpacity
              style={styles.bigPanicButton}
              activeOpacity={0.8}
              onPress={triggerSOS}
            >
              <View style={styles.panicInnerRing}>
                <AlertOctagon size={48} color={Colors.crimson} />
                <Text style={styles.panicButtonText}>SOS TILT</Text>
                <Text style={styles.panicButtonSub}>RESET DE 90 SEGUNDOS</Text>
              </View>
            </TouchableOpacity>
          </View>

          {completedProtocol && (
            <Card variant="success" style={styles.cardSpacing}>
              <View style={styles.completedHeader}>
                <CheckCircle size={20} color={Colors.emerald} />
                <Text style={styles.completedTitle}>Reset Concluído com Sucesso</Text>
              </View>
              <Text style={styles.completedBody}>
                Seus batimentos e níveis de cortisol foram estabilizados. Opere apenas se o setup técnico for
                inegociável.
              </Text>
            </Card>
          )}

          {/* Quick Mental Grounding Protocol */}
          <Card style={styles.cardSpacing}>
            <Text style={styles.cardSectionLabel}>COMO O RESET NEUROLÓGICO SALVA SUA CONTA</Text>

            <View style={styles.tiltStepRow}>
              <View style={styles.tiltStepNum}>
                <Text style={styles.tiltStepNumText}>1</Text>
              </View>
              <View style={styles.tiltStepInfo}>
                <Text style={styles.tiltStepTitle}>Corta o Sequestro da Amígdala</Text>
                <Text style={styles.tiltStepDesc}>
                  Após um loss, o cérebro entra no modo "luta ou fuga". 90 segundos desaceleram a corrente sanguínea.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.tiltStepRow}>
              <View style={styles.tiltStepNum}>
                <Text style={styles.tiltStepNumText}>2</Text>
              </View>
              <View style={styles.tiltStepInfo}>
                <Text style={styles.tiltStepTitle}>Tira a Mão do Mouse</Text>
                <Text style={styles.tiltStepDesc}>
                  A quebra de contato físico impede o clique impulsivo e o overtrading destrutivo.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.tiltStepRow}>
              <View style={styles.tiltStepNum}>
                <Text style={styles.tiltStepNumText}>3</Text>
              </View>
              <View style={styles.tiltStepInfo}>
                <Text style={styles.tiltStepTitle}>Preserva o Capital Psicológico</Text>
                <Text style={styles.tiltStepDesc}>
                  Você volta a pensar em probabilidades matemáticas e não em dor ou orgulho ferido.
                </Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  idleScrollContent: {
    padding: Spacing.md,
    paddingBottom: 150,
    alignItems: 'center',
  },
  idleHeader: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  idleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: Spacing.sm,
  },
  idleTagText: {
    color: Colors.crimson,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  idleTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
    textAlign: 'center',
  },
  idleSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '90%',
  },
  panicButtonWrapper: {
    marginVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigPanicButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 4,
    borderColor: Colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.crimson,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 12,
  },
  panicInnerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(26, 31, 44, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panicButtonText: {
    color: Colors.crimson,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 2,
    marginTop: 4,
  },
  panicButtonSub: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    marginTop: 2,
  },
  cardSpacing: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  cardSectionLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  tiltStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  tiltStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cyanDark,
  },
  tiltStepNumText: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  tiltStepInfo: {
    flex: 1,
  },
  tiltStepTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: 2,
  },
  tiltStepDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  completedTitle: {
    color: Colors.emerald,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  completedBody: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  activeScrollContent: {
    padding: Spacing.md,
    paddingBottom: 150,
    alignItems: 'center',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: Colors.crimsonDark,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    marginVertical: Spacing.sm,
  },
  emergencyBannerText: {
    color: Colors.crimson,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  sosActionRow: {
    width: '100%',
    gap: 10,
    marginTop: Spacing.lg,
  },
  calmBtn: {
    backgroundColor: Colors.emerald,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calmBtnText: {
    color: '#0B0E14',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.extraBold,
  },
  shutdownBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.crimsonDark,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shutdownBtnText: {
    color: Colors.crimson,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  cancelLink: {
    marginTop: Spacing.md,
    padding: 8,
  },
  cancelLinkText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
  },
});
