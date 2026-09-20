import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { Card } from '../components/Card';
import { GoldenRule } from '../types';
import { loadGoldenRules, saveGoldenRules } from '../storage/disciplineStore';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  Award,
  Shield,
  Edit3,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  Flame,
} from 'lucide-react-native';

const MARK_DOUGLAS_TRUTHS = [
  {
    num: 1,
    title: 'Qualquer coisa pode acontecer.',
    desc: 'Basta um único trader no mundo com capital suficiente para mudar a direção do preço.',
  },
  {
    num: 2,
    title: 'Você não precisa saber o que vai acontecer a seguir para ganhar dinheiro.',
    desc: 'O trading é um jogo de probabilidades e expectativas matemáticas positivas ao longo de uma série.',
  },
  {
    num: 3,
    title: 'Existe uma distribuição aleatória entre ganhos e perdas.',
    desc: 'Mesmo com 70% de taxa de acerto, você pode ter 3 losses seguidos sem que seu setup esteja quebrado.',
  },
  {
    num: 4,
    title: 'Uma vantagem (Edge) é apenas uma probabilidade maior.',
    desc: 'Um sinal técnico não é garantia de lucro, é apenas um evento estatístico favorável.',
  },
  {
    num: 5,
    title: 'Todo momento no mercado é absolutamente único.',
    desc: 'Nunca compare o trade atual com o trade anterior. Cada candle possui sua própria dinâmica.',
  },
];

const TENDLER_TILTS = [
  {
    name: 'FOMO Tilt',
    desc: 'Medo de ficar de fora e entrar atrasado no topo ou fundo.',
    antidote: 'O mercado é uma esteira infinita de oportunidades.',
  },
  {
    name: 'Revenge Tilt',
    desc: 'Aumentar o lote após um loss para "recuperar" o dinheiro do mercado.',
    antidote: 'O mercado não te deve nada. Aceite o custo do negócio.',
  },
  {
    name: 'Mistake Tilt',
    desc: 'Ficar furioso com um erro de clique e perder a cabeça.',
    antidote: 'Erros operacionais acontecem. Zere e respire.',
  },
  {
    name: 'Desperation Tilt',
    desc: 'Operar para pagar contas urgentes ou cobrir prejuízos passados.',
    antidote: 'Não opere com o dinheiro da sobrevivência.',
  },
];

