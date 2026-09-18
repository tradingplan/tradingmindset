import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useAudio } from '../audio/AudioContext';
import {
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Clock,
  Radio,
  Headphones,
  Zap,
  Volume2,
  Info,
} from 'lucide-react-native';
import { CATEGORY_LABELS } from '../audio/audioCatalog';

export const AudioModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    positionSeconds,
    durationSeconds,
    playbackRate,
    isModalOpen,
    sleepTimerMinutes,
    togglePlayPause,
    seekTo,
    skipSeconds,
    setRate,
    setSleepTimer,
    closeModal,
  } = useAudio();

  const [showSleepPicker, setShowSleepPicker] = useState(false);

  if (!currentTrack) return null;

  const progress = durationSeconds > 0 ? (positionSeconds / durationSeconds) * 100 : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const speedOptions = [0.8, 1.0, 1.25, 1.5];
  const sleepOptions = [15, 30, 45, 60];

  const categoryMeta = CATEGORY_LABELS[currentTrack.category] || {
    title: 'Áudio de Ancoragem',
    subtitle: 'Mindset & Foco',
  };

  return (
    <Modal visible={isModalOpen} animationType="slide" transparent={false} onRequestClose={closeModal}>
      <View style={styles.container}>
        {/* Top Header Row */}
        <View style={[styles.topHeader, { paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 12) }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
            <ChevronDown size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerSubtitle}>TOCANDO AGORA</Text>
            <Text style={styles.headerCategory}>{categoryMeta.title}</Text>
          </View>
          <TouchableOpacity
            style={[styles.timerIconBtn, sleepTimerMinutes ? styles.timerIconBtnActive : null]}
            onPress={() => setShowSleepPicker(!showSleepPicker)}
          >
            <Clock size={20} color={sleepTimerMinutes ? Colors.cyan : Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Visualizer Artwork Frame */}
          <View style={styles.artworkContainer}>
            <View style={[styles.glowRing, isPlaying && styles.glowRingPlaying]}>
              <View style={styles.artworkCenter}>
                {currentTrack.isBinauralGen ? (
                  <Radio size={56} color={isPlaying ? Colors.cyan : Colors.textMuted} />
                ) : (
                  <Headphones size={56} color={isPlaying ? Colors.emerald : Colors.textMuted} />
                )}
                {currentTrack.binauralFreq && (
                  <View style={styles.freqBadge}>
                    <Zap size={12} color={Colors.cyan} />
                    <Text style={styles.freqText}>{currentTrack.binauralFreq} Hz</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Wave Bars Animation */}
            {isPlaying && (
              <View style={styles.waveformContainer}>
                {[18, 32, 24, 40, 28, 44, 20, 36, 16, 30, 42, 22].map((h, i) => (
                  <View key={i} style={[styles.waveBar, { height: h }]} />
                ))}
              </View>
            )}
          </View>

          {/* Track Titles */}
          <View style={styles.trackDetailsContainer}>
            <Text style={styles.titleText}>{currentTrack.title}</Text>
            <Text style={styles.subtitleText}>{currentTrack.subtitle}</Text>
            <Text style={styles.authorText}>Por {currentTrack.author}</Text>
          </View>

          {/* Interactive Scrubber / Progress Bar */}
          <View style={styles.scrubberContainer}>
            <TouchableOpacity
              style={styles.scrubberTrack}
              activeOpacity={0.8}
              onPress={(e) => {
                if (Platform.OS === 'web') {
                  const rect = (e.target as any).getBoundingClientRect?.();
                  if (rect) {
                    const clickX = (e.nativeEvent as any).clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    seekTo(pct * durationSeconds);
                  }
                }
              }}
            >
              <View style={[styles.scrubberFill, { width: `${progress}%` }]} />
              <View style={[styles.scrubberThumb, { left: `${progress}%` }]} />
            </TouchableOpacity>

            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>{formatTime(positionSeconds)}</Text>
              <Text style={styles.timeLabel}>{formatTime(durationSeconds)}</Text>
            </View>
          </View>

          {/* Main Controls Row: Rewind15, Play/Pause, FastForward15 */}
          <View style={styles.mainControlsRow}>
            {/* Rewind 15s */}
            <TouchableOpacity style={styles.skipBtn} onPress={() => skipSeconds(-15)}>
              <RotateCcw size={22} color={Colors.textPrimary} />
              <Text style={styles.skipLabel}>15s</Text>
            </TouchableOpacity>

            {/* Play/Pause Button */}
            <TouchableOpacity
              style={[styles.bigPlayBtn, isPlaying && styles.bigPlayBtnPlaying]}
              onPress={togglePlayPause}
            >
              {isPlaying ? (
                <Pause size={28} color="#0B0E14" fill="#0B0E14" />
              ) : (
                <Play size={28} color="#0B0E14" fill="#0B0E14" style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>

            {/* Forward 15s */}
            <TouchableOpacity style={styles.skipBtn} onPress={() => skipSeconds(15)}>
              <RotateCw size={22} color={Colors.textPrimary} />
              <Text style={styles.skipLabel}>15s</Text>
            </TouchableOpacity>
          </View>

          {/* Speed Selector Buttons */}
          <View style={styles.speedRow}>
            <Text style={styles.speedHeader}>Velocidade:</Text>
            {speedOptions.map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[styles.speedPill, playbackRate === rate && styles.speedPillActive]}
                onPress={() => setRate(rate)}
              >
                <Text style={[styles.speedPillText, playbackRate === rate && styles.speedPillTextActive]}>
                  {rate}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sleep Timer Drawer */}
          {showSleepPicker && (
            <View style={styles.sleepDrawer}>
              <View style={styles.sleepHeader}>
                <Clock size={16} color={Colors.cyan} />
                <Text style={styles.sleepTitle}>Timer de Desligamento Automático</Text>
              </View>
              <View style={styles.sleepOptionsRow}>
                <TouchableOpacity
                  style={[styles.sleepOptionPill, sleepTimerMinutes === null && styles.sleepOptionActive]}
                  onPress={() => setSleepTimer(null)}
                >
                  <Text style={[styles.sleepOptionText, sleepTimerMinutes === null && styles.sleepOptionTextActive]}>
                    Desativado
                  </Text>
                </TouchableOpacity>
                {sleepOptions.map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[styles.sleepOptionPill, sleepTimerMinutes === mins && styles.sleepOptionActive]}
                    onPress={() => setSleepTimer(mins)}
                  >
                    <Text style={[styles.sleepOptionText, sleepTimerMinutes === mins && styles.sleepOptionTextActive]}>
                      {mins} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Psychological Context / Description Card */}
          <View style={styles.descriptionCard}>
            <View style={styles.descTitleRow}>
              <Info size={16} color={Colors.cyan} />
              <Text style={styles.descHeader}>Propósito Mental</Text>
            </View>
            <Text style={styles.descBody}>{currentTrack.description}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  headerCategory: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  timerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerIconBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: Colors.cyanDark,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  glowRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRingPlaying: {
    borderColor: Colors.cyan,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  artworkCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  freqText: {
    color: Colors.cyan,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    height: 50,
  },
  waveBar: {
    width: 4,
    backgroundColor: Colors.cyan,
    borderRadius: 2,
  },
  trackDetailsContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitleText: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  authorText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
  },
  scrubberContainer: {
    width: '100%',
    marginVertical: Spacing.md,
  },
  scrubberTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: Colors.cyan,
    borderRadius: 3,
  },
  scrubberThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.textPrimary,
    marginLeft: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
  },
  mainControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginVertical: Spacing.md,
  },
  skipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
  },
  bigPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bigPlayBtnPlaying: {
    backgroundColor: Colors.cyan,
    shadowColor: Colors.cyan,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: Spacing.sm,
  },
  speedHeader: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  speedPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  speedPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: Colors.cyan,
  },
  speedPillText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  speedPillTextActive: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  sleepDrawer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginVertical: Spacing.md,
  },
  sleepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  sleepTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  sleepOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sleepOptionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sleepOptionActive: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  sleepOptionText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
  },
  sleepOptionTextActive: {
    color: Colors.cyan,
    fontWeight: Typography.fontWeight.bold,
  },
  descriptionCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  descTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  descHeader: {
    color: Colors.cyan,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  descBody: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
});
