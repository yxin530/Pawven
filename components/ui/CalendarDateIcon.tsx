/**
 * CalendarDateIcon.tsx
 * ----------------------------------------------------------------------------
 * Small calendar-style icon (red month header + bold day number), matching
 * the reference design: a rounded card with a terracotta/red top band
 * showing the month in uppercase, and a white body showing the day number
 * in large bold type.
 *
 * Usage:
 *   <CalendarDateIcon month="NOV" day={20} />
 *   <CalendarDateIcon month="JAN" day={5} size={64} />
 * ----------------------------------------------------------------------------
 */

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type Props = {
  /** 3-letter month label, e.g. "NOV" */
  month: string;
  /** Day number, e.g. 20 */
  day: number | string;
  /** Overall icon width/height in px (height scales ~1.15x width) */
  size?: number;
  /** Header band color */
  accentColor?: string;
  style?: ViewStyle;
};

const CalendarDateIcon: React.FC<Props> = ({
  month,
  day,
  size = 56,
  accentColor = '#D9614F',
  style,
}) => {
  const width = size;
  const height = size * 1.15;
  const headerHeight = height * 0.34;
  const radius = size * 0.16;

  return (
    <View
      style={[
        styles.card,
        {
          width,
          height,
          borderRadius: radius,
          shadowOpacity: 0.12,
          shadowRadius: radius * 0.6,
          shadowOffset: { width: 0, height: radius * 0.3 },
        },
        style,
      ]}
    >
      <View
        style={[
          styles.header,
          {
            height: headerHeight,
            backgroundColor: accentColor,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
          },
        ]}
      >
        <Text
          style={[
            styles.monthText,
            { fontSize: headerHeight * 0.52 },
          ]}
          numberOfLines={1}
        >
          {month.toUpperCase()}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.dayText, { fontSize: (height - headerHeight) * 0.56 }]}>
          {day}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: '#101012',
    fontWeight: '800',
  },
});

export default CalendarDateIcon;