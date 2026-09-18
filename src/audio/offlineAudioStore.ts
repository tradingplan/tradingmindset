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

// Verifica se a faixa já está baixada localmente (mínimo de 50KB para evitar páginas de erro 404 cacheadas)
export const isTrackDownloaded = async (trackId: string): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
    const localUri = getLocalFilePath(trackId);
    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists || info.isDirectory) {
      return false;
    }
    // Se o arquivo existir mas for menor que 50KB (ex: HTML 404 antigo), deleta
    if (info.size && info.size < 50000) {
      try {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
      } catch {}
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// Obtém a URL remota de download/streaming
export const getRemoteTrackUrl = (track: AudioTrack): string => {
  if (track.sourceUri.startsWith('http://') || track.sourceUri.startsWith('https://')) {
    return track.sourceUri;
  }
  if (track.sourceUri.startsWith('binaural:')) {
    return track.sourceUri;
  }
  // Se for um caminho relativo (/audios/...), extrai o nome do arquivo para o GitHub Release
  if (track.sourceUri.startsWith('/audios/')) {
    const parts = track.sourceUri.split('/');
    const filename = parts[parts.length - 1];
    return GITHUB_AUDIO_CONFIG.getTrackDownloadUrl(filename);
  }
  // Se for diretamente o nome do asset no GitHub Release (ex: 01.O.Caminho.para.o.Sucesso.mp3)
  return GITHUB_AUDIO_CONFIG.getTrackDownloadUrl(track.sourceUri);
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

// Baixa uma faixa para o armazenamento offline do celular com validação de integridade
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
      if (progressData.totalBytesExpectedToWrite > 0) {
        const progress = progressData.totalBytesWritten / progressData.totalBytesExpectedToWrite;
        onProgress?.(progress);
      }
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri || (result.status && result.status >= 400)) {
    try {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    } catch {}
    throw new Error(`Falha no download (HTTP ${result?.status || 404}). Verifique se o release e os arquivos estão acessíveis.`);
  }

  // Verifica o tamanho do arquivo para evitar salvar respostas de erro de texto 404
  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (fileInfo.exists && fileInfo.size && fileInfo.size < 50000) {
    try {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    } catch {}
    throw new Error('O arquivo baixado retornou erro (tamanho inválido). O arquivo foi descartado.');
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

// Limpa arquivos corrompidos ou pequenos da pasta offline
export const cleanInvalidCachedFiles = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await ensureAudioDirExists();
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
    if (!dirInfo.exists) return;

    const files = await FileSystem.readDirectoryAsync(AUDIO_DIR);
    for (const f of files) {
      const filePath = `${AUDIO_DIR}${f}`;
      const fInfo = await FileSystem.getInfoAsync(filePath);
      if (fInfo.exists && !fInfo.isDirectory && fInfo.size && fInfo.size < 50000) {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
    }
  } catch (e) {
    console.warn('Erro ao limpar arquivos corrompidos:', e);
  }
};

// Limpa todos os áudios offline salvos
export const clearAllOfflineAudios = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(AUDIO_DIR, { idempotent: true });
      await ensureAudioDirExists();
    }
  } catch (e) {
    console.warn('Erro ao limpar áudios:', e);
  }
};
