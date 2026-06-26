import React from 'react';
import { Pressable, Text } from 'react-native';

export interface FilterPillProps {
  /** The display label for the filter pill */
  label: string;
  /** Whether the pill is currently active/selected */
  active: boolean;
  /** Callback invoked when the pill is tapped, receives the new toggled state */
  onChange: (newValue: boolean) => void;
}

/**
 * A tappable pill-shaped filter component with visually distinct active/inactive states.
 * On tap, toggles the active state and invokes onChange with the new boolean value.
 */
export function FilterPill({ label, active, onChange }: FilterPillProps) {
  const baseClasses = 'rounded-full px-4 py-2 border';
  const activeClasses = 'bg-primary border-primary';
  const inactiveClasses = 'bg-surface border-border';
  const className = `${baseClasses} ${active ? activeClasses : inactiveClasses}`;

  const textClasses = active ? 'text-white font-semibold' : 'text-text font-medium';

  return (
    <Pressable
      className={className}
      onPress={() => onChange(!active)}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} filter`}
    >
      <Text className={textClasses}>{label}</Text>
    </Pressable>
  );
}

export default FilterPill;
