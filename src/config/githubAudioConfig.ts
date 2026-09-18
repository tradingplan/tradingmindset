/**
 * Configuração do GitHub Releases para hospedagem dos áudios do aplicativo.
 * 
 * Para ativar:
 * 1. Crie o repositório no GitHub.
 * 2. Crie um "Release" com uma tag (ex: v1.0.0).
 * 3. Anexe os arquivos MP3 no Release.
 * 4. Ajuste os campos 'owner', 'repo' e 'tag' abaixo.
 */
export const GITHUB_AUDIO_CONFIG = {
  owner: 'tradingplan', // Substitua pelo seu usuário do GitHub
  repo: 'tradingmindset', // Nome do repositório
  tag: 'v1.0.0', // Tag do Release onde os MP3 foram anexados

  getReleaseBaseUrl(): string {
    return `https://github.com/${this.owner}/${this.repo}/releases/download/${this.tag}`;
  },

  getTrackDownloadUrl(filename: string): string {
    const encoded = encodeURIComponent(filename);
    return `${this.getReleaseBaseUrl()}/${encoded}`;
  },
};
