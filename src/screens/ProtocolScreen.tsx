import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import {
  loadTodayProtocol,
  saveProtocol,
  calculateDisciplineScore,
  getDisciplineHistory,
} from '../storage/disciplineStore';
import { DailyProtocolState, HistoryDayScore, ProtocolSubTab } from '../types';
import * as Haptics from 'expo-haptics';
import {
  CheckCircle2,
  Circle,
  Crosshair,
  Sunrise,
  Moon,
  AlertTriangle,
  Flame,
  Star,
  Check,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Compass,
  Award,
  Layers,
} from 'lucide-react-native';
import { QuantGuidelinesView } from '../components/protocols/QuantGuidelinesView';
import { GoldExpertManualView } from '../components/protocols/GoldExpertManualView';

export const ProtocolScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProtocolSubTab>('pre');
  const [protocol, setProtocol] = useState<DailyProtocolState | null>(null);
  const [history, setHistory] = useState<HistoryDayScore[]>([]);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await loadTodayProtocol();
    setProtocol(data);
    const hist = await getDisciplineHistory();
    setHistory(hist);
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  };

  const handleTabChange = (tab: ProtocolSubTab) => {
    triggerHaptic();
    setActiveTab(tab);
  };

  if (!protocol) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando protocolo de disciplina...</Text>
      </View>
    );
  }

  const currentScore = calculateDisciplineScore(
    protocol.preMarket,
    protocol.sniperCheck,
    protocol.postMarket
  );

  const updatePre = (fields: Partial<DailyProtocolState['preMarket']>) => {
    triggerHaptic();
    const updated = {
      ...protocol,
      preMarket: { ...protocol.preMarket, ...fields },
    };
    const newScore = calculateDisciplineScore(
      updated.preMarket,
      updated.sniperCheck,
      updated.postMarket
    );
    updated.postMarket.disciplineScore = newScore;
    setProtocol(updated);
    saveProtocol(updated);
  };

  const updateSniper = (fields: Partial<DailyProtocolState['sniperCheck']>) => {
    triggerHaptic();
    const updated = {
      ...protocol,
      sniperCheck: { ...protocol.sniperCheck, ...fields },
    };
    const newScore = calculateDisciplineScore(
      updated.preMarket,
      updated.sniperCheck,
      updated.postMarket
    );
    updated.postMarket.disciplineScore = newScore;
    setProtocol(updated);
    saveProtocol(updated);
  };

  const updatePost = (fields: Partial<DailyProtocolState['postMarket']>) => {
    triggerHaptic();
    const updated = {
      ...protocol,
      postMarket: { ...protocol.postMarket, ...fields },
    };
    const newScore = calculateDisciplineScore(
      updated.preMarket,
      updated.sniperCheck,
      updated.postMarket
    );
    updated.postMarket.disciplineScore = newScore;
    setProtocol(updated);
    saveProtocol(updated);
  };

  const handleSaveProtocol = async () => {
    if (!protocol) return;
    await saveProtocol(protocol);
    setIsSavedRecently(true);
    const hist = await getDisciplineHistory();
    setHistory(hist);
    setTimeout(() => setIsSavedRecently(false), 3000);
    if (Platform.OS === 'web') {
      // alert on web if needed
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const sniperAllApproved =
    protocol.sniperCheck.candleClosed &&
    protocol.sniperCheck.technicalStopDefined &&
    protocol.sniperCheck.riskRewardFavorable;

  return (
    <View style={styles.container}>
      <Header
        score={currentScore}
        onNavigateToTarget={(target) => {
          if (target === 'protocol_pre') handleTabChange('pre');
          else if (target === 'protocol_post') handleTabChange('post');
        }}
      />

      {/* Protocol Sub-tabs Navigation (Horizontal Scrollable) */}
      <View style={styles.subTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabsContainer}
        >
          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'pre' && styles.subTabBtnActivePre]}
            onPress={() => handleTabChange('pre')}
          >
            <Sunrise size={15} color={activeTab === 'pre' ? Colors.cyan : Colors.textMuted} />
            <Text style={[styles.subTabText, activeTab === 'pre' && styles.subTabTextActivePre]}>
              Pré-Mercado
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'sniper' && styles.subTabBtnActiveSniper]}
            onPress={() => handleTabChange('sniper')}
          >
            <Crosshair size={15} color={activeTab === 'sniper' ? Colors.emerald : Colors.textMuted} />
            <Text style={[styles.subTabText, activeTab === 'sniper' && styles.subTabTextActiveSniper]}>
              Sniper Entry
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'post' && styles.subTabBtnActivePost]}
            onPress={() => handleTabChange('post')}
          >
            <Moon size={15} color={activeTab === 'post' ? Colors.purple : Colors.textMuted} />
            <Text style={[styles.subTabText, activeTab === 'post' && styles.subTabTextActivePost]}>
              Pós-Mercado
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'diretrizes' && styles.subTabBtnActiveDiretrizes]}
            onPress={() => handleTabChange('diretrizes')}
          >
            <Compass size={15} color={activeTab === 'diretrizes' ? Colors.cyan : Colors.textMuted} />
            <Text style={[styles.subTabText, activeTab === 'diretrizes' && styles.subTabTextActiveDiretrizes]}>
              Diretrizes Quant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'gold' && styles.subTabBtnActiveGold]}
            onPress={() => handleTabChange('gold')}
          >
            <Award size={15} color={activeTab === 'gold' ? Colors.amber : Colors.textMuted} />
            <Text style={[styles.subTabText, activeTab === 'gold' && styles.subTabTextActiveGold]}>
              Gold Perito
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'history' && styles.subTabBtnActiveHistory]}
            onPress={() => handleTabChange('history')}
          >
            <TrendingUp size={15} color={activeTab === 'history' ? Colors.amber : Colors.textMuted} />
            <Text style={[styles.subTabText, activeTab === 'history' && styles.subTabTextActiveHistory]}>
              Histórico
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>


      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TAB 1: PRÉ-MERCADO */}
        {activeTab === 'pre' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Sunrise size={20} color={Colors.cyan} />
                <Text style={styles.sectionTitle}>Checklist de Blindagem Matinal</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Prepare seu estado físico e psicológico antes de abrir a plataforma.
              </Text>
            </View>

            {/* Sono & Energia */}
            <Card style={styles.cardSpacing}>
              <Text style={styles.cardLabel}>1. QUALIDADE DO SONO & ENERGIA</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={styles.starBtn}
                    onPress={() => updatePre({ sleepQuality: star })}
                  >
                    <Star
                      size={26}
                      color={star <= protocol.preMarket.sleepQuality ? Colors.amber : Colors.textDisabled}
                      fill={star <= protocol.preMarket.sleepQuality ? Colors.amber : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
                <Text style={styles.starStatusText}>
                  {protocol.preMarket.sleepQuality >= 4
                    ? 'Ótima Disposição'
                    : protocol.preMarket.sleepQuality === 3
                    ? 'Atenção Redobrada'
                    : 'Risco de Fadiga (Opere Leve)'}
                </Text>
              </View>
            </Card>

            {/* Estado Emocional */}
            <Card style={styles.cardSpacing}>
              <Text style={styles.cardLabel}>2. ESTADO EMOCIONAL PREDOMINANTE</Text>
              <View style={styles.emotionPillsContainer}>
                {(['Calmo', 'Focado', 'Ansioso', 'Cansado', 'Eufórico'] as const).map((emotion) => (
                  <TouchableOpacity
                    key={emotion}
                    style={[
                      styles.emotionPill,
                      protocol.preMarket.emotionalState === emotion && styles.emotionPillActive,
                    ]}
                    onPress={() => updatePre({ emotionalState: emotion })}
                  >
                    <Text
                      style={[
                        styles.emotionPillText,
                        protocol.preMarket.emotionalState === emotion && styles.emotionPillTextActive,
                      ]}
                    >
                      {emotion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Notícias e Risco */}
            <Card style={styles.cardSpacing}>
              <Text style={styles.cardLabel}>3. GESTÃO DE RISCO & NOTÍCIAS</Text>

              {/* Checou notícias */}
              <TouchableOpacity
                style={styles.checkItemRow}
                onPress={() => updatePre({ checkedNews: !protocol.preMarket.checkedNews })}
              >
                {protocol.preMarket.checkedNews ? (
                  <CheckCircle2 size={22} color={Colors.emerald} />
                ) : (
                  <Circle size={22} color={Colors.textMuted} />
                )}
                <View style={styles.checkTextContainer}>
                  <Text style={styles.checkTitle}>Calendário Econômico Verificado</Text>
                  <Text style={styles.checkSubtitle}>
                    Conheço os horários de volatilidade (Payroll, Taxa de Juros, CPI).
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.inputsRow}>
                <View style={styles.inputFieldBox}>
                  <Text style={styles.inputLabel}>Limite de Loss Diário</Text>
                  <TextInput
                    style={styles.textInput}
                    value={protocol.preMarket.maxLossValue}
                    onChangeText={(val) => updatePre({ maxLossValue: val })}
                    placeholder="Ex: R$ 300,00"
                    placeholderTextColor={Colors.textDisabled}
                  />
                </View>
                <View style={styles.inputFieldBox}>
                  <Text style={styles.inputLabel}>Meta de Lucro / Alvo</Text>
                  <TextInput
                    style={styles.textInput}
                    value={protocol.preMarket.targetProfitValue}
                    onChangeText={(val) => updatePre({ targetProfitValue: val })}
                    placeholder="Ex: R$ 600,00"
                    placeholderTextColor={Colors.textDisabled}
                  />
                </View>
              </View>
            </Card>

            {/* Compromisso Mental */}
            <Card variant="glow" style={styles.cardSpacing}>
              <TouchableOpacity
                style={styles.checkItemRow}
                onPress={() => updatePre({ commitmentAffirmed: !protocol.preMarket.commitmentAffirmed })}
              >
                {protocol.preMarket.commitmentAffirmed ? (
                  <CheckCircle2 size={24} color={Colors.cyan} />
                ) : (
                  <Circle size={24} color={Colors.textMuted} />
                )}
                <View style={styles.checkTextContainer}>
                  <Text style={[styles.checkTitle, { color: Colors.cyan }]}>
                    JURAMENTO DO TRADER DISCIPLINADO
                  </Text>
                  <Text style={styles.checkSubtitle}>
                    "Aceito o risco do mercado como uma certeza estatística. Não hesitarei em executar o
                    setup nem moverei meu stop."
                  </Text>
                </View>
              </TouchableOpacity>
            </Card>

            {/* Quick Access to Protocols */}
            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessLabel}>MANUAIS & DIRETRIZES DE SUPORTE</Text>
              <View style={styles.quickAccessRow}>
                <TouchableOpacity
                  style={styles.quickAccessBtn}
                  onPress={() => handleTabChange('diretrizes')}
                  activeOpacity={0.8}
                >
                  <Compass size={18} color={Colors.cyan} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickAccessBtnTitle}>Diretrizes Quant</Text>
                    <Text style={styles.quickAccessBtnSub}>Walls, GEX & Regimes</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.cyan} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAccessBtn}
                  onPress={() => handleTabChange('gold')}
                  activeOpacity={0.8}
                >
                  <Award size={18} color={Colors.amber} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickAccessBtnTitle}>Gold Perito</Text>
                    <Text style={styles.quickAccessBtnSub}>Manual Institucional</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.amber} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: SNIPER ENTRY VALIDATOR */}
        {activeTab === 'sniper' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Crosshair size={20} color={Colors.emerald} />
                <Text style={styles.sectionTitle}>Validador de Entrada (Sniper Check)</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Valide as 3 perguntas inegociáveis antes de clicar na plataforma.
              </Text>
            </View>

            {/* Status Card */}
            <Card
              variant={sniperAllApproved ? 'success' : 'danger'}
              style={[styles.cardSpacing, styles.sniperStatusCard]}
            >
              <View style={styles.sniperStatusHeader}>
                {sniperAllApproved ? (
                  <ShieldCheck size={28} color={Colors.emerald} />
                ) : (
                  <AlertTriangle size={28} color={Colors.crimson} />
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.sniperStatusTitle,
                      { color: sniperAllApproved ? Colors.emerald : Colors.crimson },
                    ]}
                  >
                    {sniperAllApproved ? 'ORDEM AUTORIZADA (SNIPER)' : 'NÃO CLIQUE NO MOUSE'}
                  </Text>
                  <Text style={styles.sniperStatusDesc}>
                    {sniperAllApproved
                      ? 'Todos os critérios técnicos e de risco foram confirmados.'
                      : 'Aguarde todos os requisitos do checklist se cumprirem.'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* As 3 Perguntas Inegociáveis */}
            <Card style={styles.cardSpacing}>
              <Text style={styles.cardLabel}>AS 3 REGRAS DE OURO DA ENTRADA</Text>

              {/* Pergunta 1 */}
              <TouchableOpacity
                style={styles.checkItemRow}
                onPress={() => updateSniper({ candleClosed: !protocol.sniperCheck.candleClosed })}
              >
                {protocol.sniperCheck.candleClosed ? (
                  <CheckCircle2 size={24} color={Colors.emerald} />
                ) : (
                  <Circle size={24} color={Colors.textMuted} />
                )}
                <View style={styles.checkTextContainer}>
                  <Text style={styles.checkTitle}>1. O candle fechou confirmando o sinal?</Text>
                  <Text style={styles.checkSubtitle}>
                    Sem antecipação por ansiedade. Aguarde o fechamento do período gráfico.
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Pergunta 2 */}
              <TouchableOpacity
                style={styles.checkItemRow}
                onPress={() =>
                  updateSniper({ technicalStopDefined: !protocol.sniperCheck.technicalStopDefined })
                }
              >
                {protocol.sniperCheck.technicalStopDefined ? (
                  <CheckCircle2 size={24} color={Colors.emerald} />
                ) : (
                  <Circle size={24} color={Colors.textMuted} />
                )}
                <View style={styles.checkTextContainer}>
                  <Text style={styles.checkTitle}>2. O Stop Técnico está definido e cabe na gestão?</Text>
                  <Text style={styles.checkSubtitle}>
                    Posicionado atrás de suporte/resistência estrutural e com valor aceito.
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Pergunta 3 */}
              <TouchableOpacity
                style={styles.checkItemRow}
                onPress={() =>
                  updateSniper({ riskRewardFavorable: !protocol.sniperCheck.riskRewardFavorable })
                }
              >
                {protocol.sniperCheck.riskRewardFavorable ? (
                  <CheckCircle2 size={24} color={Colors.emerald} />
                ) : (
                  <Circle size={24} color={Colors.textMuted} />
                )}
                <View style={styles.checkTextContainer}>
                  <Text style={styles.checkTitle}>3. Relação Risco/Retorno compensa (mínimo 2:1)?</Text>
                  <Text style={styles.checkSubtitle}>
                    O alvo do trade compensa a exposição matemática ao risco assumido.
                  </Text>
                </View>
              </TouchableOpacity>
            </Card>

            {/* Contador de Trades da Sessão */}
            <Card style={styles.cardSpacing}>
              <View style={styles.tradesCounterRow}>
                <View>
                  <Text style={styles.cardLabel}>TRADES EXECUTADOS HOJE</Text>
                  <Text style={styles.counterDesc}>Evite overtrading (Máximo sugerido: 3 a 4)</Text>
                </View>
                <View style={styles.counterControl}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() =>
                      updateSniper({
                        tradesExecutedToday: Math.max(0, protocol.sniperCheck.tradesExecutedToday - 1),
                      })
                    }
                  >
                    <Text style={styles.counterBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterVal}>{protocol.sniperCheck.tradesExecutedToday}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() =>
                      updateSniper({
                        tradesExecutedToday: protocol.sniperCheck.tradesExecutedToday + 1,
                      })
                    }
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>

            {/* Quick Consultation */}
            <TouchableOpacity
              style={styles.sniperConsultBox}
              onPress={() => handleTabChange('diretrizes')}
              activeOpacity={0.8}
            >
              <Compass size={18} color={Colors.cyan} />
              <Text style={styles.sniperConsultText}>
                Checar se o preço está próximo de Put Wall ou Call Wall nas <Text style={{ fontWeight: Typography.fontWeight.bold, color: Colors.cyan }}>Diretrizes Quant</Text>
              </Text>
              <ChevronRight size={16} color={Colors.cyan} />
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: PÓS-MERCADO & AUDITORIA */}
        {activeTab === 'post' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Moon size={20} color={Colors.purple} />
                <Text style={styles.sectionTitle}>Auditoria de Pós-Mercado</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Avalie sua disciplina com honestidade radical para consolidar o score do dia.
              </Text>
            </View>

            {/* Checklist de Respeito às Regras */}
            <Card style={styles.cardSpacing}>
              <Text style={styles.cardLabel}>AUDITORIA DE EXECUÇÃO</Text>

              {/* Respeitou stop */}
              <TouchableOpacity
                style={styles.checkItemRow}
                onPress={() =>
                  updatePost({ respectedMaxLoss: !protocol.postMarket.respectedMaxLoss })
                }
              >
                {protocol.postMarket.respectedMaxLoss ? (
                  <CheckCircle2 size={22} color={Colors.emerald} />
                ) : (
                  <Circle size={22} color={Colors.crimson} />
                )}
                <View style={styles.checkTextContainer}>
                  <Text style={styles.checkTitle}>Respeitou o Limite de Perda Diária</Text>
                  <Text style={styles.checkSubtitle}>Não aumentou a mão nem operou em tilt.</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Parou no horário */}
              <TouchableOpacity
                style={styles.checkItemRow}
                onPress={() =>
                  updatePost({ stoppedOnTimeOrTarget: !protocol.postMarket.stoppedOnTimeOrTarget })
                }
              >
                {protocol.postMarket.stoppedOnTimeOrTarget ? (
                  <CheckCircle2 size={22} color={Colors.emerald} />
                ) : (
                  <Circle size={22} color={Colors.crimson} />
                )}
                <View style={styles.checkTextContainer}>
                  <Text style={styles.checkTitle}>Fechou a Plataforma no Horário / Meta</Text>
                  <Text style={styles.checkSubtitle}>Não devolveu ganhos por tédio ou ganância.</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Não teve impulsividade */}
              <TouchableOpacity
                style={styles.checkItemRow}
                onPress={() =>
                  updatePost({ hadImpulsiveTrades: !protocol.postMarket.hadImpulsiveTrades })
                }
              >
                {!protocol.postMarket.hadImpulsiveTrades ? (
                  <CheckCircle2 size={22} color={Colors.emerald} />
                ) : (
                  <Circle size={22} color={Colors.crimson} />
                )}
                <View style={styles.checkTextContainer}>
                  <Text style={styles.checkTitle}>Zero Trades por FOMO ou Vingança</Text>
                  <Text style={styles.checkSubtitle}>Todas as ordens tiveram embasamento técnico.</Text>
                </View>
              </TouchableOpacity>
            </Card>

            {/* Diário de Bordo / Nota Mental */}
            <Card style={styles.cardSpacing}>
              <Text style={styles.cardLabel}>DIÁRIO DE BORDO & NOTA MENTAL</Text>
              <TextInput
                style={styles.textArea}
                value={protocol.postMarket.mentalNote}
                onChangeText={(val) => updatePost({ mentalNote: val })}
                placeholder="O que você aprendeu com suas decisões hoje? Como lidou com suas emoções durante a sessão?"
                placeholderTextColor={Colors.textDisabled}
                multiline
                numberOfLines={4}
              />
            </Card>

            {/* Botão de Gravar Dia */}
            <TouchableOpacity
              style={[styles.saveButton, isSavedRecently && styles.saveButtonSuccess]}
              onPress={handleSaveProtocol}
            >
              {isSavedRecently ? (
                <>
                  <Check size={20} color="#0B0E14" />
                  <Text style={styles.saveButtonText}>PROTOCOLO CONSOLIDADO COM SUCESSO</Text>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} color="#0B0E14" />
                  <Text style={styles.saveButtonText}>GRAVAR AUDITORIA DO DIA ({currentScore}%)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 4: DIRETRIZES QUANT */}
        {activeTab === 'diretrizes' && (
          <View style={styles.tabContent}>
            <QuantGuidelinesView />
          </View>
        )}

        {/* TAB 5: GOLD PERITO OPERACIONAL */}
        {activeTab === 'gold' && (
          <View style={styles.tabContent}>
            <GoldExpertManualView />
          </View>
        )}

        {/* TAB 6: HISTÓRICO & DIÁRIO */}
        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <TrendingUp size={20} color={Colors.amber} />
                <Text style={styles.sectionTitle}>Histórico de Consistência & Disciplina</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Acompanhe a sua evolução diária. A consistência é construída um dia de cada vez.
              </Text>
            </View>

            {/* List of past days */}
            {history.map((day, idx) => (
              <Card key={idx} style={styles.cardSpacing}>
                <View style={styles.historyRow}>
                  <View>
                    <Text style={styles.historyDate}>{day.date}</Text>
                    <Text style={styles.historySub}>
                      {day.tradesCount} trades executados • {day.violationsCount === 0 ? 'Sem violações' : `${day.violationsCount} desvios`}
                    </Text>
                  </View>
                  <View style={styles.historyScoreBox}>
                    <Text
                      style={[
                        styles.historyScoreVal,
                        { color: day.score >= 80 ? Colors.emerald : Colors.amber },
                      ]}
                    >
                      {day.score}%
                    </Text>
                    <Text style={styles.historyScoreTag}>DISCIPLINA</Text>
                  </View>
                </View>
                {day.notes ? (
                  <View style={styles.historyNoteBox}>
                    <Text style={styles.historyNoteText}>"{day.notes}"</Text>
                  </View>
                ) : null}
              </Card>
            ))}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
  subTabsWrapper: {
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabBtnActivePre: {
    borderBottomColor: Colors.cyan,
  },
  subTabBtnActiveSniper: {
    borderBottomColor: Colors.emerald,
  },
  subTabBtnActivePost: {
    borderBottomColor: Colors.purple,
  },
  subTabBtnActiveDiretrizes: {
    borderBottomColor: Colors.cyan,
  },
  subTabBtnActiveGold: {
    borderBottomColor: Colors.amber,
  },
  subTabBtnActiveHistory: {
    borderBottomColor: Colors.amber,
  },
  subTabText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  subTabTextActivePre: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  subTabTextActiveSniper: {
    color: Colors.emerald,
    fontWeight: Typography.fontWeight.bold,
  },
  subTabTextActivePost: {
    color: Colors.purple,
    fontWeight: Typography.fontWeight.bold,
  },
  subTabTextActiveDiretrizes: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  subTabTextActiveGold: {
    color: Colors.amber,
    fontWeight: Typography.fontWeight.bold,
  },
  subTabTextActiveHistory: {
    color: Colors.amber,
    fontWeight: Typography.fontWeight.bold,
  },
  quickAccessSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickAccessLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAccessBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    backgroundColor: Colors.card,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAccessBtnTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  quickAccessBtnSub: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs - 2,
    marginTop: 1,
  },
  sniperConsultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.cyan}10`,
    borderWidth: 1,
    borderColor: `${Colors.cyan}40`,
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  sniperConsultText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    flex: 1,
  },

  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 150,
  },
  tabContent: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  cardSpacing: {
    marginBottom: Spacing.md,
  },
  cardLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starBtn: {
    padding: 2,
  },
  starStatusText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginLeft: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  emotionPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emotionPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: Colors.cyan,
  },
  emotionPillText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  emotionPillTextActive: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 6,
  },
  checkTextContainer: {
    flex: 1,
  },
  checkTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: 2,
  },
  checkSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 16,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  inputFieldBox: {
    flex: 1,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
  },
  textArea: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: 10,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  sniperStatusCard: {
    padding: Spacing.md,
  },
  sniperStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sniperStatusTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sniperStatusDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
  },
  tradesCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  counterVal: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    minWidth: 20,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: Colors.emerald,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    shadowColor: Colors.emerald,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saveButtonSuccess: {
    backgroundColor: Colors.cyan,
  },
  saveButtonText: {
    color: '#0B0E14',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.5,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  historySub: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  historyScoreBox: {
    alignItems: 'flex-end',
  },
  historyScoreVal: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extraBold,
  },
  historyScoreTag: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
  },
  historyNoteBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  historyNoteText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
