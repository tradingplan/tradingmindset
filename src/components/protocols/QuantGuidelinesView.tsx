import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Card } from '../Card';
import { QUANT_GUIDELINES } from '../../data/protocolsData';
import { GEXRegime, AssetDirective, QuantLevel } from '../../types';
import * as Haptics from 'expo-haptics';
import {
  Compass,
  Layers,
  Activity,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  Target,
  FileText,
} from 'lucide-react-native';

export const QuantGuidelinesView: React.FC = () => {
  const [selectedRegime, setSelectedRegime] = useState<'long_gamma' | 'short_gamma'>('long_gamma');
  const [selectedAsset, setSelectedAsset] = useState<'gold' | 'hk50' | 'sp500'>('gold');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  };

  const toggleCheck = (id: string) => {
    triggerHaptic();
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const currentRegime = QUANT_GUIDELINES.gexRegimes.find((r) => r.id === selectedRegime)!;
  const currentAsset = QUANT_GUIDELINES.assetDirectives.find((a) => a.id === selectedAsset)!;

  const allChecklistCompleted = QUANT_GUIDELINES.checklist.every((item) => checkedItems[item.id]);

  return (
    <View style={styles.container}>
      {/* BANNER FILOSOFIA: CONTEXTO ANTES DE OPINIÃO */}
      <Card variant="glow" style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconBox}>
            <Compass size={24} color={Colors.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroMotto}>"{QUANT_GUIDELINES.motto.toUpperCase()}"</Text>
            <Text style={styles.heroTitle}>{QUANT_GUIDELINES.title}</Text>
          </View>
        </View>
        <Text style={styles.heroText}>{QUANT_GUIDELINES.philosophy.intro}</Text>
        <View style={styles.heroQuoteBox}>
          <Text style={styles.heroQuoteText}>
            💡 <Text style={{ fontWeight: Typography.fontWeight.bold }}>Axioma da Mesa:</Text>{' '}
            {QUANT_GUIDELINES.philosophy.core}
          </Text>
        </View>
      </Card>

      {/* SEÇÃO 1: OS 5 NÍVEIS QUANTITATIVOS */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Layers size={20} color={Colors.cyan} />
          <Text style={styles.sectionTitle}>Os 5 Níveis Quantitativos</Text>
        </View>
        <Text style={styles.sectionSub}>
          O que mapear antes da abertura no seu dashboard (Spot & Futuros).
        </Text>
      </View>

      <View style={styles.levelsList}>
        {QUANT_GUIDELINES.levels.map((level: QuantLevel, idx: number) => (
          <Card key={level.id} style={styles.levelCard}>
            <View style={styles.levelHeaderRow}>
              <View style={[styles.levelBadge, { backgroundColor: `${level.color}20`, borderColor: level.color }]}>
                <Text style={[styles.levelBadgeText, { color: level.color }]}>
                  {idx + 1}. {level.badge}
                </Text>
              </View>
              <Text style={styles.levelName}>{level.name}</Text>
            </View>
            <View style={styles.levelBody}>
              <Text style={styles.levelWhatIs}>
                <Text style={styles.levelLabel}>Definição: </Text>
                {level.whatIs}
              </Text>
              <Text style={styles.levelRole}>
                <Text style={styles.levelLabel}>Papel Operacional: </Text>
                {level.role}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      {/* SEÇÃO 2: OS DOIS REGIMES GEX */}
      <View style={styles.sectionHeaderSpacing}>
        <View style={styles.sectionTitleRow}>
          <Activity size={20} color={Colors.purple} />
          <Text style={styles.sectionTitle}>Regimes de Exposição Gamma (GEX)</Text>
        </View>
        <Text style={styles.sectionSub}>
          A mecânica operacional muda completamente conforme o Net GEX da sessão.
        </Text>
      </View>

      {/* Seletor de Regime */}
      <View style={styles.regimeSelector}>
        <TouchableOpacity
          style={[
            styles.regimeTab,
            selectedRegime === 'long_gamma' && styles.regimeTabActiveLong,
          ]}
          onPress={() => {
            triggerHaptic();
            setSelectedRegime('long_gamma');
          }}
        >
          <Shield size={16} color={selectedRegime === 'long_gamma' ? Colors.emerald : Colors.textMuted} />
          <Text
            style={[
              styles.regimeTabText,
              selectedRegime === 'long_gamma' && styles.regimeTabTextActiveLong,
            ]}
          >
            Contenção (Long Gamma)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.regimeTab,
            selectedRegime === 'short_gamma' && styles.regimeTabActiveShort,
          ]}
          onPress={() => {
            triggerHaptic();
            setSelectedRegime('short_gamma');
          }}
        >
          <Zap size={16} color={selectedRegime === 'short_gamma' ? Colors.crimson : Colors.textMuted} />
          <Text
            style={[
              styles.regimeTabText,
              selectedRegime === 'short_gamma' && styles.regimeTabTextActiveShort,
            ]}
          >
            Aceleração (Short Gamma)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Detalhes do Regime Selecionado */}
      <Card
        variant={selectedRegime === 'long_gamma' ? 'success' : 'danger'}
        style={styles.regimeDetailCard}
      >
        <View style={styles.regimeHeaderRow}>
          <View>
            <Text style={[styles.regimeTitle, { color: currentRegime.color }]}>
              {currentRegime.title}
            </Text>
            <Text style={styles.regimeFormula}>{currentRegime.formula}</Text>
          </View>
          <View
            style={[
              styles.badgePill,
              { backgroundColor: `${currentRegime.color}25`, borderColor: currentRegime.color },
            ]}
          >
            <Text style={[styles.badgePillText, { color: currentRegime.color }]}>
              {currentRegime.badge}
            </Text>
          </View>
        </View>

        <View style={styles.regimeBlock}>
          <Text style={styles.blockLabel}>⚙️ MECÂNICA INSTITUCIONAL</Text>
          <Text style={styles.blockText}>{currentRegime.mechanics}</Text>
        </View>

        <View style={styles.regimeBlock}>
          <Text style={styles.blockLabel}>📊 COMPORTAMENTO DO PREÇO</Text>
          <Text style={styles.blockText}>{currentRegime.priceBehavior}</Text>
        </View>

        {/* Regras Operacionais */}
        <View style={styles.tradeRulesBox}>
          <View style={styles.tradeRuleItem}>
            <View style={styles.tradeRuleHeader}>
              <ArrowUpRight size={18} color={Colors.emerald} />
              <Text style={[styles.tradeRuleTitle, { color: Colors.emerald }]}>Como Comprar</Text>
            </View>
            <Text style={styles.tradeRuleDesc}>{currentRegime.howToBuy}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.tradeRuleItem}>
            <View style={styles.tradeRuleHeader}>
              <ArrowDownRight size={18} color={Colors.crimson} />
              <Text style={[styles.tradeRuleTitle, { color: Colors.crimson }]}>Como Vender</Text>
            </View>
            <Text style={styles.tradeRuleDesc}>{currentRegime.howToSell}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.tradeRuleItem}>
            <View style={styles.tradeRuleHeader}>
              <AlertTriangle size={18} color={Colors.amber} />
              <Text style={[styles.tradeRuleTitle, { color: Colors.amber }]}>Invalidação do Setup</Text>
            </View>
            <Text style={styles.tradeRuleDesc}>{currentRegime.invalidation}</Text>
          </View>
        </View>
      </Card>

      {/* SEÇÃO 3: DIRETRIZES ESPECÍFICAS POR ATIVO */}
      <View style={styles.sectionHeaderSpacing}>
        <View style={styles.sectionTitleRow}>
          <Target size={20} color={Colors.amber} />
          <Text style={styles.sectionTitle}>Diretrizes Específicas por Ativo</Text>
        </View>
        <Text style={styles.sectionSub}>
          Parâmetros operacionais e correlações de cada mercado.
        </Text>
      </View>

      {/* Seletor de Ativo */}
      <View style={styles.assetSelector}>
        {QUANT_GUIDELINES.assetDirectives.map((asset: AssetDirective) => (
          <TouchableOpacity
            key={asset.id}
            style={[
              styles.assetTab,
              selectedAsset === asset.id && styles.assetTabActive,
            ]}
            onPress={() => {
              triggerHaptic();
              setSelectedAsset(asset.id);
            }}
          >
            <Text style={styles.assetFlag}>{asset.flag}</Text>
            <Text
              style={[
                styles.assetTabText,
                selectedAsset === asset.id && styles.assetTabTextActive,
              ]}
            >
              {asset.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.assetCard}>
        <View style={styles.assetCardHeader}>
          <Text style={styles.assetCardTitle}>
            {currentAsset.flag} {currentAsset.name} ({currentAsset.symbol})
          </Text>
        </View>

        <View style={styles.assetSection}>
          <Text style={styles.assetSectionTitle}>🔍 O QUE MONITORAR</Text>
          {currentAsset.whatToLook.map((item: string, idx: number) => (
            <View key={idx} style={styles.assetBulletRow}>
              <Text style={styles.assetBulletDot}>•</Text>
              <Text style={styles.assetBulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.assetSection}>
          <Text style={[styles.assetSectionTitle, { color: Colors.emerald }]}>🟢 QUANDO COMPRAR</Text>
          {currentAsset.whenToBuy.map((item: string, idx: number) => (
            <View key={idx} style={styles.assetBulletRow}>
              <Text style={[styles.assetBulletDot, { color: Colors.emerald }]}>✓</Text>
              <Text style={styles.assetBulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.assetSection}>
          <Text style={[styles.assetSectionTitle, { color: Colors.crimson }]}>🔴 QUANDO VENDER</Text>
          {currentAsset.whenToSell.map((item: string, idx: number) => (
            <View key={idx} style={styles.assetBulletRow}>
              <Text style={[styles.assetBulletDot, { color: Colors.crimson }]}>✕</Text>
              <Text style={styles.assetBulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* SEÇÃO 4: CHECKLIST DIÁRIO DISCIPLINADOR */}
      <View style={styles.sectionHeaderSpacing}>
        <View style={styles.sectionTitleRow}>
          <Shield size={20} color={Colors.emerald} />
          <Text style={styles.sectionTitle}>Checklist Diário Disciplinador</Text>
        </View>
        <Text style={styles.sectionSub}>
          Preencha mentalmente ou clique para validar antes de qualquer clique de mouse.
        </Text>
      </View>

      <Card
        variant={allChecklistCompleted ? 'success' : 'default'}
        style={styles.checklistCard}
      >
        {QUANT_GUIDELINES.checklist.map((item, idx) => {
          const isChecked = !!checkedItems[item.id];
          return (
            <View key={item.id}>
              {idx > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.checkItemRow}
                onPress={() => toggleCheck(item.id)}
                activeOpacity={0.8}
              >
                {isChecked ? (
                  <CheckCircle2 size={24} color={Colors.emerald} />
                ) : (
                  <Circle size={24} color={Colors.textMuted} />
                )}
                <View style={styles.checkTextContainer}>
                  <Text
                    style={[
                      styles.checkTitle,
                      isChecked && { color: Colors.emerald, textDecorationLine: 'none' },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.checkSubtitle}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* REGRA DE OURO */}
        <View style={styles.goldenRuleBox}>
          <AlertTriangle size={20} color={Colors.amber} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.goldenRuleText}>{QUANT_GUIDELINES.goldenRule}</Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  heroCard: {
    marginBottom: Spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.cyan}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMotto: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  heroText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  heroQuoteBox: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: `${Colors.cyan}10`,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.cyan,
  },
  heroQuoteText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionHeaderSpacing: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionSub: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  levelsList: {
    gap: Spacing.sm,
  },
  levelCard: {
    padding: Spacing.md,
  },
  levelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  levelBadgeText: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
  },
  levelName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    flex: 1,
  },
  levelBody: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  levelWhatIs: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  levelRole: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  levelLabel: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
  },
  regimeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  regimeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  regimeTabActiveLong: {
    backgroundColor: `${Colors.emerald}15`,
    borderColor: Colors.emerald,
  },
  regimeTabActiveShort: {
    backgroundColor: `${Colors.crimson}15`,
    borderColor: Colors.crimson,
  },
  regimeTabText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  regimeTabTextActiveLong: {
    color: Colors.emerald,
    fontWeight: Typography.fontWeight.bold,
  },
  regimeTabTextActiveShort: {
    color: Colors.crimson,
    fontWeight: Typography.fontWeight.bold,
  },
  regimeDetailCard: {
    padding: Spacing.md,
  },
  regimeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  regimeTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  regimeFormula: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  badgePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
  },
  regimeBlock: {
    marginBottom: Spacing.md,
  },
  blockLabel: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  blockText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  tradeRulesBox: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tradeRuleItem: {
    gap: 3,
  },
  tradeRuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tradeRuleTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  tradeRuleDesc: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    paddingLeft: Spacing.md + 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  assetSelector: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  assetTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assetTabActive: {
    backgroundColor: `${Colors.cyan}15`,
    borderColor: Colors.cyan,
  },
  assetFlag: {
    fontSize: 14,
  },
  assetTabText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  assetTabTextActive: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  assetCard: {
    padding: Spacing.md,
  },
  assetCardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  assetCardTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  assetSection: {
    marginBottom: Spacing.md,
  },
  assetSectionTitle: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  assetBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  assetBulletDot: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  assetBulletText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    flex: 1,
  },
  checklistCard: {
    padding: Spacing.md,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
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
    lineHeight: 17,
  },
  goldenRuleBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: `${Colors.amber}15`,
    borderColor: Colors.amber,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  goldenRuleText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    fontWeight: Typography.fontWeight.medium,
  },
});
