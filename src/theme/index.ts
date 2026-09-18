export const Colors = {
  // Backgrounds
  background: '#0B0E14',
  backgroundSecondary: '#11151C',
  backgroundTertiary: '#161B26',
  
  // Surfaces & Cards
  card: '#1A1F2C',
  cardHover: '#22283A',
  cardBorder: '#2A324B',
  cardBorderGlow: 'rgba(6, 182, 212, 0.25)',
  cardGlass: 'rgba(26, 31, 44, 0.85)',

  // Brand & Disciplina (Emerald)
  emerald: '#10B981',
  emeraldDark: '#059669',
  emeraldGlow: 'rgba(16, 185, 129, 0.2)',
  emeraldLight: '#34D399',

  // Alerta & SOS (Crimson / Amber)
  crimson: '#EF4444',
  crimsonDark: '#B91C1C',
  crimsonGlow: 'rgba(239, 68, 68, 0.25)',
  amber: '#F59E0B',
  amberDark: '#D97706',
  amberGlow: 'rgba(245, 158, 11, 0.2)',

  // Destaques & Tech (Electric Cyan & Purple)
  cyan: '#06B6D4',
  cyanDark: '#0891B2',
  cyanGlow: 'rgba(6, 182, 212, 0.2)',
  purple: '#8B5CF6',
  purpleGlow: 'rgba(139, 92, 246, 0.2)',

  // Tipografia
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDisabled: '#475569',

  // Status & Indicadores
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',

  // Linhas e Divisórias
  border: '#1E2538',
  borderLight: '#2D3748',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

export const Typography = {
  fontFamily: {
    sans: 'System',
    mono: 'monospace',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
    black: '900' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
