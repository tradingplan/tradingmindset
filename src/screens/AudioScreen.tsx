import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { Card } from '../components/Card';
import { AUDIO_CATALOG, CATEGORY_LABELS } from '../audio/audioCatalog';
import { AudioCategory, AudioTrack } from '../types';
import { useAudio } from '../audio/AudioContext';
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
} from 'lucide-react-native';

export const AudioScreen: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause, openModal } = useAudio();
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
      default:
        return <Zap size={14} color={Colors.textPrimary} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner: Featured Anchor Track */}
        <TouchableOpacity
          style={styles.featuredCard}
          activeOpacity={0.9}
          onPress={() => {
            if (currentTrack?.id === featuredTrack.id) {
              openModal();
            } else {
              playTrack(featuredTrack);
            }
          }}
        >
          <View style={styles.featuredBadge}>
            <Sparkles size={12} color={Colors.cyan} />
            <Text style={styles.featuredBadgeText}>DESTAQUE DO DIA</Text>
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
              onPress={() => {
                if (currentTrack?.id === featuredTrack.id && isPlaying) {
                  togglePlayPause();
                } else {
                  playTrack(featuredTrack);
                }
              }}
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

            return (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackCard, isThisTrackActive && styles.trackCardActive]}
                activeOpacity={0.8}
                onPress={() => {
                  if (isThisTrackActive) {
                    openModal();
                  } else {
                    playTrack(track);
                  }
                }}
              >
                {/* Icon Box */}
                <View
                  style={[
                    styles.trackIconBox,
                    isThisTrackPlaying && styles.trackIconBoxPlaying,
                  ]}
                >
                  {track.isBinauralGen ? (
                    <Radio size={20} color={isThisTrackActive ? Colors.cyan : Colors.textMuted} />
                  ) : (
                    <Headphones size={20} color={isThisTrackActive ? Colors.emerald : Colors.textMuted} />
                  )}
                  {track.binauralFreq && (
                    <View style={styles.miniFreqBadge}>
                      <Text style={styles.miniFreqText}>{track.binauralFreq}Hz</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, isThisTrackActive && styles.trackTitleActive]} numberOfLines={1}>
                    {track.title}
                  </Text>
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
                      ) : (
                        <Download size={14} color={Colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Play Action Button */}
                  <TouchableOpacity
                    style={[styles.trackPlayActionBtn, isThisTrackPlaying && styles.trackPlayActionBtnActive]}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (isThisTrackActive) {
                        togglePlayPause();
                      } else {
                        playTrack(track);
                      }
                    }}
                  >
                    {isThisTrackPlaying ? (
                      <Pause size={16} color="#0B0E14" fill="#0B0E14" />
                    ) : (
                      <Play size={16} color={isThisTrackActive ? '#0B0E14' : Colors.textPrimary} fill={isThisTrackActive ? '#0B0E14' : 'transparent'} style={{ marginLeft: 2 }} />
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
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  featuredBadgeText: {
    color: Colors.cyan,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
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
  trackTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  trackTitleActive: {
    color: Colors.cyan,
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
});
