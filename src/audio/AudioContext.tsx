import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer, AudioStatus } from 'expo-audio';
import { AudioTrack } from '../types';
import { AUDIO_CATALOG } from './audioCatalog';
import { getPlayableTrackUri } from './offlineAudioStore';

interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  positionSeconds: number;
  durationSeconds: number;
  playbackRate: number;
  isModalOpen: boolean;
  sleepTimerMinutes: number | null;
  playTrack: (track: AudioTrack) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  skipSeconds: (delta: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  setSleepTimer: (minutes: number | null) => void;
  stopAudio: () => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Web Audio Binaural Engine
class WebBinauralSynthesizer {
  private ctx: any = null;
  private oscL: OscillatorNode | null = null;
  private oscR: OscillatorNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private gainNode: GainNode | null = null;

  start(freqDelta: number) {
    this.stop();
    try {
      const AudioCtx = typeof window !== 'undefined' ? ((window as any).AudioContext || (window as any).webkitAudioContext) : null;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      this.ctx = ctx;

      const baseFreq = 216; // 216 Hz harmonious base
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);
      const gainNode = ctx.createGain();

      this.oscL = oscL;
      this.oscR = oscR;
      this.merger = merger;
      this.gainNode = gainNode;

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscR.frequency.setValueAtTime(baseFreq + freqDelta, ctx.currentTime);

      // Connect Left to ch0, Right to ch1
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscL.start();
      oscR.start();
    } catch (e) {
      console.warn('Web Audio Binaural Synth Error:', e);
    }
  }

  stop() {
    try {
      if (this.oscL) {
        this.oscL.stop();
        this.oscL.disconnect();
        this.oscL = null;
      }
      if (this.oscR) {
        this.oscR.stop();
        this.oscR.disconnect();
        this.oscR = null;
      }
      if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
      }
    } catch (e) {
      // ignore
    }
  }
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(AUDIO_CATALOG[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(AUDIO_CATALOG[0].durationSeconds);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<any>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const binauralSynthRef = useRef<WebBinauralSynthesizer>(new WebBinauralSynthesizer());
  const timerIntervalRef = useRef<any>(null);
  const sleepTimerTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // Configure Expo Audio mode for background playback
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
        });
      } catch (err) {
        // Fallback on web
      }
    };
    setupAudio();

    return () => {
      stopAudio();
    };
  }, []);

  // Handle sleep timer
  useEffect(() => {
    if (sleepTimerTimeoutRef.current) {
      clearTimeout(sleepTimerTimeoutRef.current);
      sleepTimerTimeoutRef.current = null;
    }

    if (sleepTimerMinutes && sleepTimerMinutes > 0 && isPlaying) {
      sleepTimerTimeoutRef.current = setTimeout(() => {
        stopAudio();
        setSleepTimerMinutes(null);
      }, sleepTimerMinutes * 60 * 1000);
    }
  }, [sleepTimerMinutes, isPlaying]);

  const playTrack = async (track: AudioTrack) => {
    await stopAudio();
    setCurrentTrack(track);
    setDurationSeconds(track.durationSeconds);
    setPositionSeconds(0);
    setIsPlaying(true);

    if (track.isBinauralGen && Platform.OS === 'web') {
      binauralSynthRef.current.start(track.binauralFreq || 10);
      startSimulationTimer(track.durationSeconds);
      return;
    }

    if (Platform.OS === 'web') {
      try {
        if (!webAudioRef.current && typeof window !== 'undefined') {
          webAudioRef.current = new (window as any).Audio();
        }
        const audio = webAudioRef.current;
        if (audio) {
          audio.src = track.sourceUri;
          audio.playbackRate = playbackRate;
          audio.currentTime = 0;
          
          audio.ontimeupdate = () => {
            setPositionSeconds(audio.currentTime);
            if (audio.duration && !isNaN(audio.duration)) {
              setDurationSeconds(audio.duration);
            }
          };

          audio.onended = () => {
            setIsPlaying(false);
            setPositionSeconds(0);
          };

          await audio.play();
        }
      } catch (e) {
        console.warn('Web HTMLAudio play error, falling back to simulated timer:', e);
        startSimulationTimer(track.durationSeconds);
      }
    } else {
      // Native Expo Audio (SDK 57)
      try {
        let uri = await getPlayableTrackUri(track);
        if (uri.startsWith('/')) {
          const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
          if (hostUri) {
            const host = hostUri.split(':')[0];
            uri = `http://${host}:8081${encodeURI(uri)}`;
          }
        }

        const player = createAudioPlayer(uri, {
          updateInterval: 500,
        });

        if (playbackRate !== 1.0) {
          try {
            player.setPlaybackRate(playbackRate);
          } catch {
            // ignore
          }
        }

        const sub = (player as any).addListener('playbackStatusUpdate', (status: AudioStatus) => {
          if (status.isLoaded) {
            setPositionSeconds(Math.floor(status.currentTime));
            if (status.duration && status.duration > 0) {
              setDurationSeconds(Math.floor(status.duration));
            }
            setIsPlaying(status.playing);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPositionSeconds(0);
            }
          }
        });

        statusSubscriptionRef.current = sub;
        player.play();
        playerRef.current = player;
      } catch (e) {
        console.warn('Expo Audio player create error:', e);
        startSimulationTimer(track.durationSeconds);
      }
    }
  };

  const startSimulationTimer = (totalDur: number) => {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setPositionSeconds((prev) => {
        if (prev >= totalDur) {
          clearInterval(timerIntervalRef.current);
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const togglePlayPause = async () => {
    if (!currentTrack) {
      if (AUDIO_CATALOG.length > 0) {
        await playTrack(AUDIO_CATALOG[0]);
      }
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      clearInterval(timerIntervalRef.current);
      if (currentTrack.isBinauralGen && Platform.OS === 'web') {
        binauralSynthRef.current.stop();
      } else if (Platform.OS === 'web' && webAudioRef.current) {
        webAudioRef.current.pause();
      } else if (playerRef.current) {
        playerRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      if (currentTrack.isBinauralGen && Platform.OS === 'web') {
        binauralSynthRef.current.start(currentTrack.binauralFreq || 10);
        startSimulationTimer(durationSeconds);
      } else if (Platform.OS === 'web' && webAudioRef.current && webAudioRef.current.src) {
        try {
          await webAudioRef.current.play();
        } catch {
          startSimulationTimer(durationSeconds);
        }
      } else if (playerRef.current) {
        playerRef.current.play();
      } else {
        await playTrack(currentTrack);
      }
    }
  };

  const seekTo = async (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, durationSeconds));
    setPositionSeconds(clamped);

    if (Platform.OS === 'web' && webAudioRef.current) {
      webAudioRef.current.currentTime = clamped;
    } else if (playerRef.current) {
      await playerRef.current.seekTo(clamped);
    }
  };

  const skipSeconds = async (delta: number) => {
    await seekTo(positionSeconds + delta);
  };

  const setRate = async (rate: number) => {
    setPlaybackRate(rate);
    if (Platform.OS === 'web' && webAudioRef.current) {
      webAudioRef.current.playbackRate = rate;
    } else if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
  };

  const stopAudio = async () => {
    setIsPlaying(false);
    clearInterval(timerIntervalRef.current);
    binauralSynthRef.current.stop();

    if (Platform.OS === 'web' && webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current.currentTime = 0;
    }
    if (statusSubscriptionRef.current) {
      try {
        statusSubscriptionRef.current.remove();
      } catch (e) {
        // ignore
      }
      statusSubscriptionRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.remove();
      } catch (e) {
        // ignore
      }
      playerRef.current = null;
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        positionSeconds,
        durationSeconds,
        playbackRate,
        isModalOpen,
        sleepTimerMinutes,
        playTrack,
        togglePlayPause,
        seekTo,
        skipSeconds,
        setRate,
        setSleepTimer,
        stopAudio,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
};
