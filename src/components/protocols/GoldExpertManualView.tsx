import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { Card } from '../Card';
import { GOLD_MANUAL_PARTS } from '../../data/protocolsData';
import { GoldManualPart, GoldManualChapter } from '../../types';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  CheckCircle,
  HelpCircle,
  Clock,
  Flame,
  Award,
} from 'lucide-react-native';

export const GoldExpertManualView: React.FC = () => {
  const [selectedPartId, setSelectedPartId] = useState<string>('parte_1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'cap_1_1': true,
  });

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  };

  const toggleChapter = (chapterId: string) => {
    triggerHaptic();
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const activePart = GOLD_MANUAL_PARTS.find((p) => p.id === selectedPartId) || GOLD_MANUAL_PARTS[0];

  // Filtering based on search query
  const isSearching = searchQuery.trim().length > 0;
  const filteredParts = isSearching
    ? GOLD_MANUAL_PARTS.map((part) => {
        const matchingChapters = part.chapters.filter((chap) => {
          const q = searchQuery.toLowerCase();
          const inTitle = chap.title.toLowerCase().includes(q);
          const inSummary = chap.summary.toLowerCase().includes(q);
          const inTakeaways = chap.keyTakeaways.some((t) => t.toLowerCase().includes(q));
          const inSections = chap.contentSections.some(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              (s.text && s.text.toLowerCase().includes(q)) ||
              (s.callout?.text && s.callout.text.toLowerCase().includes(q))
          );
          return inTitle || inSummary || inTakeaways || inSections;
        });
        return {
          ...part,
          chapters: matchingChapters,
        };
      }).filter((part) => part.chapters.length > 0)
    : [activePart];

  return (
    <View style={styles.container}>
      {/* HEADER BANNER */}
      <Card variant="glow" style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconBox}>
            <Award size={26} color={Colors.amber} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTag}>TRADING PLAN CLUB • EDIÇÃO 2026</Text>
            <Text style={styles.heroTitle}>Gold Perito Operacional</Text>
          </View>
        </View>
        <Text style={styles.heroDesc}>
          Da leitura macro à microestrutura de opções: o método completo para operar o Ouro (GC / XAUUSD)
          com a inteligência de uma mesa quantitativa institucional.
        </Text>
      </Card>

      {/* SEARCH BAR */}
      <View style={styles.searchBarContainer}>
        <Search size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar no manual (ex: GEX, COT, 0DTE, Volume Profile)..."
          placeholderTextColor={Colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearSearchText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PART SELECTOR (When not searching) */}
      {!isSearching && (
        <View style={styles.partSelector}>
          {GOLD_MANUAL_PARTS.map((part: GoldManualPart) => {
            const isActive = part.id === selectedPartId;
            return (
              <TouchableOpacity
                key={part.id}
                style={[styles.partTab, isActive && styles.partTabActive]}
                onPress={() => {
                  triggerHaptic();
                  setSelectedPartId(part.id);
                }}
              >
                <Text style={[styles.partTabNumber, isActive && styles.partTabNumberActive]}>
                  {part.number}
                </Text>
                <Text
                  style={[styles.partTabTitle, isActive && styles.partTabTitleActive]}
                  numberOfLines={1}
                >
                  {part.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* PART OVERVIEW CARD (When not searching) */}
      {!isSearching && (
        <Card style={styles.partOverviewCard}>
          <Text style={styles.partNumberTag}>{activePart.number.toUpperCase()}</Text>
          <Text style={styles.partTitle}>{activePart.title}</Text>
          <Text style={styles.partSubtitle}>{activePart.subtitle}</Text>

          <View style={styles.dominationBox}>
            <Text style={styles.dominationTitle}>🎯 O QUE VOCÊ DOMINA NESTA PARTE:</Text>
            {activePart.dominationPoints.map((point: string, idx: number) => (
              <View key={idx} style={styles.dominationItem}>
                <CheckCircle size={14} color={Colors.cyan} style={{ marginTop: 2 }} />
                <Text style={styles.dominationText}>{point}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* CHAPTERS LIST */}
      <View style={styles.chaptersList}>
        {filteredParts.map((part) => (
          <View key={part.id} style={{ gap: Spacing.sm }}>
            {isSearching && (
              <View style={styles.searchPartHeader}>
                <Text style={styles.searchPartHeaderText}>
                  {part.number}: {part.title} ({part.chapters.length} capítulos encontrados)
                </Text>
              </View>
            )}

            {part.chapters.map((chapter: GoldManualChapter) => {
              const isExpanded = !!expandedChapters[chapter.id] || isSearching;
              return (
                <Card key={chapter.id} style={styles.chapterCard}>
                  {/* CHAPTER ACCORDION HEADER */}
                  <TouchableOpacity
                    style={styles.chapterHeader}
                    onPress={() => toggleChapter(chapter.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.chapterNumBox}>
                      <Text style={styles.chapterNumText}>Cap. {chapter.chapterNumber}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.chapterTitle}>{chapter.title}</Text>
                      <Text style={styles.chapterSummary} numberOfLines={isExpanded ? undefined : 2}>
                        {chapter.summary}
                      </Text>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} color={Colors.cyan} />
                    ) : (
                      <ChevronDown size={20} color={Colors.textMuted} />
                    )}
                  </TouchableOpacity>

                  {/* EXPANDED CONTENT */}
                  {isExpanded && (
                    <View style={styles.chapterContent}>
                      {/* KEY TAKEAWAYS */}
                      <View style={styles.takeawaysBox}>
                        <Text style={styles.takeawaysTitle}>⚡ PONTOS-CHAVE INEGOCIÁVEIS</Text>
                        {chapter.keyTakeaways.map((takeaway: string, idx: number) => (
                          <View key={idx} style={styles.takeawayItem}>
                            <Text style={styles.takeawayDot}>▸</Text>
                            <Text style={styles.takeawayText}>{takeaway}</Text>
                          </View>
                        ))}
                      </View>

                      {/* SECTIONS */}
                      {chapter.contentSections.map((sec, sIdx: number) => (
                        <View key={sIdx} style={styles.sectionBlock}>
                          <Text style={styles.sectionBlockTitle}>{sec.title}</Text>
                          {sec.text ? <Text style={styles.sectionBlockText}>{sec.text}</Text> : null}

                          {/* OPTIONAL TABLE */}
                          {sec.table && (
                            <View style={styles.tableContainer}>
                              <View style={styles.tableHeaderRow}>
                                {sec.table.headers.map((h: string, hIdx: number) => (
                                  <Text
                                    key={hIdx}
                                    style={[
                                      styles.tableHeaderText,
                                      { flex: hIdx === 0 ? 1.2 : 2 },
                                    ]}
                                  >
                                    {h}
                                  </Text>
                                ))}
                              </View>
                              {sec.table.rows.map((row: string[], rIdx: number) => (
                                <View
                                  key={rIdx}
                                  style={[
                                    styles.tableRow,
                                    rIdx % 2 === 1 && styles.tableRowAlt,
                                  ]}
                                >
                                  {row.map((cell: string, cIdx: number) => (
                                    <Text
                                      key={cIdx}
                                      style={[
                                        styles.tableCellText,
                                        { flex: cIdx === 0 ? 1.2 : 2 },
                                        cIdx === 0 && { fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
                                      ]}
                                    >
                                      {cell}
                                    </Text>
                                  ))}
                                </View>
                              ))}
                            </View>
                          )}

                          {/* OPTIONAL CALLOUT */}
                          {sec.callout && (
                            <View
                              style={[
                                styles.calloutBox,
                                sec.callout.type === 'concept' && styles.calloutConcept,
                                sec.callout.type === 'warning' && styles.calloutWarning,
                                sec.callout.type === 'gold_analyst' && styles.calloutAnalyst,
                                sec.callout.type === 'case_study' && styles.calloutCase,
                              ]}
                            >
                              <View style={styles.calloutHeader}>
                                {sec.callout.type === 'concept' && <Lightbulb size={16} color={Colors.cyan} />}
                                {sec.callout.type === 'warning' && <AlertTriangle size={16} color={Colors.crimson} />}
                                {sec.callout.type === 'gold_analyst' && <Sparkles size={16} color={Colors.purple} />}
                                {sec.callout.type === 'case_study' && <Bookmark size={16} color={Colors.amber} />}
                                <Text
                                  style={[
                                    styles.calloutTitle,
                                    sec.callout.type === 'concept' && { color: Colors.cyan },
                                    sec.callout.type === 'warning' && { color: Colors.crimson },
                                    sec.callout.type === 'gold_analyst' && { color: Colors.purple },
                                    sec.callout.type === 'case_study' && { color: Colors.amber },
                                  ]}
                                >
                                  {sec.callout.title}
                                </Text>
                              </View>
                              <Text style={styles.calloutText}>{sec.callout.text}</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        ))}

        {isSearching && filteredParts.length === 0 && (
          <Card style={styles.emptySearchCard}>
            <Text style={styles.emptySearchText}>Nenhum capítulo encontrado para "{searchQuery}".</Text>
          </Card>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  heroCard: {
    marginBottom: Spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.amber}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTag: {
    color: Colors.amber,
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  heroDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 2,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    paddingVertical: Spacing.xs,
  },
  clearSearchText: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  partSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  partTab: {
    flexGrow: 1,
    minWidth: '30%',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  partTabActive: {
    backgroundColor: `${Colors.amber}15`,
    borderColor: Colors.amber,
  },
  partTabNumber: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs - 2,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  partTabNumberActive: {
    color: Colors.amber,
  },
  partTabTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 2,
  },
  partTabTitleActive: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.bold,
  },
  partOverviewCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  partNumberTag: {
    color: Colors.amber,
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  partTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
  },
  partSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  dominationBox: {
    marginTop: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  dominationTitle: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  dominationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  dominationText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    flex: 1,
  },
  chaptersList: {
    gap: Spacing.sm,
  },
  searchPartHeader: {
    paddingVertical: Spacing.xs,
  },
  searchPartHeaderText: {
    color: Colors.amber,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  chapterCard: {
    padding: Spacing.md,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  chapterNumBox: {
    backgroundColor: `${Colors.cyan}15`,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    marginTop: 2,
  },
  chapterNumText: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
  },
  chapterTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
  },
  chapterSummary: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginTop: 3,
    lineHeight: 17,
  },
  chapterContent: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  takeawaysBox: {
    backgroundColor: `${Colors.emerald}10`,
    borderLeftWidth: 3,
    borderLeftColor: Colors.emerald,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  takeawaysTitle: {
    color: Colors.emerald,
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  takeawayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  takeawayDot: {
    color: Colors.emerald,
    fontSize: Typography.fontSize.xs,
  },
  takeawayText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    flex: 1,
  },
  sectionBlock: {
    gap: Spacing.xs,
  },
  sectionBlockTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionBlockText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 19,
  },
  tableContainer: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderText: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.border}80`,
  },
  tableRowAlt: {
    backgroundColor: `${Colors.cardHover}50`,
  },
  tableCellText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs - 1,
    lineHeight: 16,
  },
  calloutBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  calloutConcept: {
    backgroundColor: `${Colors.cyan}10`,
    borderColor: Colors.cyan,
  },
  calloutWarning: {
    backgroundColor: `${Colors.crimson}10`,
    borderColor: Colors.crimson,
  },
  calloutAnalyst: {
    backgroundColor: `${Colors.purple}10`,
    borderColor: Colors.purple,
  },
  calloutCase: {
    backgroundColor: `${Colors.amber}10`,
    borderColor: Colors.amber,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  calloutTitle: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  calloutText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  emptySearchCard: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptySearchText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.sm,
  },
});
