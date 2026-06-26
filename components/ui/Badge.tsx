import React from 'react';
import { Text, View } from 'react-native';

export interface BadgeProps {
  /** The text label displayed in the badge */
  label: string;
  /** Category key used to determine badge color */
  category: string;
  /** Size variant — 'sm' for compact, 'md' for standard */
  size?: 'sm' | 'md';
}

export interface CategoryColors {
  bg: string;
  text: string;
}

/**
 * Returns the NativeWind color classes for a given category.
 * The same category always maps to the same color (deterministic).
 * Exported separately for reuse and testability.
 */
export function getCategoryColor(category: string): CategoryColors {
  switch (category) {
    case 'adoption':
      return { bg: 'bg-primary/20', text: 'text-primary' };
    case 'feeding':
      return { bg: 'bg-active/20', text: 'text-active' };
    case 'tnr':
      return { bg: 'bg-accent/20', text: 'text-accent' };
    case 'fundraiser':
      return { bg: 'bg-secondary/20', text: 'text-secondary' };
    case 'meetup':
      return { bg: 'bg-primary/20', text: 'text-primary' };
    case 'volunteer':
      return { bg: 'bg-active/20', text: 'text-active' };
    default:
      return { bg: 'bg-disabled/20', text: 'text-text' };
  }
}

/**
 * Badge_Component — displays category or status labels as color-coded pills.
 * Each distinct category maps to a visually distinct color from the Color_Palette.
 */
export function Badge({ label, category, size = 'sm' }: BadgeProps) {
  const colors = getCategoryColor(category);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View
      className={`rounded-full self-start ${sizeClasses} ${colors.bg}`}
      accessibilityRole="text"
      accessibilityLabel={`${category}: ${label}`}
    >
      <Text className={`${textSize} font-medium ${colors.text}`}>{label}</Text>
    </View>
  );
}

export default Badge;
