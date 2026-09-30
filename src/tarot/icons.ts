import React from 'react';
import {
  Zap,
  Ghost,
  Scissors,
  ShieldAlert,
  Hourglass,
  Flame,
  SearchCheck,
  Repeat,
  Compass,
  TrendingUp,
  OctagonX,
  Activity,
  Radio,
  BookX,
  Shuffle,
  BatteryLow,
  ClipboardList,
  ShieldCheck,
  NotebookPen,
  Power,
  Eye,
  Scale,
  Sparkles,
  LucideIcon,
} from 'lucide-react-native';

const ICON_MAP: Record<string, LucideIcon> = {
  'zap': Zap,
  'ghost': Ghost,
  'scissors': Scissors,
  'shield-alert': ShieldAlert,
  'hourglass': Hourglass,
  'flame': Flame,
  'search-check': SearchCheck,
  'repeat': Repeat,
  'compass': Compass,
  'trending-up': TrendingUp,
  'octagon-x': OctagonX,
  'activity': Activity,
  'radio': Radio,
  'book-x': BookX,
  'shuffle': Shuffle,
  'battery-low': BatteryLow,
  'clipboard-list': ClipboardList,
  'shield-check': ShieldCheck,
  'notebook-pen': NotebookPen,
  'power': Power,
  'eye': Eye,
  'scale': Scale,
};

export function getTarotIcon(iconName: string): LucideIcon {
  const IconComponent = ICON_MAP[iconName];
  if (!IconComponent) {
    if (__DEV__) {
      console.warn(`[Tarot] Icon "${iconName}" not found in static icon map. Using fallback icon.`);
    }
    return Sparkles;
  }
  return IconComponent;
}
