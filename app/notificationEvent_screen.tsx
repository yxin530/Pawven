import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

type NotificationType = 'message' | 'approved';

interface NotificationItem {
  id: string;
  type: NotificationType;
  avatar: string;
  actorName: string;
  actionText: string;
  targetName: string;
  date: string;
  preview?: string;
}

interface EventItem {
  id: string;
  isLive: boolean;
  time: string;
  title: string;
  location: string;
  guestsLabel: string;
  isHost: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [];
const EVENTS: EventItem[] = [];

type TabKey = 'notifications' | 'events';

export default function NotificationsEventsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('notifications');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === 'notifications' ? 'Notifications' : 'Events'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <Pressable style={styles.tabItem} onPress={() => setActiveTab('notifications')}>
          <Text style={[styles.tabLabel, activeTab === 'notifications' && styles.tabLabelActive]}>
            Notifications
          </Text>
          {activeTab === 'notifications' && <View style={styles.tabIndicator} />}
        </Pressable>

        <Pressable style={styles.tabItem} onPress={() => setActiveTab('events')}>
          <Text style={[styles.tabLabel, activeTab === 'events' && styles.tabLabelActive]}>
            My Events
          </Text>
          {activeTab === 'events' && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'notifications' ? (
        <NotificationsList data={NOTIFICATIONS} />
      ) : (
        <EventsList data={EVENTS} router={router} />
      )}
    </SafeAreaView>
  );
}

function NotificationsList({ data }: { data: NotificationItem[] }) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Image source={require('@/assets/images/notification_emptystate.png')} style={styles.emptyImage} resizeMode="contain" />
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptyText}>When someone interacts with your events or profile, you will see it here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.notifRow}>
          <View style={styles.notifAvatarWrap}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={[styles.badge, item.type === 'approved' ? styles.badgeGreen : styles.badgeRed]}>
              <Text style={styles.badgeIcon}>{item.type === 'approved' ? '✓' : '📣'}</Text>
            </View>
          </View>
          <View style={styles.notifBody}>
            <Text style={styles.notifText}>
              <Text style={styles.notifBold}>{item.actorName}</Text>
              {` ${item.actionText} `}
              <Text style={styles.notifBold}>{item.targetName}</Text>
              <Text style={styles.notifDate}> {item.date}</Text>
            </Text>
            {!!item.preview && <Text style={styles.notifPreview} numberOfLines={2}>{item.preview}</Text>}
          </View>
        </View>
      )}
    />
  );
}

function EventsList({ data, router }: { data: EventItem[]; router: any }) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Image source={require('@/assets/images/events_emptystate.png')} style={styles.emptyImage} resizeMode="contain" />
        <Text style={styles.emptyTitle}>No events on your list</Text>
        <Text style={styles.emptyText}>Start joining or hosting events to see them here!</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/listEvents')}>
          <Text style={styles.browseBtnText}>Browse Events</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.eventCard} onPress={() => router.push({ pathname: '/eventDetail', params: { id: item.id, title: item.title } })}>
          <View style={styles.eventCardLeft}>
            <View style={styles.eventTimeRow}>
              {item.isLive && (
                <>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveLabel}>LIVE</Text>
                </>
              )}
              <Text style={styles.eventTime}>{item.time}</Text>
            </View>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventMeta}>📍 {item.location}</Text>
            <Text style={styles.eventMeta}>👥 {item.guestsLabel}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: '#1C1C1E' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  tabItem: { marginRight: 24, paddingBottom: 10 },
  tabLabel: { color: '#8E8E93', fontSize: 15, fontWeight: '600' },
  tabLabelActive: { color: '#1C1C1E' },
  tabIndicator: { marginTop: 8, height: 2, borderRadius: 1, backgroundColor: '#1C1C1E' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  // Notifications
  notifRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA' },
  notifAvatarWrap: { width: 44, height: 44, marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F7' },
  badge: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  badgeRed: { backgroundColor: '#FF3B30' },
  badgeGreen: { backgroundColor: '#34C759' },
  badgeIcon: { fontSize: 9, color: '#FFFFFF' },
  notifBody: { flex: 1 },
  notifText: { color: '#1C1C1E', fontSize: 14, lineHeight: 19 },
  notifBold: { fontWeight: '700' },
  notifDate: { color: '#8E8E93', fontSize: 12 },
  notifPreview: { color: '#8E8E93', fontSize: 13, marginTop: 4, lineHeight: 18 },
  // Events
  eventCard: { borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 14, padding: 14, marginBottom: 10 },
  eventCardLeft: { flex: 1 },
  eventTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B30', marginRight: 6 },
  liveLabel: { color: '#FF3B30', fontSize: 11, fontWeight: '700', marginRight: 8 },
  eventTime: { color: '#8E8E93', fontSize: 12, fontWeight: '500' },
  eventTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  eventMeta: { fontSize: 13, color: '#8E8E93', marginBottom: 2 },
  // Empty state
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyImage: { width: 180, height: 180, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
  browseBtn: { marginTop: 20, backgroundColor: '#1C1C1E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  browseBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
