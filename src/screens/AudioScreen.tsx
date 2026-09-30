import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { Card } from '../components/Card';
import { AUDIO_CATALOG, CATEGORY_LABELS } from '../audio/audioCatalog';
import { AudioCategory, AudioTrack } from '../types';
import { useAudio } from '../audio/AudioContext';
import { useUserTier } from '../context/TierContext';
import { isTrackFree } from '../services/tierService';
import {
  isTrackDownloaded,
  downloadTrackForOffline,
  deleteOfflineTrack,
} from '../audio/offlineAudioStore';
import {
  Play,
  Pause,
  Headphones,
  Radio,
  Search,
  Zap,
  Sparkles,
  BookOpen,
  Sunrise,
  ShieldAlert,
  Moon,
  Download,
  Check,
  Brain,
  Lock,
  Crown,
} from 'lucide-react-native';

export const AudioScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topSafeAreaPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20) + Spacing.sm;
  const { currentTrack, isPlaying, playTrack, togglePlayPause, openModal } = useAudio();
  const { isPremium, openPaywall } = useUserTier();
  const [selectedCategory, setSelectedCategory] = useState<AudioCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedMap, setDownloadedMap] = useState<Record<string, boolean>>({});
  const [downloadingMap, setDownloadingMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const checkAllDownloads = async () => {
      const map: Record<string, boolean> = {};
      for (const t of AUDIO_CATALOG) {
        if (!t.isBinauralGen) {
          map[t.id] = await isTrackDownloaded(t.id);
        }
      }
      setDownloadedMap(map);
    };
    checkAllDownloads();
  }, []);

  const handleToggleDownload = async (track: AudioTrack) => {
    if (track.isBinauralGen) return;

    if (!isPremium) {
      openPaywall('Download Offline de Áudios');
      return;
    }

    if (downloadedMap[track.id]) {
      await deleteOfflineTrack(track.id);
      setDownloadedMap((prev) => ({ ...prev, [track.id]: false }));
    } else {
      setDownloadingMap((prev) => ({ ...prev, [track.id]: 0.01 }));
      try {
        await downloadTrackForOffline(track, (progress) => {
          setDownloadingMap((prev) => ({ ...prev, [track.id]: progress }));
        });
        setDownloadedMap((prev) => ({ ...prev, [track.id]: true }));
      } catch (e) {
        console.warn('Erro ao baixar:', e);
      } finally {
        setDownloadingMap((prev) => {
          const copy = { ...prev };
          delete copy[track.id];
          return copy;
        });
      }
    }
  };

  const handlePlayTrack = (track: AudioTrack) => {
    const isUnlocked = isPremium || isTrackFree(track.id);
    if (!isUnlocked) {
      openPaywall(`Áudio: ${track.title}`);
      return;
    }
    if (currentTrack?.id === track.id) {
      openModal();
    } else {
      playTrack(track);
    }
  };

  const handlePlayToggle = (track: AudioTrack) => {
    const isUnlocked = isPremium || isTrackFree(track.id);
    if (!isUnlocked) {
      openPaywall(`Áudio: ${track.title}`);
      return;
    }
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const filteredTracks = AUDIO_CATALOG.filter((track) => {
    const matchesCategory = selectedCategory === 'all' || track.category === selectedCategory;
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredTrack = AUDIO_CATALOG[0]; // "O STOP Não é o Problema"

  const getCategoryIcon = (category: AudioCategory | 'all') => {
    switch (category) {
      case 'pre_market':
        return <Sunrise size={14} color={Colors.cyan} />;
      case 'binaural_focus':
        return <Radio size={14} color={Colors.emerald} />;
      case 'post_loss':
        return <ShieldAlert size={14} color={Colors.crimson} />;
      case 'decompression':
        return <Moon size={14} color={Colors.purple} />;
      case 'trading_zone_book':
        return <BookOpen size={14} color={Colors.amber} />;
      case 'auto_hypnosis':
        return <Sparkles size={14} color={Colors.cyan} />;
      case 'emotional_consistency':
        return <Brain size={14} color={Colors.emeraldLight} />;
      default:
        return <Zap size={14} color={Colors.textPrimary} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: topSafeAreaPadding }]} showsVerticalScrollIndicator={false}>
        {/* Banner: Featured Anchor Track */}
        <TouchableOpacity
          style={styles.featuredCard}
          activeOpacity={0.9}
          onPress={() => handlePlayTrack(featuredTrack)}
        >
          <View style={styles.featuredBadgeRow}>
            <View style={styles.featuredBadge}>
              <Sparkles size={12} color={Colors.cyan} />
              <Text style={styles.featuredBadgeText}>DESTAQUE DO DIA</Text>
            </View>
            <View style={styles.featuredFreePill}>
              <Text style={styles.featuredFreePillText}>DEGUSTAÇÃO LIBERADA</Text>
            </View>
          </View>
          <Text style={styles.featuredTitle}>{featuredTrack.title}</Text>
          <Text style={styles.featuredSubtitle}>{featuredTrack.subtitle}</Text>
          <Text style={styles.featuredDesc}>{featuredTrack.description}</Text>

          <View style={styles.featuredBottomRow}>
            <View style={styles.featuredDurationPill}>
              <Headphones size={14} color={Colors.textSecondary} />
              <Text style={styles.featuredDurationText}>{featuredTrack.formattedDuration}</Text>
            </View>
            <TouchableOpacity
              style={styles.featuredPlayBtn}
              onPress={() => handlePlayToggle(featuredTrack)}
            >
              {currentTrack?.id === featuredTrack.id && isPlaying ? (
                <>
                  <Pause size={16} color="#0B0E14" fill="#0B0E14" />
                  <Text style={styles.featuredPlayBtnText}>PAUSAR</Text>
                </>
              ) : (
                <>
                  <Play size={16} color="#0B0E14" fill="#0B0E14" />
                  <Text style={styles.featuredPlayBtnText}>OUVIR AGORA</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Promo / Paywall Banner for Free Users */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.proBannerCard}
            activeOpacity={0.85}
            onPress={() => openPaywall('Catálogo Completo (+20 Áudios)')}
          >
            <View style={styles.proBannerTop}>
              <View style={styles.proCrownIcon}>
                <Crown size={18} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proBannerTitle}>Desbloqueie todo o Catálogo PRO</Text>
                <Text style={styles.proBannerSubtitle}>
                  Você possui 3 faixas gratuitas liberadas. Assine para ouvir todas as frequências binaurais e baixar offline.
                </Text>
              </View>
            </View>
            <View style={styles.proBannerActionRow}>
              <View style={styles.proBannerActionBtn}>
                <Crown size={14} color="#0B0E14" />
                <Text style={styles.proBannerActionText}>CONHECER PLANO PRO</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar áudio, capítulo ou frequência..."
            placeholderTextColor={Colors.textDisabled}
          />
        </View>

        {/* Category Pills Slider */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesSlider}
        >
          <TouchableOpacity
            style={[styles.categoryPill, selectedCategory === 'all' && styles.categoryPillActive]}
            onPress={() => setSelectedCategory('all')}
          >
            {getCategoryIcon('all')}
            <Text style={[styles.categoryPillText, selectedCategory === 'all' && styles.categoryPillTextActive]}>
              Todos ({AUDIO_CATALOG.length})
            </Text>
          </TouchableOpacity>

          {(Object.keys(CATEGORY_LABELS) as AudioCategory[]).map((cat) => {
            const count = AUDIO_CATALOG.filter((t) => t.category === cat).length;
            const isSel = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isSel && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                {getCategoryIcon(cat)}
                <Text style={[styles.categoryPillText, isSel && styles.categoryPillTextActive]}>
                  {CATEGORY_LABELS[cat].title.split('&')[0].trim()} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Track List */}
        <View style={styles.trackListContainer}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listSectionTitle}>
              {selectedCategory === 'all' ? 'Acervo Completo' : CATEGORY_LABELS[selectedCategory]?.title}
            </Text>
            <Text style={styles.listCountText}>{filteredTracks.length} faixas</Text>
          </View>

          {filteredTracks.map((track) => {
            const isThisTrackActive = currentTrack?.id === track.id;
            const isThisTrackPlaying = isThisTrackActive && isPlaying;
            const trackIsFree = isTrackFree(track.id);
            const isLocked = !isPremium && !trackIsFree;

            return (
              <TouchableOpacity
                key={track.id}
                style={[
                  styles.trackCard,
                  isThisTrackActive && styles.trackCardActive,
                  isLocked && styles.trackCardLocked,
                ]}
                activeOpacity={0.8}
                onPress={() => handlePlayTrack(track)}
              >
                {/* Icon Box */}
                <View
                  style={[
                    styles.trackIconBox,
                    isThisTrackPlaying && styles.trackIconBoxPlaying,
                    isLocked && styles.trackIconBoxLocked,
                  ]}
                >
                  {isLocked ? (
                    <Lock size={18} color={Colors.amber} />
                  ) : track.isBinauralGen ? (
                    <Radio size={20} color={isThisTrackActive ? Colors.cyan : Colors.textMuted} />
                  ) : (
                    <Headphones size={20} color={isThisTrackActive ? Colors.emerald : Colors.textMuted} />
                  )}
                  {track.binauralFreq && !isLocked && (
                    <View style={styles.miniFreqBadge}>
                      <Text style={styles.miniFreqText}>{track.binauralFreq}Hz</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.trackInfo}>
                  <View style={styles.titleRowWithBadge}>
                    <Text
                      style={[
                        styles.trackTitle,
                        isThisTrackActive && styles.trackTitleActive,
                        isLocked && styles.trackTitleLocked,
                      ]}
                      numberOfLines={1}
                    >
                      {track.title}
                    </Text>
                    {trackIsFree ? (
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>FREE</Text>
                      </View>
                    ) : isLocked ? (
                      <View style={styles.proLockBadge}>
                        <Crown size={9} color="#F59E0B" />
                        <Text style={styles.proLockBadgeText}>PRO</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.trackSubtitle} numberOfLines={1}>
                    {track.subtitle}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaAuthor}>{track.author}</Text>
                    <Text style={styles.metaDuration}>• {track.formattedDuration}</Text>
                  </View>
                </View>

                {/* Actions: Download + Play */}
                <View style={styles.trackActionsRow}>
                  {!track.isBinauralGen && (
                    <TouchableOpacity
                      style={[
                        styles.trackDownloadBtn,
                        downloadedMap[track.id] && styles.trackDownloadBtnDownloaded,
                        isLocked && styles.trackDownloadBtnLocked,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleDownload(track);
                      }}
                    >
                      {downloadingMap[track.id] !== undefined ? (
                        <ActivityIndicator size="small" color={Colors.cyan} />
                      ) : downloadedMap[track.id] ? (
                        <Check size={14} color={Colors.emerald} />
                      ) : isLocked ? (
                        <Lock size={12} color={Colors.textMuted} />
                      ) : (
                        <Download size={14} color={Colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Play Action Button */}
                  <TouchableOpacity
                    style={[
                      styles.trackPlayActionBtn,
                      isThisTrackPlaying && styles.trackPlayActionBtnActive,
                      isLocked && styles.trackPlayActionBtnLocked,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handlePlayToggle(track);
                    }}
                  >
                    {isLocked ? (
                      <Lock size={14} color={Colors.amber} />
                    ) : isThisTrackPlaying ? (
                      <Pause size={16} color="#0B0E14" fill="#0B0E14" />
                    ) : (
                      <Play
                        size={16}
                        color={isThisTrackActive ? '#0B0E14' : Colors.textPrimary}
                        fill={isThisTrackActive ? '#0B0E14' : 'transparent'}
                        style={{ marginLeft: 2 }}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
    padding: Spacing.md,
    paddingBottom: 150,
  },
  featuredCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cyanDark,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  featuredBadgeText: {
    color: Colors.cyan,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  featuredFreePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  featuredFreePillText: {
    color: Colors.emerald,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  featuredTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  featuredSubtitle: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  featuredDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  featuredBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredDurationText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
  },
  featuredPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cyan,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  featuredPlayBtnText: {
    color: '#0B0E14',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  proBannerCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  proBannerTop: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  proCrownIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  proBannerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  proBannerSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 17,
  },
  proBannerActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  proBannerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.xs,
  },
  proBannerActionText: {
    color: '#0B0E14',
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
  },
  categoriesSlider: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: Spacing.md,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: Colors.cyan,
  },
  categoryPillText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  categoryPillTextActive: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  trackListContainer: {
    marginTop: Spacing.xs,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  listSectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  listCountText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  trackCardActive: {
    borderColor: Colors.cyanDark,
    backgroundColor: 'rgba(26, 31, 44, 0.95)',
  },
  trackCardLocked: {
    opacity: 0.9,
    backgroundColor: 'rgba(18, 22, 31, 0.6)',
  },
  trackIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trackIconBoxPlaying: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
  trackIconBoxLocked: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  miniFreqBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: Colors.cyanDark,
    paddingHorizontal: 3,
    borderRadius: 3,
  },
  miniFreqText: {
    color: '#0B0E14',
    fontSize: 8,
    fontWeight: Typography.fontWeight.bold,
  },
  trackInfo: {
    flex: 1,
  },
  titleRowWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  trackTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    flexShrink: 1,
  },
  trackTitleActive: {
    color: Colors.cyan,
  },
  trackTitleLocked: {
    color: Colors.textSecondary,
  },
  freeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  freeBadgeText: {
    color: Colors.emerald,
    fontSize: 8,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  proLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  proLockBadgeText: {
    color: '#F59E0B',
    fontSize: 8,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  trackSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaAuthor: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  metaDuration: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  trackActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackDownloadBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trackDownloadBtnDownloaded: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  trackDownloadBtnLocked: {
    opacity: 0.5,
  },
  trackPlayActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trackPlayActionBtnActive: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },
  trackPlayActionBtnLocked: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
});
