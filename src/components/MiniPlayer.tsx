import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { useAudio } from '../audio/AudioContext';
import { Play, Pause, FastForward, Headphones, Radio } from 'lucide-react-native';

interface MiniPlayerProps {
  bottomOffset?: number;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ bottomOffset = 64 }) => {
  const { currentTrack, isPlaying, positionSeconds, durationSeconds, togglePlayPause, skipSeconds, openModal } =
    useAudio();

  if (!currentTrack) return null;

  const progress = durationSeconds > 0 ? (positionSeconds / durationSeconds) * 100 : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={[styles.outerContainer, { bottom: bottomOffset + 6 }]}>
      {/* Progress Bar Top Edge */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <TouchableOpacity style={styles.cardContent} onPress={openModal} activeOpacity={0.9}>
        {/* Track Icon & Wave Indicator */}
        <View style={[styles.iconContainer, isPlaying && styles.iconContainerPlaying]}>
          {currentTrack.isBinauralGen ? (
            <Radio size={16} color={isPlaying ? Colors.cyan : Colors.textMuted} />
          ) : (
            <Headphones size={16} color={isPlaying ? Colors.emerald : Colors.textMuted} />
          )}
        </View>

        {/* Track Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <View style={styles.subRow}>
            <Text style={styles.trackSubtitle} numberOfLines={1}>
              {currentTrack.subtitle}
            </Text>
            <Text style={styles.timeCounter}>
              • {formatTime(positionSeconds)} / {formatTime(durationSeconds)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.controlsRow}>
          {/* Skip +15s */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={(e) => {
              e.stopPropagation();
              skipSeconds(15);
            }}
          >
            <FastForward size={14} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            style={[styles.playBtn, isPlaying && styles.playBtnActive]}
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            {isPlaying ? (
              <Pause size={16} color="#0B0E14" fill="#0B0E14" />
            ) : (
              <Play size={16} color="#0B0E14" fill="#0B0E14" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 999,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.cyan,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainerPlaying: {
    borderColor: Colors.cyanDark,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  trackSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    maxWidth: '55%',
  },
  timeCounter: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    backgroundColor: Colors.cyan,
  },
});
