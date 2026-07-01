import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Config } from '@/constants/Config';

type FilterTab = 'all' | 'confirmed' | 'pending' | 'rejected';

interface Attendee {
  id: string;
  user_id: string;
  user_name: string | null;
  user_avatar_url: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

export default function EventAttendeesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; title?: string }>();
  const eventId = params.id || '';
  const eventTitle = params.title || 'Event';

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${Config.API_BASE_URL}/events/${eventId}/attendees`);
      if (res.ok) {
        const data = await res.json();
        setAttendees(data);
      }
    } catch {
      // Keep empty
    }
    setLoading(false);
  };

  const handleApprove = async (rsvpId: string) => {
    try {
      const res = await fetch(`${Config.API_BASE_URL}/events/${eventId}/attendees/${rsvpId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      if (res.ok) {
        setAttendees(prev => prev.map(a => a.id === rsvpId ? { ...a, status: 'confirmed' } : a));
        Alert.alert('Approved', 'Attendee has been approved.');
      } else {
        Alert.alert('Error', 'Failed to approve.');
      }
    } catch {
      // Fallback: update locally
      setAttendees(prev => prev.map(a => a.id === rsvpId ? { ...a, status: 'confirmed' } : a));
    }
  };

  const handleReject = async (rsvpId: string) => {
    Alert.alert('Reject Registration', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${Config.API_BASE_URL}/events/${eventId}/attendees/${rsvpId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'rejected' }),
            });
            if (res.ok) {
              setAttendees(prev => prev.map(a => a.id === rsvpId ? { ...a, status: 'rejected' } : a));
            }
          } catch {
            setAttendees(prev => prev.map(a => a.id === rsvpId ? { ...a, status: 'rejected' } : a));
          }
        }
      },
    ]);
  };

  const filtered = attendees.filter(a => {
    if (activeTab === 'all') return true;
    return a.status === activeTab;
  });

  const counts = {
    all: attendees.length,
    confirmed: attendees.filter(a => a.status === 'confirmed').length,
    pending: attendees.filter(a => a.status === 'pending').length,
    rejected: attendees.filter(a => a.status === 'rejected').length,
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'confirmed', label: `Confirmed (${counts.confirmed})` },
    { key: 'pending', label: `Pending (${counts.pending})` },
    { key: 'rejected', label: `Rejected (${counts.rejected})` },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Attendees</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{eventTitle}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator color="#FFFFFF" /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No attendees yet</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {filtered.map((attendee) => (
            <View key={attendee.id} style={styles.attendeeRow}>
              {attendee.user_avatar_url ? (
                <Image source={{ uri: attendee.user_avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
              )}

              <View style={styles.attendeeInfo}>
                <Text style={styles.attendeeName}>{attendee.user_name || 'User'}</Text>
                <Text style={styles.attendeeDate}>
                  {new Date(attendee.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>

              {/* Status badge / actions */}
              {attendee.status === 'pending' ? (
                <View style={styles.actionGroup}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(attendee.id)}>
                    <Text style={styles.approveBtnText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(attendee.id)}>
                    <Text style={styles.rejectBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.statusBadge, attendee.status === 'confirmed' ? styles.statusConfirmed : styles.statusRejected]}>
                  <Text style={[styles.statusBadgeText, attendee.status === 'confirmed' ? styles.statusTextConfirmed : styles.statusTextRejected]}>
                    {attendee.status === 'confirmed' ? 'Confirmed' : 'Rejected'}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111214' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: '#FFFFFF' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#8A8A8E', marginTop: 2 },
  tabRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  tabTextActive: { color: '#111214' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#8A8A8E' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#5B6470', alignItems: 'center', justifyContent: 'center' },
  attendeeInfo: { flex: 1, marginLeft: 12 },
  attendeeName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  attendeeDate: { fontSize: 12, color: '#8A8A8E', marginTop: 2 },
  actionGroup: { flexDirection: 'row', gap: 8 },
  approveBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  approveBtnText: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  rejectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,59,48,0.15)', alignItems: 'center', justifyContent: 'center' },
  rejectBtnText: { fontSize: 16, color: '#FF3B30', fontWeight: '700' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusConfirmed: { backgroundColor: 'rgba(76,175,80,0.15)' },
  statusRejected: { backgroundColor: 'rgba(255,59,48,0.1)' },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  statusTextConfirmed: { color: '#4CAF50' },
  statusTextRejected: { color: '#FF3B30' },
});
