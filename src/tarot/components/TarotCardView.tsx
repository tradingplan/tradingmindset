import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Carta } from '../types';
import { getTarotIcon } from '../icons';
import { Layers, Sparkles } from 'lucide-react-native';

interface TarotCardViewProps {
  carta: Carta | null;
  revelada: boolean;
  onPressFlip?: () => void;
  animarAoRevelar?: boolean;
}

const CARD_WIDTH = 240;
const CARD_HEIGHT = 360;
const COLOR_BEAR = '#E22A22';
const COLOR_BULL = '#1FA938';
const COLOR_TAPE_SHADOW = '#0E0E0E';

export const TarotCardView: React.FC<TarotCardViewProps> = ({
  carta,
  revelada,
  onPressFlip,
  animarAoRevelar = true,
}) => {
  const animatedValue = useRef(new Animated.Value(revelada ? 180 : 0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      animatedValue.setValue(revelada ? 180 : 0);
      return;
    }

    if (revelada) {
      if (animarAoRevelar) {
        Animated.timing(animatedValue, {
          toValue: 180,
          duration: 450,
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      } else {
        animatedValue.setValue(180);
      }
    } else {
      animatedValue.setValue(0);
    }
  }, [revelada, animarAoRevelar]);

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [90, 91],
    outputRange: [1, 0],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  const corPolaridade = carta?.polaridade === 'bull' ? COLOR_BULL : COLOR_BEAR;
  const IconComponent = carta ? getTarotIcon(carta.icone) : Sparkles;

  return (
    <View style={styles.cardContainer}>
      {/* Sombra Hard Tape para Android */}
      {Platform.OS === 'android' && <View style={styles.androidShadowSibling} />}

      {/* Face Traseira (Carta Virada / Não Revelada) */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardBack,
          styles.cardShadowIos,
          backAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.cardBackInner}
          onPress={onPressFlip}
          disabled={revelada}
        >
          <View style={styles.cardBackPattern}>
            <View style={styles.cardBackCenterCircle}>
              <Layers size={36} color="#06B6D4" />
            </View>
            <Text style={styles.cardBackTitle}>TAROT TRADER</Text>
            <Text style={styles.cardBackSubtitle}>MATRIZ DE ARQUÉTIPOS</Text>
            <View style={styles.cardBackDivider} />
            <Text style={styles.cardBackHint}>Pressione para revelar</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Face Frontal (Carta Revelada) */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardFront,
          styles.cardShadowIos,
          { borderColor: corPolaridade },
          frontAnimatedStyle,
        ]}
      >
        {carta && (
          <View style={styles.cardFrontContent}>
            {/* Cabeçalho do Card */}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.eyebrowRevealed}>ARQUÉTIPO REVELADO</Text>
              <Text style={[styles.cardNumberText, { color: corPolaridade }]}>
                #{String(carta.numero).padStart(2, '0')}
              </Text>
            </View>

            {/* Ícone com Círculo Colorido */}
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                    carta.polaridade === 'bull'
                      ? 'rgba(31, 169, 56, 0.12)'
                      : 'rgba(226, 42, 34, 0.12)',
                  borderColor: corPolaridade,
                },
              ]}
            >
              <IconComponent size={40} color={corPolaridade} />
            </View>

            {/* Arquétipo em Caixa Alta */}
            <View style={styles.archetypeContainer}>
              <Text
                style={[styles.archetypeName, { color: corPolaridade }]}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {carta.arquetipo.toUpperCase()}
              </Text>
            </View>

            {/* Divisor */}
            <View style={[styles.cardDivider, { backgroundColor: corPolaridade }]} />

            {/* Emoção */}
            <View style={styles.emotionContainer}>
              <Text style={[styles.emotionText, { color: corPolaridade }]}>
                {carta.emocao.toUpperCase()}
              </Text>
            </View>

            {/* Rodapé da Carta */}
            <View style={styles.cardFooter}>
              <Text style={styles.cardPolarityLabel}>
                POLARIDADE {carta.polaridade === 'bull' ? 'DISCIPLINADA' : 'COMPORTAMENTAL'}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  androidShadowSibling: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLOR_TAPE_SHADOW,
    borderRadius: 12,
    zIndex: 0,
  },
  cardShadowIos: {
    ...Platform.select({
      ios: {
        shadowColor: COLOR_TAPE_SHADOW,
        shadowOffset: { width: 2, height: 2 },
        shadowRadius: 0,
        shadowOpacity: 1,
      },
      web: {
        boxShadow: '2px 2px 0px #0E0E0E',
      },
    }),
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    backfaceVisibility: 'hidden',
    zIndex: 1,
  },
  cardBack: {
    backgroundColor: '#11151C',
    borderWidth: 2,
    borderColor: '#2A324B',
    padding: 8,
  },
  cardBackInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 8,
    backgroundColor: '#161B26',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardBackPattern: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cardBackCenterCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1.5,
    borderColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardBackTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  cardBackSubtitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  cardBackDivider: {
    width: 48,
    height: 1,
    backgroundColor: '#2A324B',
    marginVertical: 14,
  },
  cardBackHint: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    padding: 16,
  },
  cardFrontContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrowRevealed: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardNumberText: {
    fontSize: 11,
    fontWeight: '800',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  archetypeContainer: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  archetypeName: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardDivider: {
    width: '100%',
    height: 1.5,
    marginVertical: 6,
    opacity: 0.8,
  },
  emotionContainer: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  emotionText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  cardFooter: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  cardPolarityLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
});
