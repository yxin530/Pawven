import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

type ActivityEntry = { time: string; usersFed: number; grams: number };

type Feeder = {
  id: string; name: string; location: string; type: string; typeIcon: string;
  status: 'Online' | 'Offline'; usersFed: number; usersFedTotal: number;
  kibblesG: number; kibblesGTotal: number; recentActivity: ActivityEntry[];
};

const FEEDERS: Feeder[] = [
  { id: 'feeder-1', name: 'Feeder #1 — Taman Desa', location: 'Taman Desa', type: 'Mini Solar + Normal', typeIcon: '☀️', status: 'Online', usersFed: 68, usersFedTotal: 100, kibblesG: 1240, kibblesGTotal: 2000, recentActivity: [{ time: '07:30 AM', usersFed: 3, grams: 120 }, { time: '12:15 PM', usersFed: 5, grams: 200 }, { time: '06:00 PM', usersFed: 2, grams: 80 }] },
  { id: 'feeder-2', name: 'Feeder #2 — Bangsar', location: 'Bangsar', type: 'Large + Battery', typeIcon: '🔋', status: 'Online', usersFed: 42, usersFedTotal: 100, kibblesG: 890, kibblesGTotal: 2000, recentActivity: [] },
];

export default function FeederManagementScreen() {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['feeder-1']));
  const [visibleCount, setVisibleCount] = useState(2);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const visibleFeeders = FEEDERS.slice(0, visibleCount);
  const hasMore = visibleCount < FEEDERS.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Back + Header */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, color: '#111', fontWeight: '500' }}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Feeder Management</Text>
        <View style={styles.ownedBadge}><Text style={styles.ownedBadgeText}>8 Owned</Text></View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}><Text style={{ fontSize: 18 }}>🍲</Text><Text style={styles.statValue}>14.2 kg</Text><Text style={styles.statLabel}>Total Kibbles Dispensed</Text></View>
        <View style={styles.statCard}><Text style={{ fontSize: 18 }}>👥</Text><Text style={styles.statValue}>340</Text><Text style={styles.statLabel}>Total Feeder Users</Text></View>
        <View style={styles.statCard}><Text style={{ fontSize: 18 }}>⏰</Text><Text style={styles.statValue}>2h ago</Text><Text style={styles.statLabel}>Last Activity</Text></View>
        <View style={styles.statCard}><Text style={{ fontSize: 18 }}>✅</Text><Text style={styles.statValue}>7 / 8</Text><Text style={styles.statLabel}>Feeders Online</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Tracking Records</Text>

      {visibleFeeders.map(feeder => {
        const isExpanded = expandedIds.has(feeder.id);
        const usersFedPct = Math.min(feeder.usersFed / feeder.usersFedTotal, 1);
        const kibblesPct = Math.min(feeder.kibblesG / feeder.kibblesGTotal, 1);

        return (
          <TouchableOpacity key={feeder.id} style={styles.feederCard} activeOpacity={0.85} onPress={() => toggleExpanded(feeder.id)}>
            <View style={styles.feederHeaderRow}>
              <Text style={styles.feederName}>{feeder.name}</Text>
              <View style={styles.statusPill}><Text style={styles.statusPillText}>{feeder.status}</Text></View>
            </View>
            <Text style={styles.feederTypeText}>{feeder.typeIcon}  {feeder.type}</Text>

            <View style={styles.metricRow}><Text style={styles.metricLabel}>👥 Users Fed</Text><Text style={styles.metricValue}>{feeder.usersFed} / {feeder.usersFedTotal}</Text></View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${usersFedPct * 100}%` }]} /></View>

            <View style={styles.metricRow}><Text style={styles.metricLabel}>🍲 Kibbles (g)</Text><Text style={styles.metricValue}>{feeder.kibblesG.toLocaleString()} / {feeder.kibblesGTotal.toLocaleString()} g</Text></View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${kibblesPct * 100}%` }]} /></View>

            {isExpanded && feeder.recentActivity.length > 0 && (
              <View style={styles.recentActivityBox}>
                <Text style={styles.recentActivityTitle}>Recent Activity</Text>
                {feeder.recentActivity.map((entry, idx) => (
                  <View key={idx} style={styles.activityRow}>
                    <Text style={styles.activityTime}>{entry.time} — {entry.usersFed} users</Text>
                    <Text style={styles.activityGrams}>{entry.grams} g</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {hasMore && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={() => setVisibleCount(c => c + 2)}>
          <Text style={styles.loadMoreText}>⬇  Load More Feeders</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#111' },
  ownedBadge: { backgroundColor: '#111', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  ownedBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  statCard: { width: '48%', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, marginBottom: 12 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111', marginTop: 10 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginTop: 12, marginBottom: 12 },
  feederCard: { borderWidth: 1, borderColor: '#eee', borderRadius: 14, padding: 16, marginBottom: 14 },
  feederHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feederName: { fontSize: 16, fontWeight: '700', color: '#111' },
  statusPill: { backgroundColor: '#f2f2f2', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 12, color: '#444', fontWeight: '500' },
  feederTypeText: { fontSize: 12, color: '#999', marginTop: 4, marginBottom: 14 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  metricLabel: { fontSize: 13, color: '#444', fontWeight: '500' },
  metricValue: { fontSize: 13, color: '#111', fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#eee', overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', backgroundColor: '#222', borderRadius: 3 },
  recentActivityBox: { backgroundColor: '#f7f7f7', borderRadius: 10, padding: 14, marginTop: 4 },
  recentActivityTitle: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 10 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  activityTime: { fontSize: 13, color: '#333' },
  activityGrams: { fontSize: 13, color: '#333', fontWeight: '500' },
  loadMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, paddingVertical: 14, marginTop: 4 },
  loadMoreText: { fontSize: 14, fontWeight: '600', color: '#333' },
});
