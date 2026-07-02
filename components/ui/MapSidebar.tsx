import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  ImageSourcePropType,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/**
 * CommunityMapCard (Sidebar)
 * ---------------------------
 * A swipeable sidebar shown on the Discover Map screen.
 * - Swipe RIGHT on the card → OPEN the sidebar
 * - Swipe LEFT on the card → CLOSE the sidebar
 *
 * Surfaces everything happening around the user:
 *  - Community Events
 *  - Smart Feeders
 *  - NGOs
 *  - Vets
 *
 * Tapping any item navigates to its detail screen.
 */

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.82;
const SWIPE_THRESHOLD = 60;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CategoryKey = 'events' | 'feeders' | 'ngos' | 'vets';

interface EventItem {
  id: string;
  title: string;
  emoji: string;
  day: string;
  month: string;
  section: 'This week' | 'Coming up';
  location?: string;
}

interface FeederItem {
  id: string;
  title: string;
  emoji: string;
  fillLevel: number;
  distanceKm: number;
}

interface PlaceItem {
  id: string;
  title: string;
  emoji: string;
  status: 'Open now' | 'Closed';
  distanceKm: number;
  type?: string;
  followers?: string;
  volunteers?: string;
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const EVENTS: EventItem[] = [
  { id: '001_event', title: 'Workshop by SPCA', emoji: '🎓', day: '20', month: 'NOV', section: 'This week', location: 'Ampang, Selangor' },
  { id: '002_event', title: 'Vet Volunteer Day', emoji: '🩺', day: '22', month: 'NOV', section: 'This week', location: 'Petaling Jaya' },
  { id: '003_event', title: 'Colony Count in Pasir Ris', emoji: '🐱', day: '4', month: 'DEC', section: 'Coming up', location: 'Pasir Ris, Singapore' },
  { id: '004_event', title: 'Cat Owners Hangout', emoji: '🍻', day: '10', month: 'DEC', section: 'Coming up', location: 'George Town, Penang' },
];

const FEEDERS: FeederItem[] = [
  { id: '001_feeder', title: 'Cats Canteen', emoji: '🐾', fillLevel: 82, distanceKm: 0.4 },
  { id: '002_feeder', title: 'Home for Cats', emoji: '🐾', fillLevel: 21, distanceKm: 1.2 },
  { id: '003_feeder', title: 'Taman Desa Feeder', emoji: '🐾', fillLevel: 55, distanceKm: 2.1 },
];

const NGOS: PlaceItem[] = [
  { id: '001_ngo', title: 'SPCA Selangor', emoji: '🏠', status: 'Open now', distanceKm: 0.8, type: 'ngo', followers: '5231', volunteers: '183 volunteers' },
  { id: '002_ngo', title: 'SPCA Singapore', emoji: '🏠', status: 'Open now', distanceKm: 1.6, type: 'ngo', followers: '10420', volunteers: '265 volunteers' },
  { id: '003_ngo', title: 'Cat Welfare SG', emoji: '🏠', status: 'Closed', distanceKm: 3.2, type: 'ngo', followers: '8120', volunteers: '148 volunteers' },
];

const VETS: PlaceItem[] = [
  { id: '001_vet', title: 'Dr Priya Sharma', emoji: '🩺', status: 'Open now', distanceKm: 0.6, type: 'vet', followers: '1623', volunteers: '⭐ 4.9' },
  { id: '002_vet', title: 'Dr Kevin Ong', emoji: '🩺', status: 'Open now', distanceKm: 1.9, type: 'vet', followers: '2148', volunteers: '⭐ 4.8' },
  { id: '003_vet', title: 'Dr Lim Pet Clinic', emoji: '🩺', status: 'Closed', distanceKm: 2.5, type: 'vet', followers: '3578', volunteers: '⭐ 4.7' },
];

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

const SectionHeader: React.FC<{ title: string; onPress?: () => void }> = ({ title, onPress }) => (
  <Pressable style={styles.sectionHeaderRow} onPress={onPress} hitSlop={8}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
    <Feather name="arrow-right" size={18} color="#B3B0AC" />
  </Pressable>
);

const TagBadge: React.FC<{ label: string; tone?: 'date' | 'open' | 'closed' }> = ({ label, tone = 'date' }) => (
  <View
    style={[
      styles.tagBadge,
      tone === 'open' && styles.tagBadgeOpen,
      tone === 'closed' && styles.tagBadgeClosed,
    ]}
  >
    <Text style={styles.tagBadgeText}>{label}</Text>
  </View>
);

const IconTile: React.FC<{ emoji: string; badge?: React.ReactNode }> = ({ emoji, badge }) => (
  <View style={styles.iconTile}>
    <Text style={styles.iconTileEmoji}>{emoji}</Text>
    {badge ? <View style={styles.iconTileBadge}>{badge}</View> : null}
  </View>
);

const Row: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}> = ({ icon, title, subtitle, onPress }) => (
  <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
    {icon}
    <View style={styles.rowTextWrap}>
      <Text style={styles.rowTitle} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    <Feather name="chevron-right" size={16} color="#B3B0AC" />
  </Pressable>
);

