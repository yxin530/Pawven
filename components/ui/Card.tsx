import React from 'react';
import { View, Pressable } from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  /** Optional NativeWind className override */
  style?: string;
  /** If provided, the card becomes tappable */
  onPress?: () => void;
}

/**
 * A styled card container component using NativeWind classes
 * from the Color_Palette tokens.
 *
 * Renders as a Pressable when onPress is provided, otherwise a plain View.
 */
export function Card({ children, style, onPress }: CardProps) {
  const baseClasses = 'bg-surface rounded-xl p-4 border border-border shadow-sm';
  const className = style ? `${baseClasses} ${style}` : baseClasses;

  if (onPress) {
    return (
      <Pressable className={className} onPress={onPress} accessibilityRole="button">
        {children}
      </Pressable>
    );
  }

  return <View className={className}>{children}</View>;
}

export default Card;
