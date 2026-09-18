import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glow' | 'danger' | 'success' | 'surface';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'glow':
        return styles.glow;
      case 'danger':
        return styles.danger;
      case 'success':
        return styles.success;
      case 'surface':
        return styles.surface;
      default:
        return styles.default;
    }
  };

  return <View style={[styles.base, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  default: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
  },
  glow: {
    backgroundColor: Colors.card,
    borderColor: Colors.cyanDark,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: Colors.crimsonDark,
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: Colors.emeraldDark,
  },
  surface: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.border,
  },
});