// ---------------------------------------------------------------------------
// Category tab bar
// ---------------------------------------------------------------------------

const CATEGORIES: { key: CategoryKey; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'events', label: 'Events', icon: 'calendar' },
  { key: 'feeders', label: 'Feeders', icon: 'wind' },
  { key: 'ngos', label: 'NGOs', icon: 'home' },
  { key: 'vets', label: 'Vets', icon: 'plus-square' },
];

const CategoryTabs: React.FC<{ active: CategoryKey; onChange: (k: CategoryKey) => void }> = ({
  active,
  onChange,
}) => (
  <View style={styles.tabBar}>
    {CATEGORIES.map((c) => {
      const isActive = c.key === active;
      return (
        <Pressable
          key={c.key}
          onPress={() => onChange(c.key)}
          style={[styles.tabItem, isActive && styles.tabItemActive]}
        >
          <Feather name={c.icon} size={15} color={isActive ? '#2A2622' : '#9C9893'} />
          <Text style={[styles.tabItemText, isActive && styles.tabItemTextActive]}>{c.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

// ---------------------------------------------------------------------------
// Main component — Swipeable Sidebar
// ---------------------------------------------------------------------------

export interface CommunityMapCardProps {
  /** Whether the sidebar starts open */
  initialOpen?: boolean;
  /** Callback when sidebar visibility changes */
  onVisibilityChange?: (isOpen: boolean) => void;
}

const CommunityMapCard: React.FC<CommunityMapCardProps> = ({
  initialOpen = false,
  onVisibilityChange,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CategoryKey>('events');
  const [isOpen, setIsOpen] = useState(initialOpen);

  // Animated translateX — sidebar slides from the left
  const translateX = useRef(new Animated.Value(initialOpen ? 0 : -SIDEBAR_WIDTH)).current;

  useEffect(() => {
    onVisibilityChange?.(isOpen);
  }, [isOpen]);

  const openSidebar = () => {
    setIsOpen(true);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 65,
    }).start();
  };

  const closeSidebar = () => {
    setIsOpen(false);
    Animated.spring(translateX, {
      toValue: -SIDEBAR_WIDTH,
      useNativeDriver: true,
      friction: 8,
      tension: 65,
    }).start();
  };

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal gestures
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (isOpen) {
          // When open, allow dragging left to close
          const newX = Math.min(0, Math.max(-SIDEBAR_WIDTH, gestureState.dx));
          translateX.setValue(newX);
        } else {
          // When closed, allow dragging right to open
          const newX = Math.min(0, -SIDEBAR_WIDTH + Math.max(0, gestureState.dx));
          translateX.setValue(newX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isOpen) {
          // If swiped left enough, close
          if (gestureState.dx < -SWIPE_THRESHOLD || gestureState.vx < -0.5) {
            closeSidebar();
          } else {
            openSidebar();
          }
        } else {
          // If swiped right enough, open
          if (gestureState.dx > SWIPE_THRESHOLD || gestureState.vx > 0.5) {
            openSidebar();
          } else {
            closeSidebar();
          }
        }
      },
    })
  ).current;

  // Grouped events
  const groupedEvents = useMemo(
    () => ({
      'This week': EVENTS.filter((e) => e.section === 'This week'),
      'Coming up': EVENTS.filter((e) => e.section === 'Coming up'),
    }),
    []
  );

  // ─── Navigation handlers ───────────────────────────────────────────────────

  const handleSelectEvent = (item: EventItem) => {
    router.push({
      pathname: '/eventDetail',
      params: { id: item.id, title: item.title, location: item.location || item.title },
    });
  };

  const handleSelectFeeder = (item: FeederItem) => {
    router.push('/feederManagement');
  };

  const handleSelectNgo = (item: PlaceItem) => {
    router.push({
      pathname: '/orgProfile',
      params: {
        id: item.id,
        name: item.title,
        type: 'ngo',
        followers: item.followers || '0',
        volunteers: item.volunteers || '0',
      },
    });
  };

  const handleSelectVet = (item: PlaceItem) => {
    router.push({
      pathname: '/orgProfile',
      params: {
        id: item.id,
        name: item.title,
        type: 'vet',
        followers: item.followers || '0',
        volunteers: item.volunteers || '0',
      },
    });
  };

  const handleSeeAll = (category: CategoryKey) => {
    switch (category) {
      case 'events':
        router.push('/listEvents');
        break;
      case 'feeders':
        router.push('/listFeeders');
        break;
      case 'ngos':
        router.push('/listNgos');
        break;
      case 'vets':
        router.push('/listVets');
        break;
    }
  };

  // ─── Tab descriptions ──────────────────────────────────────────────────────

  const copy = {
    events: {
      title: 'Nearby Events',
      desc: 'Community events happening around you — meetups, workshops and volunteer opportunities.',
    },
    feeders: {
      title: 'Smart Feeders',
      desc: 'Stray-feeding stations near you. Tap a feeder to check its fill level or manage it.',
    },
    ngos: {
      title: 'Rescues & NGOs',
      desc: 'Cat rescues and shelters near you. Reach out if you spot a stray that needs help.',
    },
    vets: {
      title: 'Vets Nearby',
      desc: 'Clinics near you for checkups, vaccinations, or emergencies.',
    },
  }[activeTab];

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Overlay backdrop when open — tap to close */}
      {isOpen && (
        <Pressable style={styles.backdrop} onPress={closeSidebar} />
      )}

      {/* Visible peek tab on the left edge — shows when sidebar is closed */}
      {!isOpen && (
        <Pressable style={styles.peekTab} onPress={openSidebar} {...panResponder.panHandlers}>
          <Text style={styles.peekTabIcon}>☰</Text>
          <View style={styles.peekTabDots}>
            <View style={styles.peekDot} />
            <View style={styles.peekDot} />
            <View style={styles.peekDot} />
          </View>
        </Pressable>
      )}

      {/* Sidebar panel */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX }] }]}
        {...(isOpen ? panResponder.panHandlers : {})}
      >
        {/* Drag handle */}
        <View style={styles.dragHandle}>
          <View style={styles.dragHandleBar} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Category tabs */}
          <CategoryTabs active={activeTab} onChange={setActiveTab} />

          {/* Title + description */}
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.description}>{copy.desc}</Text>

          {/* ── EVENTS ── */}
          {activeTab === 'events' && (
            <>
              <SectionHeader title="This week" onPress={() => handleSeeAll('events')} />
              {groupedEvents['This week'].map((item) => (
                <Row
                  key={item.id}
                  icon={<IconTile emoji={item.emoji} badge={<TagBadge label={`${item.month} ${item.day}`} />} />}
                  title={item.title}
                  subtitle={item.location}
                  onPress={() => handleSelectEvent(item)}
                />
              ))}

              <SectionHeader title="Coming up" onPress={() => handleSeeAll('events')} />
              {groupedEvents['Coming up'].map((item) => (
                <Row
                  key={item.id}
                  icon={<IconTile emoji={item.emoji} badge={<TagBadge label={`${item.month} ${item.day}`} />} />}
                  title={item.title}
                  subtitle={item.location}
                  onPress={() => handleSelectEvent(item)}
                />
              ))}
            </>
          )}

          {/* ── FEEDERS ── */}
          {activeTab === 'feeders' && (
            <>
              <SectionHeader title="Near you" onPress={() => handleSeeAll('feeders')} />
              {FEEDERS.map((item) => (
                <Row
                  key={item.id}
                  icon={
                    <IconTile
                      emoji={item.emoji}
                      badge={<TagBadge label={`${item.fillLevel}%`} tone={item.fillLevel < 30 ? 'closed' : 'open'} />}
                    />
                  }
                  title={item.title}
                  subtitle={`${item.distanceKm.toFixed(1)} km away`}
                  onPress={() => handleSelectFeeder(item)}
                />
              ))}
            </>
          )}

          {/* ── NGOS ── */}
          {activeTab === 'ngos' && (
            <>
              <SectionHeader title="Near you" onPress={() => handleSeeAll('ngos')} />
              {NGOS.map((item) => (
                <Row
                  key={item.id}
                  icon={
                    <IconTile
                      emoji={item.emoji}
                      badge={<TagBadge label={item.status} tone={item.status === 'Open now' ? 'open' : 'closed'} />}
                    />
                  }
                  title={item.title}
                  subtitle={`${item.distanceKm.toFixed(1)} km away`}
                  onPress={() => handleSelectNgo(item)}
                />
              ))}
            </>
          )}

          {/* ── VETS ── */}
          {activeTab === 'vets' && (
            <>
              <SectionHeader title="Near you" onPress={() => handleSeeAll('vets')} />
              {VETS.map((item) => (
                <Row
                  key={item.id}
                  icon={
                    <IconTile
                      emoji={item.emoji}
                      badge={<TagBadge label={item.status} tone={item.status === 'Open now' ? 'open' : 'closed'} />}
                    />
                  }
                  title={item.title}
                  subtitle={`${item.distanceKm.toFixed(1)} km away`}
                  onPress={() => handleSelectVet(item)}
                />
              ))}
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default CommunityMapCard;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const PINK = '#FBE7E3';
const PINK_DARK = '#F6D3CD';
const INK = '#211E1B';
const GRAY = '#8C8983';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  peekTab: {
    position: 'absolute',
    left: 0,
    top: (SCREEN_HEIGHT - 80) / 2,
    width: 28,
    height: 80,
    backgroundColor: '#1C1C1E',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 101,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 0 },
    elevation: 8,
  },
  peekTabIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  peekTabDots: {
    alignItems: 'center',
    gap: 4,
  },
  peekDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 50,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 4, height: 0 },
    elevation: 16,
    zIndex: 102,
  },
  dragHandle: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F4F2EF',
    borderRadius: 14,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: GRAY,
  },
  tabItemTextActive: {
    color: INK,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    marginTop: 18,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: GRAY,
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 17,
    fontWeight: '800',
    color: INK,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK,
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    gap: 10,
  },
  rowPressed: {
    backgroundColor: PINK_DARK,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },
  rowSubtitle: {
    fontSize: 12,
    color: GRAY,
    marginTop: 2,
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileEmoji: {
    fontSize: 20,
  },
  iconTileBadge: {
    position: 'absolute',
    top: -8,
    right: -10,
  },
  tagBadge: {
    backgroundColor: '#E4443A',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  tagBadgeOpen: {
    backgroundColor: '#3E9A5F',
  },
  tagBadgeClosed: {
    backgroundColor: '#9C9893',
  },
  tagBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
