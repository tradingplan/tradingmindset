import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Switch,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useTarot } from './useTarot';
import { TarotCardView } from './components/TarotCardView';
import { AVISO_LEGAL, buscarCartaPorId } from './cartas';
import { getTarotIcon } from './icons';
import {
  TAROT_STORAGE_KEYS,
  formatarBiasStatus,
  formatarDescricaoBias,
} from './tarotService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ShieldCheck,
  RotateCcw,
  Activity,
  Compass,
  Crown,
  Lock,
} from 'lucide-react-native';
import { getNotificationsModule, isExpoGo } from '../services/alarmService';
import { useUserTier } from '../context/TierContext';

const COLOR_BEAR = '#E22A22';
const COLOR_BULL = '#1FA938';

export const TarotScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topSafeAreaPadding =
    Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 28 : 20) +
    Spacing.sm;

  const { isPremium, openPaywall } = useUserTier();

  const {
    carregando,
    leitura,
    carta,
    historico,
    puxar,
    limparParaTestes,
  } = useTarot();

  const [revelandoAgora, setRevelandoAgora] = useState(false);
  const [accordionAberto, setAccordionAberto] = useState(true);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [lembreteAtivo, setLembreteAtivo] = useState(false);
  const [configurandoLembrete, setConfigurandoLembrete] = useState(false);

  // Carrega preferência do lembrete diário
  useEffect(() => {
    const carregarLembrete = async () => {
      try {
        const salvo = await AsyncStorage.getItem(TAROT_STORAGE_KEYS.LEMBRETE_ATIVO);
        if (salvo === 'true') {
          setLembreteAtivo(true);
        }
      } catch (err) {
        if (__DEV__) console.warn('[TarotScreen] Erro ao carregar lembrete:', err);
      }
    };
    carregarLembrete();
  }, []);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccordionAberto(!accordionAberto);
  };

  const toggleHistorico = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHistoricoAberto(!historicoAberto);
  };

  const handlePuxarCarta = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
    setRevelandoAgora(true);
    await puxar();
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  };

  const handleToggleLembrete = async (valor: boolean) => {
    setConfigurandoLembrete(true);
    try {
      if (valor) {
        const notif = getNotificationsModule();
        if (notif && !isExpoGo && Platform.OS !== 'web') {
          const { status: existingStatus } = await notif.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await notif.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus === 'granted') {
            // Cancela lembrete anterior se houver
            await notif.cancelScheduledNotificationAsync('tarot-daily-reminder').catch(() => {});

            // Agenda para 08:00 da manhã
            await notif.scheduleNotificationAsync({
              identifier: 'tarot-daily-reminder',
              content: {
                title: 'Tarot Trader: Carta do Dia',
                body: 'Puxe sua carta do dia e alinhe sua mente antes de abrir a plataforma.',
                data: { actionTarget: 'tarot' },
                sound: 'default',
              },
              trigger: {
                hour: 8,
                minute: 0,
                repeats: true,
              },
            });
          }
        }
        await AsyncStorage.setItem(TAROT_STORAGE_KEYS.LEMBRETE_ATIVO, 'true');
        setLembreteAtivo(true);
      } else {
        const notif = getNotificationsModule();
        if (notif && !isExpoGo && Platform.OS !== 'web') {
          await notif.cancelScheduledNotificationAsync('tarot-daily-reminder').catch(() => {});
        }
        await AsyncStorage.setItem(TAROT_STORAGE_KEYS.LEMBRETE_ATIVO, 'false');
        setLembreteAtivo(false);
      }
    } catch (err) {
      if (__DEV__) console.warn('[TarotScreen] Erro ao configurar lembrete diário:', err);
    } finally {
      setConfigurandoLembrete(false);
    }
  };

  const corPolaridade = carta?.polaridade === 'bull' ? COLOR_BULL : COLOR_BEAR;
  const isCartaRevelada = !!leitura && !!carta;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topSafeAreaPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.eyebrowContainer}>
            <View style={styles.eyebrowBadge}>
              <Text style={styles.eyebrowText}>CONTROLE DE VIÉS COGNITIVO</Text>
            </View>
          </View>
          <Text style={styles.title}>Reflexão Psicológica Diária</Text>
          <Text style={styles.subtitle}>
            O trading de alta performance exige controle emocional rigoroso. Puxe sua carta do
            dia para obter uma análise do seu arquétipo comportamental atual e evitar armadilhas
            cognitivas.
          </Text>
        </View>

        {/* 2 e 3. CARTA E BOTÃO DE PUXAR */}
        {carregando && !isCartaRevelada ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.cyan} />
            <Text style={styles.loadingText}>Acessando matriz comportamental...</Text>
          </View>
        ) : (
          <View style={styles.cardSection}>
            <TarotCardView
              carta={carta}
              revelada={isCartaRevelada}
              onPressFlip={!isCartaRevelada ? handlePuxarCarta : undefined}
              animarAoRevelar={revelandoAgora}
            />

            {!isCartaRevelada && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.drawButton}
                onPress={handlePuxarCarta}
              >
                <Sparkles size={20} color="#0B0E14" />
                <Text style={styles.drawButtonText}>PUXAR CARTA DO DIA</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* CONTEÚDO REVELADO APÓS LEITURA */}
        {isCartaRevelada && (
          <View style={styles.revealedSection}>
            {/* 4. CARD: SABEDORIA PRÁTICA */}
            <View style={[styles.wisdomCard, { borderColor: corPolaridade }]}>
              <View style={styles.wisdomCardHeader}>
                <View
                  style={[
                    styles.wisdomDot,
                    { backgroundColor: corPolaridade },
                  ]}
                />
                <Text style={[styles.wisdomCardTitle, { color: corPolaridade }]}>
                  SABEDORIA PRÁTICA
                </Text>
              </View>
              <Text style={styles.wisdomText}>{carta.sabedoria}</Text>
            </View>

            {/* 5. BLOCO RECOLHÍVEL: COMO RECONHECER & ANTÍDOTO */}
            <View style={styles.accordionContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.accordionHeader}
                onPress={toggleAccordion}
              >
                <View style={styles.accordionHeaderLeft}>
                  <AlertTriangle
                    size={18}
                    color={corPolaridade}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.accordionTitle}>Diagnóstico & Antídoto</Text>
                </View>
                {accordionAberto ? (
                  <ChevronUp size={20} color={Colors.textMuted} />
                ) : (
                  <ChevronDown size={20} color={Colors.textMuted} />
                )}
              </TouchableOpacity>

              {accordionAberto && (
                <View style={styles.accordionBody}>
                  {/* Sinais */}
                  <Text style={styles.sectionSubheading}>Como reconhecer:</Text>
                  {carta.sinais.map((sinal, index) => (
                    <View key={index} style={styles.signalRow}>
                      <View style={[styles.signalBullet, { backgroundColor: corPolaridade }]} />
                      <Text style={styles.signalText}>{sinal}</Text>
                    </View>
                  ))}

                  {/* Antídoto */}
                  <View style={[styles.antidoteBox, { borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    <View style={styles.antidoteHeader}>
                      <ShieldCheck size={16} color={corPolaridade} />
                      <Text style={[styles.antidoteTitle, { color: corPolaridade }]}>
                        ANTÍDOTO RECOMENDADO
                      </Text>
                    </View>
                    <Text style={styles.antidoteText}>{carta.antidoto}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* 7. DOIS INDICADORES LADO A LADO */}
            <View style={styles.indicatorsRow}>
              {/* CARGA PSICOLÓGICA */}
              <View style={styles.indicatorCard}>
                <View style={styles.indicatorHeader}>
                  <Activity size={14} color={Colors.cyan} />
                  <Text style={styles.indicatorLabel}>CARGA PSICOLÓGICA</Text>
                </View>
                <Text style={styles.indicatorValue}>{leitura.psychLoad}%</Text>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, Math.max(0, leitura.psychLoad))}%`,
                        backgroundColor:
                          leitura.psychLoad >= 80
                            ? COLOR_BEAR
                            : leitura.psychLoad >= 60
                            ? Colors.amber
                            : leitura.psychLoad >= 40
                            ? Colors.cyan
                            : COLOR_BULL,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* STATUS DE VIÉS */}
              <View style={styles.indicatorCard}>
                <View style={styles.indicatorHeader}>
                  <Compass
                    size={14}
                    color={
                      leitura.biasStatus === 'STABLE_FLOW' ? COLOR_BULL : COLOR_BEAR
                    }
                  />
                  <Text style={styles.indicatorLabel}>STATUS DE VIÉS</Text>
                </View>
                <Text
                  style={[
                    styles.biasStatusValue,
                    {
                      color:
                        leitura.biasStatus === 'STABLE_FLOW'
                          ? COLOR_BULL
                          : COLOR_BEAR,
                    },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatarBiasStatus(leitura.biasStatus)}
                </Text>
                <Text style={styles.biasSubtext}>
                  {formatarDescricaoBias(leitura.biasStatus)}
                </Text>
              </View>
            </View>

            {/* 6. CARD DE PROTOCOLO COM O AVISO DO JSON */}
            <View style={styles.protocolCard}>
              <View style={styles.protocolCardHeader}>
                <ShieldCheck size={16} color={Colors.cyan} />
                <Text style={styles.protocolCardTitle}>PROTOCOLO DE AUTOANÁLISE</Text>
              </View>
              <Text style={styles.protocolCardBody}>{AVISO_LEGAL}</Text>
            </View>
          </View>
        )}

        {/* 8. CONFIGURAÇÃO DE LEMBRETE DIÁRIO (08:00) */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderLeft}>
            <View style={styles.reminderIconWrapper}>
              <Bell size={18} color={Colors.cyan} />
            </View>
            <View style={styles.reminderTextContainer}>
              <Text style={styles.reminderTitle}>Lembrete Diário (08:00)</Text>
              <Text style={styles.reminderSubtitle}>
                Notificação matinal para puxar a carta antes do pregão
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: '#1E2538', true: Colors.cyanDark }}
            thumbColor={lembreteAtivo ? Colors.cyan : '#64748B'}
            onValueChange={handleToggleLembrete}
            value={lembreteAtivo}
            disabled={configurandoLembrete}
          />
        </View>

        {/* HISTÓRICO DE LEITURAS (RECOLHÍVEL) */}
        {historico.length > 0 && (
          <View style={styles.historySection}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.historyToggle}
              onPress={toggleHistorico}
            >
              <Text style={styles.historyToggleText}>
                Histórico Recente ({historico.length} {historico.length === 1 ? 'leitura' : 'leituras'})
              </Text>
              {historicoAberto ? (
                <ChevronUp size={16} color={Colors.textMuted} />
              ) : (
                <ChevronDown size={16} color={Colors.textMuted} />
              )}
            </TouchableOpacity>

            {historicoAberto && (
              <View style={styles.historyList}>
                {(isPremium ? historico.slice(0, 30) : historico.slice(0, 3)).map((item, index) => {
                  const statusColor =
                    item.biasStatus === 'STABLE_FLOW' ? COLOR_BULL : COLOR_BEAR;
                  const cartaInfo = buscarCartaPorId(item.cartaId);
                  return (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyItemLeft}>
                        <Text style={styles.historyItemDate}>{item.data}</Text>
                        <Text style={styles.historyItemId}>
                          {cartaInfo ? cartaInfo.arquetipo.toUpperCase() : item.cartaId.replace(/-/g, ' ').toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.historyItemRight}>
                        <Text style={styles.historyItemLoad}>{item.psychLoad}%</Text>
                        <Text style={[styles.historyItemStatus, { color: statusColor }]}>
                          {formatarBiasStatus(item.biasStatus)}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {!isPremium && (
                  <TouchableOpacity
                    style={styles.historyProCard}
                    onPress={() => openPaywall('Histórico Completo de 90 Dias do Tarot')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.historyProLeft}>
                      <Crown size={15} color="#F59E0B" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyProTitle}>Histórico Completo de 90 Dias</Text>
                        <Text style={styles.historyProDesc}>
                          Assine o Trader PRO para analisar todos os arquétipos e padrões das últimas semanas.
                        </Text>
                      </View>
                    </View>
                    <Lock size={13} color="#F59E0B" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* MODO TESTE (APENAS EM DESENVOLVIMENTO) */}
        {__DEV__ && (
          <View style={styles.devSection}>
            <TouchableOpacity
              style={styles.devResetButton}
              onPress={limparParaTestes}
            >
              <RotateCcw size={14} color={Colors.textMuted} />
              <Text style={styles.devResetButtonText}>Resetar Carta de Hoje (Dev / Teste)</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 24,
  },
  header: {
    marginBottom: Spacing.md,
  },
  eyebrowContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  eyebrowBadge: {
    backgroundColor: 'rgba(31, 169, 56, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(31, 169, 56, 0.4)',
    borderRadius: BorderRadius.xs,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  eyebrowText: {
    color: '#1FA938',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  loadingContainer: {
    height: 360,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
  cardSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  drawButton: {
    backgroundColor: Colors.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: BorderRadius.md,
    marginTop: 8,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  drawButtonText: {
    color: '#0B0E14',
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  revealedSection: {
    width: '100%',
    gap: Spacing.md,
  },
  wisdomCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: Spacing.md,
  },
  wisdomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  wisdomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  wisdomCardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  wisdomText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    lineHeight: 22,
  },
  accordionContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  accordionBody: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: 8,
  },
  sectionSubheading: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 2,
  },
  signalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  signalText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  antidoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.sm + 2,
    marginTop: 6,
  },
  antidoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  antidoteTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  antidoteText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    lineHeight: 19,
  },
  indicatorsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  indicatorCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  indicatorLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  indicatorValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    marginVertical: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#1E2538',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  biasStatusValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    marginVertical: 4,
    letterSpacing: 0.5,
  },
  biasSubtext: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  protocolCard: {
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    padding: Spacing.md,
  },
  protocolCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  protocolCardTitle: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  protocolCardBody: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    gap: 12,
  },
  reminderIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  reminderSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  historySection: {
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  historyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  historyToggleText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  historyList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemDate: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  historyItemId: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    marginTop: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemLoad: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  historyItemStatus: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },
  historyProCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  historyProLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  historyProTitle: {
    color: '#F59E0B',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyProDesc: {
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  devSection: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  devResetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devResetButtonText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
  },
});
