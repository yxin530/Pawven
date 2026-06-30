import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

type Badge = {
  id: string;
  label: string;
  xp?: number;
  icon: string;
  category: 'Feeding' | 'Neutering' | 'Community';
  earned: boolean;
  highlighted?: boolean;
};

const BADGES: Badge[] = [
  { id: 'first-feeding', label: 'First Feeding', xp: 20, icon: '🍲', category: 'Feeding', earned: true },
  { id: '7-day-streak', label: '7 Day Streak', xp: 50, icon: '🔥', category: 'Feeding', earned: true },
  { id: 'first-neuter', label: 'First Neuter', xp: 30, icon: '✂️', category: 'Neutering', earned: true },
  { id: 'community-joiner', label: 'Community Joiner', xp: 20, icon: '👥', category: 'Community', earned: true },
  { id: 'super-feeder', label: 'Super Feeder', xp: 60, icon: '⭐', category: 'Feeding', earned: true },
  { id: 'vax-helper', label: 'Vax Helper', xp: 40, icon: '💉', category: 'Neutering', earned: true, highlighted: true },
  { id: 'event-host', label: 'Event Host', xp: 50, icon: '🚩', category: 'Community', earned: true },
  { id: 'gold-league', label: 'Gold League', xp: 80, icon: '🏆', category: 'Community', earned: true },
  { id: 'colony-guardian', label: 'Colony Guardian', icon: '🛡️', category: 'Community', earned: false },
  { id: '50-cats-fed', label: '50 Cats Fed', icon: '🔒', category: 'Feeding', earned: false },
  { id: '30-day-streak', label: '30 Day Streak', icon: '🔒', category: 'Feeding', earned: false },
  { id: 'master-trapper', label: 'Master Trapper', icon: '🔒', category: 'Neutering', earned: false },
  { id: 'veterinarian', label: 'Veterinarian', icon: '🔒', category: 'Neutering', earned: false },
];

const FILTERS = ['All', 'Feeding', 'Neutering', 'Community'] as const;
type Filter = (typeof FILTERS)[number];

export default function BadgesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const filteredBadges = BADGES.filter(b => activeFilter === 'All' || b.category === activeFilter);
  const earnedBadges = filteredBadges.filter(b => b.earned);
  const lockedBadges = filteredBadges.filter(b => !b.earned);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Text style={{ fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerTitle}>My Badges</Text>
          <Text style={styles.headerSubtitle}>Earned through your contributions</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={{ fontSize: 14 }}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelCardLeft}>
            <Text style={styles.levelLabel}>Your Level</Text>
            <Text style={styles.levelValue}>Level 6</Text>
            <Text style={styles.levelLeague}>Gold League</Text>
          </View>
          <View style={styles.xpCircle}>
            <Text style={styles.xpValue}>480</Text>
            <Text style={styles.xpUnit}>XP</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={styles.progressBarFill} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>68 / 100 XP to Level 7</Text>
            <Text style={styles.streakText}>⚡ 12 day streak</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Earned Badges */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Earned Badges</Text>
          <Text style={styles.sectionCount}> ({earnedBadges.length})</Text>
        </View>

        <View style={styles.badgeGrid}>
          {earnedBadges.map(badge => (
            <View key={badge.id} style={styles.badgeCard}>
              <View style={[styles.badgeIconCircle, badge.highlighted && styles.badgeIconCircleHighlighted]}>
                <Text style={{ fontSize: 22 }}>{badge.icon}</Text>
              </View>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
              <View style={styles.xpPill}>
                <Text style={styles.xpPillText}>+{badge.xp} XP</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Locked Badges */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Locked Badges</Text>
          <Text style={styles.sectionCount}> ({lockedBadges.length})</Text>
        </View>

        <View style={styles.badgeGrid}>
          {lockedBadges.map(badge => (
            <View key={badge.id} style={styles.badgeCard}>
              <View style={styles.badgeIconCircleLocked}>
                <Text style={{ fontSize: 18 }}>🔒</Text>
              </View>
              <Text style={styles.badgeLabelLocked}>{badge.label}</Text>
              <View style={styles.lockedPill}>
                <Text style={styles.lockedPillText}>Locked</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center' },
  headerTextWrapper: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  levelCard: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18 },
  levelCardLeft: { marginBottom: 8 },
  levelLabel: { fontSize: 12, color: '#aaa' },
  levelValue: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 2 },
  levelLeague: { fontSize: 13, color: '#ffd54f', marginTop: 2 },
  xpCircle: { position: 'absolute', top: 18, right: 18, width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
  xpValue: { fontSize: 16, fontWeight: '700', color: '#fff' },
  xpUnit: { fontSize: 10, color: '#aaa' },
  progressBarTrack: { height: 6, borderRadius: 3, backgroundColor: '#3a3a3a', marginTop: 14, overflow: 'hidden' },
  progressBarFill: { width: '68%', height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  progressText: { fontSize: 11, color: '#aaa' },
  streakText: { fontSize: 11, color: '#aaa' },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 18, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: '#f2f2f2', marginRight: 8 },
  filterChipActive: { backgroundColor: '#111' },
  filterChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 26, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  sectionCount: { fontSize: 14, color: '#999' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: { width: '31%', alignItems: 'center', marginBottom: 18 },
  badgeIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeIconCircleHighlighted: { borderWidth: 2, borderColor: '#6c5ce7' },
  badgeIconCircleLocked: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e8e8e8', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeLabel: { fontSize: 12, fontWeight: '600', color: '#111', textAlign: 'center' },
  badgeLabelLocked: { fontSize: 12, fontWeight: '600', color: '#bbb', textAlign: 'center' },
  xpPill: { backgroundColor: '#f2f2f2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  xpPillText: { fontSize: 11, color: '#555', fontWeight: '600' },
  lockedPill: { backgroundColor: '#f2f2f2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  lockedPillText: { fontSize: 11, color: '#aaa', fontWeight: '600' },
});
