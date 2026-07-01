import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Config } from '@/constants/Config';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 👋';
  if (hour < 18) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

// ─── Avatar Component ─────────────────────────────────────────────────────────
const Avatar = ({ size = 36, uri, fallback = '🧑' }: { size?: number; uri?: string; fallback?: string }) => {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: GREY_BG }}
      />
    );
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.5 }}>{fallback}</Text>
    </View>
  );
};

// Mini avatar for activity cards
const MiniAvatar = ({ emoji = '🐱', index = 0 }: { emoji?: string; index?: number }) => (
  <View style={[styles.miniAvatar, { marginLeft: index === 0 ? 0 : -8, zIndex: 10 - index }]}>
    <Image
      source={{ uri: `https://api.dicebear.com/9.x/thumbs/png?seed=cat${index}&size=48` }}
      style={{ width: 24, height: 24, borderRadius: 12 }}
    />
  </View>
);

// ─── Mock data ────────────────────────────────────────────────────────────────
const UPCOMING_ACTIVITIES = [
  {
    id: '1',
    type: 'featured',
    date: 'Sat, Jan 18 · 7:00 AM',
    title: 'Morning Colony Feeding Drive',
    location: 'Bukit Timah Nature Reserve',
    going: 14,
    action: 'Join',
    actionStyle: 'outline',
  },
  {
    id: '2',
    type: 'list',
    month: 'JAN',
    day: '22',
    title: 'TNR Workshop by SPCA',
    location: 'Online · 2:00 PM',
    tags: ['NGO', 'Free'],
    action: 'RSVP',
    actionStyle: 'solid',
  },
  {
    id: '3',
    type: 'list',
    month: 'FEB',
    day: '1',
    title: 'Vet Volunteer Day – Clementi',
    location: 'Clementi Comm. Centre · 9:00 AM',
    tags: ['Vet', 'In-person'],
    action: 'Join',
    actionStyle: 'outline',
  },
];