export const RulesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topSafeAreaPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20) + Spacing.sm;
  const [goldenRules, setGoldenRules] = useState<GoldenRule[]>([]);
  const [editingRule, setEditingRule] = useState<GoldenRule | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [showOathModal, setShowOathModal] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    const rules = await loadGoldenRules();
    setGoldenRules(rules);
  };

  const openEditModal = (rule: GoldenRule) => {
    setEditingRule(rule);
    setEditTitle(rule.title);
    setEditText(rule.rule);
  };

  const handleSaveRule = async () => {
    if (!editingRule) return;
    const updated = goldenRules.map((r) =>
      r.id === editingRule.id
        ? { ...r, title: editTitle.trim(), rule: editText.trim() }
        : r
    );
    setGoldenRules(updated);
    await saveGoldenRules(updated);
    setEditingRule(null);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleAddRule = async () => {
    const newRule: GoldenRule = {
      id: `rule-${Date.now()}`,
      number: goldenRules.length + 1,
      title: `Lei Inegociável #${goldenRules.length + 1}`,
      rule: 'Defina aqui o parâmetro inquebrável da sua gestão de risco.',
      isCustom: true,
    };
    const updated = [...goldenRules, newRule];
    setGoldenRules(updated);
    await saveGoldenRules(updated);
    openEditModal(newRule);
  };

  const handleDeleteRule = async (id: string) => {
    const updated = goldenRules.filter((r) => r.id !== id);
    setGoldenRules(updated);
    await saveGoldenRules(updated);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: topSafeAreaPadding }]} showsVerticalScrollIndicator={false}>
        {/* Oath Banner */}
        <TouchableOpacity
          style={styles.oathBanner}
          activeOpacity={0.9}
          onPress={() => setShowOathModal(true)}
        >
          <View style={styles.oathIconBox}>
            <Shield size={24} color={Colors.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.oathBannerTitle}>Juramento de Disciplina do Trader</Text>
            <Text style={styles.oathBannerSub}>
              Faça a leitura solene das suas regras antes de ligar o simulador ou a conta real.
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.cyan} />
        </TouchableOpacity>

        {/* SECTION 1: MINHAS LEIS DE OURO */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Award size={20} color={Colors.amber} />
            <Text style={styles.sectionTitle}>Minhas Leis de Ouro Inegociáveis</Text>
          </View>
          <TouchableOpacity style={styles.addRuleBtn} onPress={handleAddRule}>
            <Plus size={14} color={Colors.cyan} />
            <Text style={styles.addRuleBtnText}>Nova Regra</Text>
          </TouchableOpacity>
        </View>

        {goldenRules.map((rule, idx) => (
          <Card key={rule.id} style={styles.ruleCard}>
            <View style={styles.ruleHeaderRow}>
              <View style={styles.ruleNumBadge}>
                <Text style={styles.ruleNumText}>#{idx + 1}</Text>
              </View>
              <Text style={styles.ruleTitleText}>{rule.title}</Text>
              <TouchableOpacity style={styles.ruleActionIcon} onPress={() => openEditModal(rule)}>
                <Edit3 size={16} color={Colors.cyan} />
              </TouchableOpacity>
              {rule.isCustom && (
                <TouchableOpacity
                  style={styles.ruleActionIcon}
                  onPress={() => handleDeleteRule(rule.id)}
                >
                  <Trash2 size={16} color={Colors.crimson} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.ruleBodyText}>{rule.rule}</Text>
          </Card>
        ))}

        {/* SECTION 2: MARK DOUGLAS - 5 FUNDAMENTAL TRUTHS */}
        <View style={styles.sectionHeaderSpacing}>
          <View style={styles.sectionTitleRow}>
            <BookOpen size={20} color={Colors.cyan} />
            <Text style={styles.sectionTitle}>As 5 Verdades de Mark Douglas</Text>
          </View>
          <Text style={styles.sectionSub}>Trading in the Zone • Pilar Psicológico Universal</Text>
        </View>

        {MARK_DOUGLAS_TRUTHS.map((truth) => (
          <Card key={truth.num} style={styles.truthCard}>
            <View style={styles.truthHeaderRow}>
              <View style={styles.truthNumBox}>
                <Text style={styles.truthNumText}>{truth.num}</Text>
              </View>
              <Text style={styles.truthTitle}>{truth.title}</Text>
            </View>
            <Text style={styles.truthDesc}>{truth.desc}</Text>
          </Card>
        ))}

        {/* SECTION 3: JARED TENDLER - MAPA DO TILT */}
        <View style={styles.sectionHeaderSpacing}>
          <View style={styles.sectionTitleRow}>
            <Flame size={20} color={Colors.crimson} />
            <Text style={styles.sectionTitle}>O Mapa do Tilt de Jared Tendler</Text>
          </View>
          <Text style={styles.sectionSub}>The Mental Game of Trading • Diagnóstico de Gatilhos</Text>
        </View>

        <View style={styles.tiltGrid}>
          {TENDLER_TILTS.map((t, idx) => (
            <Card key={idx} variant="danger" style={styles.tiltCard}>
              <Text style={styles.tiltName}>{t.name}</Text>
              <Text style={styles.tiltDesc}>{t.desc}</Text>
              <View style={styles.antidoteBox}>
                <Text style={styles.antidoteTag}>ANTÍDOTO:</Text>
                <Text style={styles.antidoteText}>{t.antidote}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* EDIT RULE MODAL */}
      <Modal visible={editingRule !== null} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Lei de Ouro</Text>

            <Text style={styles.fieldLabel}>Título da Regra</Text>
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Ex: Stop Diário Inegociável"
              placeholderTextColor={Colors.textDisabled}
            />

            <Text style={styles.fieldLabel}>Descrição / Comando Inviolável</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editText}
              onChangeText={setEditText}
              placeholder="Descreva exatamente o que deve ser feito e o que é estritamente proibido..."
              placeholderTextColor={Colors.textDisabled}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditingRule(null)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveRule}>
                <Check size={16} color="#0B0E14" />
                <Text style={styles.modalSaveText}>Salvar Regra</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TRADER OATH FULLSCREEN MODAL */}
      <Modal visible={showOathModal} animationType="fade" transparent={false}>
        <View style={styles.oathFullscreen}>
          <ScrollView contentContainerStyle={styles.oathScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.oathHeader}>
              <Shield size={44} color={Colors.cyan} />
              <Text style={styles.oathMainTitle}>O JURAMENTO DO TRADER</Text>
              <Text style={styles.oathMainSub}>Leitura Obrigatória Pré-Pregão</Text>
            </View>

            <View style={styles.oathPaper}>
              <Text style={styles.oathParagraph}>
                "Eu opero em um ambiente de incerteza matemática absoluta. Não tenho o controle sobre a
                próxima vela, mas tenho <Text style={{ color: Colors.cyan }}>100% de controle sobre meu risco e meu comportamento</Text>."
              </Text>

              <Text style={styles.oathParagraph}>
                "Aceito a perda como uma despesa necessária de operação. Jamais violarei meu stop loss,
                jamais operarei por tédio e jamais permitirei que o ego destrua meu capital."
              </Text>

              <Text style={styles.oathParagraph}>
                "Sou um executor cirúrgico de probabilidades. Quando meu setup se confirma, executo sem medo.
                Quando o mercado se encerra, desligo a plataforma em paz."
              </Text>

              <View style={styles.oathRulesList}>
                <Text style={styles.oathRulesHeader}>MINHAS REGRAS HOJE:</Text>
                {goldenRules.map((r, i) => (
                  <Text key={r.id} style={styles.oathRuleLine}>
                    {i + 1}. <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{r.title}:</Text> {r.rule}
                  </Text>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.oathAcceptBtn}
              onPress={() => setShowOathModal(false)}
            >
              <Check size={20} color="#0B0E14" />
              <Text style={styles.oathAcceptText}>JURAMENTO FIRMADO • PRONTO PARA O PREGÃO</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 150,
  },
  oathBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cyanDark,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  oathIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  oathBannerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  oathBannerSub: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionHeaderSpacing: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionSub: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  addRuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.cyanDark,
    gap: 4,
  },
  addRuleBtnText: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  ruleCard: {
    marginBottom: Spacing.sm,
  },
  ruleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ruleNumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.amberDark,
  },
  ruleNumText: {
    color: Colors.amber,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  ruleTitleText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  ruleActionIcon: {
    padding: 4,
  },
  ruleBodyText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  truthCard: {
    marginBottom: Spacing.sm,
  },
  truthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  truthNumBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cyanDark,
  },
  truthNumText: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  truthTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  truthDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    marginLeft: 34,
  },
  tiltGrid: {
    gap: Spacing.sm,
  },
  tiltCard: {
    marginBottom: 2,
  },
  tiltName: {
    color: Colors.crimson,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  tiltDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 16,
    marginBottom: 6,
  },
  antidoteBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    padding: 6,
  },
  antidoteTag: {
    color: Colors.emerald,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  antidoteText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  modalTextArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  modalSaveBtn: {
    backgroundColor: Colors.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  modalSaveText: {
    color: '#0B0E14',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  oathFullscreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  oathScroll: {
    padding: Spacing.lg,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  oathHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  oathMainTitle: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 2,
    marginTop: Spacing.sm,
  },
  oathMainSub: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    letterSpacing: 1,
    marginTop: 2,
  },
  oathPaper: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.xl,
  },
  oathParagraph: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    lineHeight: 26,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  oathRulesList: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  oathRulesHeader: {
    color: Colors.amber,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  oathRuleLine: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 20,
    marginBottom: 6,
  },
  oathAcceptBtn: {
    backgroundColor: Colors.cyan,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  oathAcceptText: {
    color: '#0B0E14',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.5,
  },
});
