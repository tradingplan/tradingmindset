import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import * as Haptics from 'expo-haptics';

interface BreathingCircleProps {
  totalSeconds?: number;
  onComplete?: () => void;
  isActive?: boolean;
}

type BreathPhase = 'inspire' | 'hold' | 'expire';

const REALITY_CHECKS = [
  'Tire as mãos do mouse e do teclado agora.',
  'Nenhum trade isolado vai mudar sua vida hoje.',
  'Uma perda controlada é apenas o custo do negócio.',
  'O mercado estará aqui amanhã. Seu capital pode não estar.',
  'Você é um gestor de risco, não um apostador impulsivo.',
  'A consistência nasce de proteger seu capital psicológico.',
];

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  totalSeconds = 90,
  onComplete,
  isActive = true,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [phase, setPhase] = useState<BreathPhase>('inspire');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(4);
  const [realityCheckIndex, setRealityCheckIndex] = useState(0);

  // Animated scale and opacity
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Trigger gentle haptic if available
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    if (Platform.OS !== 'web') {
      try {
        if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // ignore
      }
    }
  };

  // 90s total timer & reality check cycler
  useEffect(() => {
    if (!isActive) return;

    const mainTimer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(mainTimer);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const quoteTimer = setInterval(() => {
      setRealityCheckIndex((prev) => (prev + 1) % REALITY_CHECKS.length);
    }, 15000);

    return () => {
      clearInterval(mainTimer);
      clearInterval(quoteTimer);
    };
  }, [isActive, onComplete]);

  // 4-7-8 Breathing state machine
  useEffect(() => {
    if (!isActive || remainingSeconds <= 0) return;

    let timeout: any;

    if (phase === 'inspire') {
      setPhaseTimeLeft(4);
      triggerHaptic('light');
      Animated.timing(scaleAnim, {
        toValue: 1.45,
        duration: 4000,
        useNativeDriver: true,
      }).start();

      timeout = setTimeout(() => {
        setPhase('hold');
      }, 4000);
    } else if (phase === 'hold') {
      setPhaseTimeLeft(7);
      triggerHaptic('medium');
      // Gentle pulse while holding
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.8, duration: 1750, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 1750, useNativeDriver: true }),
        ])
      ).start();

      timeout = setTimeout(() => {
        setPhase('expire');
      }, 7000);
    } else if (phase === 'expire') {
      setPhaseTimeLeft(8);
      triggerHaptic('heavy');
      pulseAnim.stopAnimation();
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 8000,
        useNativeDriver: true,
      }).start();

      timeout = setTimeout(() => {
        setPhase('inspire');
      }, 8000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [phase, isActive, remainingSeconds]);

  // Phase countdown decrementer
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setPhaseTimeLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, isActive]);

  const getPhaseDetails = () => {
    switch (phase) {
      case 'inspire':
        return { title: 'INSPIRE', subtitle: 'Puxe o ar pelo nariz lentamente', color: Colors.cyan };
      case 'hold':
        return { title: 'SEGURE', subtitle: 'Mantenha o ar e relaxe os ombros', color: Colors.amber };
      case 'expire':
        return { title: 'EXPIRE', subtitle: 'Solte o ar pela boca com calma', color: Colors.emerald };
    }
  };

  const phaseInfo = getPhaseDetails();

  return (
    <View style={styles.container}>
      {/* 90-second Countdown & Header */}
      <View style={styles.timerHeader}>
        <Text style={styles.timerSub}>RESET NEUROLÓGICO</Text>
        <Text style={styles.timerNumber}>{remainingSeconds}s</Text>
        <Text style={styles.timerLabel}>PROTOCOLO ANTI-TILT ATIVO</Text>
      </View>

      {/* Interactive Animated Breathing Orb */}
      <View style={styles.orbContainer}>
        {/* Outer Glow Ring */}
        <Animated.View
          style={[
            styles.outerGlow,
            {
              borderColor: phaseInfo.color,
              transform: [{ scale: scaleAnim }],
              opacity: pulseAnim,
            },
          ]}
        />

        {/* Center Orb */}
        <Animated.View
          style={[
            styles.centerOrb,
            {
              backgroundColor: phaseInfo.color,
              transform: [{ scale: scaleAnim }],
              shadowColor: phaseInfo.color,
            },
          ]}
        >
          <View style={styles.orbInnerContent}>
            <Text style={styles.phaseTitle}>{phaseInfo.title}</Text>
            <Text style={styles.phaseCountdown}>{phaseTimeLeft}s</Text>
          </View>
        </Animated.View>
      </View>

      {/* Phase Instructions */}
      <View style={styles.instructionBox}>
        <Text style={[styles.phaseInstruction, { color: phaseInfo.color }]}>{phaseInfo.subtitle}</Text>
        <Text style={styles.techniqueTag}>Técnica 4-7-8 (Controle do Sistema Nervoso)</Text>
      </View>

      {/* Reality Check Command Box */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteTag}>COMANDO DE PROTEÇÃO</Text>
        <Text style={styles.quoteText}>"{REALITY_CHECKS[realityCheckIndex]}"</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  timerHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timerSub: {
    color: Colors.crimson,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.5,
  },
  timerNumber: {
    color: Colors.textPrimary,
    fontSize: 48,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 1,
    marginVertical: 2,
  },
  timerLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    letterSpacing: 0.8,
  },
  orbContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  outerGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  centerOrb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  orbInnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseTitle: {
    color: '#0B0E14',
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 1.5,
  },
  phaseCountdown: {
    color: '#0B0E14',
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.black as any,
    marginTop: 2,
  },
  instructionBox: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  phaseInstruction: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
  techniqueTag: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    marginTop: 4,
  },
  quoteCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: Spacing.md,
    width: '90%',
    alignItems: 'center',
  },
  quoteTag: {
    color: Colors.crimson,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  quoteText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
