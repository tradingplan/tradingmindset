import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { AudioTrack } from '../types';
import { GITHUB_AUDIO_CONFIG } from '../config/githubAudioConfig';

const AUDIO_DIR = `${FileSystem.documentDirectory || ''}trading_audios/`;

// Garante que o diretório de áudios offline exista
export const ensureAudioDirExists = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
    }
  } catch (e) {
    console.warn('Erro ao criar diretório de áudio:', e);
  }
};

// Retorna o caminho do arquivo local para uma faixa
export const getLocalFilePath = (trackId: string): string => {
  return `${AUDIO_DIR}${trackId}.mp3`;
};

// Verifica se a faixa já está baixada localmente
export const isTrackDownloaded = async (trackId: string): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
    const localUri = getLocalFilePath(trackId);
    const info = await FileSystem.getInfoAsync(localUri);
    return info.exists && !info.isDirectory;
  } catch {
    return false;
  }
};

// Obtém a URL remota de download/streaming
export const getRemoteTrackUrl = (track: AudioTrack): string => {
  if (track.sourceUri.startsWith('http://') || track.sourceUri.startsWith('https://')) {
    return track.sourceUri;
  }
  // Se for um caminho relativo (/audios/...), extrai o nome do arquivo para o GitHub Release
  if (track.sourceUri.startsWith('/audios/')) {
    const parts = track.sourceUri.split('/');
    const filename = parts[parts.length - 1];
    return GITHUB_AUDIO_CONFIG.getTrackDownloadUrl(filename);
  }
  return track.sourceUri;
};

// Obtém a URI pronta para tocar (Local se baixado, Remota se não)
export const getPlayableTrackUri = async (track: AudioTrack): Promise<string> => {
  if (track.isBinauralGen) return track.sourceUri;
  if (Platform.OS === 'web') {
    return getRemoteTrackUrl(track);
  }

  const isDownloaded = await isTrackDownloaded(track.id);
  if (isDownloaded) {
    return getLocalFilePath(track.id);
  }

  return getRemoteTrackUrl(track);
};

// Baixa uma faixa para o armazenamento offline do celular
export const downloadTrackForOffline = async (
  track: AudioTrack,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (Platform.OS === 'web') {
    throw new Error('Download offline não suportado na web.');
  }

  await ensureAudioDirExists();
  const remoteUrl = getRemoteTrackUrl(track);
  const localUri = getLocalFilePath(track.id);

  const downloadResumable = FileSystem.createDownloadResumable(
    remoteUrl,
    localUri,
    {},
    (progressData) => {
      const progress = progressData.totalBytesWritten / progressData.totalBytesExpectedToWrite;
      onProgress?.(progress);
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) {
    throw new Error('Falha ao baixar áudio.');
  }

  return result.uri;
};

// Exclui uma faixa baixada do armazenamento
export const deleteOfflineTrack = async (trackId: string): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const localUri = getLocalFilePath(trackId);
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }
  } catch (e) {
    console.warn('Erro ao deletar áudio offline:', e);
  }
};