const COMMUNITIES = [
  { id: '1', name: 'West Side Feeders', members: '230 members', following: false, icon: '👥' },
  { id: '2', name: 'SPCA Volunteers SG', members: '1.2k members', following: true, icon: '🐾' },
  { id: '3', name: 'Vets for Strays', members: '580 members', following: true, icon: '🩺' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const AvatarStack = ({ count }: { count: number }) => (
  <View style={styles.avatarStack}>
    {[0, 1, 2].map((i) => (
      <MiniAvatar key={i} index={i} />
    ))}
    <Text style={styles.goingText}>+{count} going</Text>
  </View>
);

const Tag = ({ label }: { label: string }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

const FeaturedActivityCard = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.88}>
    <View style={styles.featuredBanner}>
      <Text style={styles.featuredBannerLabel}>Community Feeding · Park Area</Text>
    </View>
    <View style={styles.featuredBody}>
      <View style={styles.featuredMeta}>
        <View style={{ flex: 1 }}>
          <Text style={styles.featuredDate}>{item.date}</Text>
          <Text style={styles.featuredTitle}>{item.title}</Text>
          <Text style={styles.featuredLocation}>{item.location}</Text>
          <AvatarStack count={item.going} />
        </View>
        <TouchableOpacity style={styles.btnOutline} activeOpacity={0.8}>
          <Text style={styles.btnOutlineText}>{item.action}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const ListActivityCard = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.88}>
    <View style={styles.dateBadge}>
      <Text style={styles.dateBadgeMonth}>{item.month}</Text>
      <Text style={styles.dateBadgeDay}>{item.day}</Text>
    </View>
    <View style={styles.listCardInfo}>
      <Text style={styles.listCardTitle}>{item.title}</Text>
      <Text style={styles.listCardLocation}>{item.location}</Text>
      <View style={styles.tagRow}>
        {item.tags.map((t: string) => <Tag key={t} label={t} />)}
      </View>
    </View>
    {item.actionStyle === 'solid' ? (
      <TouchableOpacity style={styles.btnSolid} activeOpacity={0.85}>
        <Text style={styles.btnSolidText}>{item.action}</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.btnOutline} activeOpacity={0.8}>
        <Text style={styles.btnOutlineText}>{item.action}</Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

const CommunityCard = ({ item }: { item: any }) => (
  <View style={styles.communityCard}>
    <View style={styles.communityIcon}>
      <Text style={{ fontSize: 22 }}>{item.icon}</Text>
    </View>
    <Text style={styles.communityName}>{item.name}</Text>
    <Text style={styles.communityMembers}>{item.members}</Text>
    {item.following ? (
      <TouchableOpacity style={styles.btnFollowing} activeOpacity={0.8}>
        <Text style={styles.btnFollowingText}>Following</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.btnFollow} activeOpacity={0.85}>
        <Text style={styles.btnFollowText}>Follow</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const user = { name: (global as any).__pawven_name || 'there' };

  // Fetch real events from backend
  const [activities, setActivities] = useState(UPCOMING_ACTIVITIES);
  const [communities, setCommunities] = useState(COMMUNITIES);

  useEffect(() => {
    // Fetch events from backend
    fetch(`${Config.API_BASE_URL}/events`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.slice(0, 3).map((event: any, idx: number) => {
            const d = new Date(event.start_time);
            const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
            if (idx === 0) {
              return {
                id: event.id,
                type: 'featured',
                date: `${d.toLocaleDateString('en-US', { weekday: 'short' })}, ${months[d.getMonth()]} ${d.getDate()} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
                title: event.title,
                location: event.address || 'TBD',
                going: event.rsvp_count || 0,
                action: 'Join',
                actionStyle: 'outline',
              };
            }
            return {
              id: event.id,
              type: 'list',
              month: months[d.getMonth()],
              day: String(d.getDate()),
              title: event.title,
              location: `${event.address || 'TBD'} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
              tags: [event.category || 'Event'],
              action: 'RSVP',
              actionStyle: idx % 2 === 0 ? 'solid' : 'outline',
            };
          });
          setActivities(mapped);
        }
      })
      .catch(() => { /* keep mock data */ });
  }, []);

  // Smooth animated top bar
  const topBarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const TOP_BAR_HEIGHT = 100;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (currentY <= 0) {
      // At the very top — always show
      Animated.timing(topBarTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (diff > 5 && currentY > 50) {
      // Scrolling up — slide out slowly
      Animated.timing(topBarTranslateY, {
        toValue: -TOP_BAR_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (diff < -5) {
      // Scrolling down — slide back in slowly
      Animated.timing(topBarTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentY;
  };

  return (
    <View style={styles.safeArea}>
      {/* ── Top Nav (animated slide) ── */}
      <Animated.View style={[styles.topNav, { transform: [{ translateY: topBarTranslateY }] }]}>
        <View style={styles.topNavLogo}>
          <View style={styles.logoIcon}>
            <Text style={{ fontSize: 16 }}>🐾</Text>
          </View>
          <Text style={styles.logoText}>Pawven</Text>
        </View>
        <View style={styles.topNavActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            const role = (global as any).__pawven_role;
            if (role === 'ngo' || role === 'vet') {
              router.push('/(tabs)/ngoProfile');
            } else {
              router.push('/(tabs)/normalProfile');
            }
          }}>
            <Image
              source={{ uri: (global as any).__pawven_avatar || 'https://api.dicebear.com/9.x/avataaars/png?seed=default&size=72' }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: GREY_BG }}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ── Greeting ── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingLine}>{getGreeting()}</Text>
          <Text style={styles.greetingName}>{user.name}</Text>
        </View>

        {/* ── Search bar ── */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, feeders, NGOs..."
            placeholderTextColor="#AEAEB2"
          />
        </View>

        {/* ── Map card ── */}
        <TouchableOpacity
          style={styles.mapCard}
          onPress={() => router.push('/discoverMapScreen')}
          activeOpacity={0.88}
        >
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderEmoji}>🗺️</Text>
            <Text style={styles.mapPlaceholderText}>Map View</Text>
          </View>
          <View style={styles.mapCardBody}>
            <Text style={styles.mapCardTitle}>Map</Text>
            <Text style={styles.mapCardDesc}>
              Find nearby strays, smart feeders and communities — and connect with fellow cat lovers around you.
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── Upcoming Activities ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {activities.map(item =>
          item.type === 'featured' ? (
            <FeaturedActivityCard key={item.id} item={item} onPress={() => router.push({ pathname: '/eventDetail', params: { id: item.id, title: item.title, date: item.date || '', location: item.location } })} />
          ) : (
            <ListActivityCard key={item.id} item={item} onPress={() => router.push({ pathname: '/eventDetail', params: { id: item.id, title: item.title, location: item.location } })} />
          )
        )}

        {/* ── Active Communities ── */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Active Communities</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.communityList}
        >
          {COMMUNITIES.map(item => (
            <CommunityCard key={item.id} item={item} />
          ))}
        </ScrollView>

        {/* Extra space for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK = '#1C1C1E';
const GREY_BG = '#F2F2F7';
const GREY_TEXT = '#8E8E93';
const WHITE = '#FFFFFF';
const BORDER = '#E5E5EA';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: WHITE },

  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 56,
    backgroundColor: WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  topNavLogo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: DARK, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 17, fontWeight: '700', color: DARK },
  topNavActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 16 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 110 },

  greetingSection: { marginBottom: 16 },
  greetingLine: { fontSize: 14, color: GREY_TEXT, marginBottom: 2 },
  greetingName: { fontSize: 26, fontWeight: '700', color: DARK },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: GREY_BG, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 20, gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: DARK, padding: 0 },

  mapCard: {
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, overflow: 'hidden', marginBottom: 28,
  },
  mapPlaceholder: {
    height: 130, backgroundColor: GREY_BG,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  mapPlaceholderEmoji: { fontSize: 36 },
  mapPlaceholderText: { fontSize: 13, color: GREY_TEXT, fontWeight: '500' },
  mapCardBody: { padding: 14 },
  mapCardTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 4 },
  mapCardDesc: { fontSize: 13, color: GREY_TEXT, lineHeight: 19 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: DARK },
  seeAll: { fontSize: 13, color: GREY_TEXT },

  featuredCard: {
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, overflow: 'hidden', marginBottom: 12,
  },
  featuredBanner: {
    height: 110, backgroundColor: GREY_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  featuredBannerLabel: { fontSize: 13, color: GREY_TEXT },
  featuredBody: { padding: 14 },
  featuredMeta: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  featuredDate: { fontSize: 12, color: GREY_TEXT, marginBottom: 3 },
  featuredTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 3 },
  featuredLocation: { fontSize: 12, color: GREY_TEXT, marginBottom: 10 },

  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: WHITE, overflow: 'hidden',
  },
  goingText: { fontSize: 12, color: GREY_TEXT, marginLeft: 6 },

  listCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10, gap: 14,
  },
  dateBadge: { width: 42, alignItems: 'center', flexShrink: 0 },
  dateBadgeMonth: { fontSize: 11, fontWeight: '600', color: GREY_TEXT, textTransform: 'uppercase' },
  dateBadgeDay: { fontSize: 22, fontWeight: '700', color: DARK },
  listCardInfo: { flex: 1 },
  listCardTitle: { fontSize: 14, fontWeight: '600', color: DARK, marginBottom: 2 },
  listCardLocation: { fontSize: 12, color: GREY_TEXT, marginBottom: 6 },
  tagRow: { flexDirection: 'row', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: GREY_BG, borderRadius: 6 },
  tagText: { fontSize: 11, color: DARK, fontWeight: '500' },

  btnOutline: {
    borderWidth: 1.5, borderColor: DARK, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  btnOutlineText: { fontSize: 13, fontWeight: '600', color: DARK },
  btnSolid: {
    backgroundColor: DARK, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  btnSolidText: { fontSize: 13, fontWeight: '600', color: WHITE },

  communityList: { paddingBottom: 4, gap: 12 },
  communityCard: {
    width: 140, backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, padding: 16,
    alignItems: 'center', gap: 6,
  },
  communityIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  communityName: { fontSize: 13, fontWeight: '600', color: DARK, textAlign: 'center' },
  communityMembers: { fontSize: 11, color: GREY_TEXT, marginBottom: 4 },
  btnFollow: {
    backgroundColor: DARK, borderRadius: 10,
    paddingVertical: 7, paddingHorizontal: 20, width: '100%', alignItems: 'center',
  },
  btnFollowText: { fontSize: 12, fontWeight: '600', color: WHITE },
  btnFollowing: {
    backgroundColor: GREY_BG, borderRadius: 10,
    paddingVertical: 7, paddingHorizontal: 20, width: '100%', alignItems: 'center',
  },
  btnFollowingText: { fontSize: 12, fontWeight: '500', color: DARK },
});
