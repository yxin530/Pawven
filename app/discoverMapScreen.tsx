import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Config } from '@/constants/Config';

type MapFilterKey = 'All' | 'Feeder' | 'Events' | 'NGOs' | 'Vets';

// ─── Mock pins with coordinates ───────────────────────────────────────────────
const MAP_PINS = [
  { id: '1', type: 'feeder', icon: '🍽️', lat: 3.139, lng: 101.6869, title: 'Taman Desa Feeder' },
  { id: '2', type: 'community', icon: '👥', lat: 3.145, lng: 101.695, title: 'East Feeders Group' },
  { id: '3', type: 'vet', icon: '🩺', lat: 3.132, lng: 101.680, title: 'Dr. Lim Clinic' },
  { id: '4', type: 'feeder', icon: '🍽️', lat: 3.150, lng: 101.670, title: 'TTDI Feeder' },
  { id: '5', type: 'ngo', icon: '🏢', lat: 3.128, lng: 101.690, title: 'SPCA Selangor' },
];

const MAP_FILTERS: MapFilterKey[] = ['All', 'Feeder', 'Events', 'NGOs', 'Vets'];

// ─── Radar Pulse Component ────────────────────────────────────────────────────
const RADAR_SIZE = 80;

const RadarPulse = () => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    };
    createPulse(pulse1, 0).start();
    createPulse(pulse2, 1000).start();
  }, []);

  const getStyle = (anim: Animated.Value) => ({
    position: 'absolute' as const,
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: 'rgba(45, 80, 22, 0.15)',
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2] }) }],
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
  });

  return (
    <>
      <Animated.View style={getStyle(pulse1)} />
      <Animated.View style={getStyle(pulse2)} />
      <View style={styles.radarDot} />
    </>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DiscoverMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilterKey>('All');
  const [pins, setPins] = useState(MAP_PINS);
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; title: string; type: string } | null>(null);
  const [region, setRegion] = useState({
    latitude: 3.139,
    longitude: 101.6869,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const [feedersRes, orgsRes, eventsRes] = await Promise.all([
          fetch(`${Config.API_BASE_URL}/feeders`),
          fetch(`${Config.API_BASE_URL}/orgs`),
          fetch(`${Config.API_BASE_URL}/events`),
        ]);
        const newPins: typeof MAP_PINS = [];
        if (feedersRes.ok) {
          const feeders = await feedersRes.json();
          if (Array.isArray(feeders)) {
            feeders.forEach((f: any, idx: number) => {
              if (f.lat && f.lng && f.status === 'online') {
                newPins.push({ id: `feeder-${f.id || idx}`, type: 'feeder', icon: '🍽️', lat: f.lat, lng: f.lng, title: f.name || `Feeder ${idx + 1}` });
              }
            });
          }
        }
        if (orgsRes.ok) {
          const orgs = await orgsRes.json();
          if (Array.isArray(orgs)) {
            orgs.forEach((o: any, idx: number) => {
              if (o.lat && o.lng) {
                const type = o.type === 'vet' ? 'vet' : 'ngo';
                const icon = o.type === 'vet' ? '🩺' : '🏢';
                newPins.push({ id: `org-${o.id || idx}`, type, icon, lat: o.lat, lng: o.lng, title: o.name || `Org ${idx + 1}` });
              }
            });
          }
        }
        if (eventsRes.ok) {
          const events = await eventsRes.json();
          if (Array.isArray(events)) {
            events.forEach((e: any, idx: number) => {
              if (e.lat && e.lng) {
                newPins.push({ id: `event-${e.id || idx}`, type: 'community', icon: '📅', lat: e.lat, lng: e.lng, title: e.title || `Event ${idx + 1}` });
              }
            });
          }
        }
        if (newPins.length > 0) {
          setPins(newPins);
        }
      } catch (e) {
        // Keep mock pins as fallback
        console.log('Using mock map pins:', e);
      }
    };
    fetchPins();
  }, []);

  const filteredPins = pins.filter(pin => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Feeder') return pin.type === 'feeder';
    if (activeFilter === 'Events') return pin.type === 'community';
    if (activeFilter === 'NGOs') return pin.type === 'ngo';
    if (activeFilter === 'Vets') return pin.type === 'vet';
    return true;
  });

  const zoomIn = () => {
    setRegion(r => ({ ...r, latitudeDelta: r.latitudeDelta * 0.6, longitudeDelta: r.longitudeDelta * 0.6 }));
  };

  const zoomOut = () => {
    setRegion(r => ({ ...r, latitudeDelta: r.latitudeDelta * 1.5, longitudeDelta: r.longitudeDelta * 1.5 }));
  };

  return (
    <View style={styles.safeArea}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search on map..." placeholderTextColor="#AEAEB2" />
        </View>
        <TouchableOpacity style={styles.filterIconBtn}>
          <Text style={styles.filterIconText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter badges — same function as discover screen */}
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {MAP_FILTERS.map(f => (
            <TouchableOpacity key={f} style={[styles.chip, activeFilter === f && styles.chipActive]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* User location marker with radar */}
          <Marker coordinate={{ latitude: 3.139, longitude: 101.6869 }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={true}>
            <View style={styles.radarContainer}>
              <RadarPulse />
            </View>
          </Marker>

          {/* Filtered pins */}
          {filteredPins.map(pin => (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.lat, longitude: pin.lng }}
              title={pin.title}
              onPress={() => {
                if (pin.type === 'ngo' || pin.type === 'vet') {
                  setSelectedOrg({ id: pin.id, title: pin.title, type: pin.type });
                }
              }}
              onCalloutPress={() => {
                if (pin.type === 'community') {
                  router.push({ pathname: '/eventDetail', params: { id: pin.id, title: pin.title, location: pin.title } });
                }
              }}
            >
              <View style={[
                styles.pinBubble,
                (pin.type === 'feeder' || pin.type === 'vet') && styles.pinBubbleDark,
                pin.type === 'community' && styles.pinBubbleGrey,
                pin.type === 'ngo' && styles.pinBubbleOutline,
              ]}>
                <Text style={styles.pinIcon}>{pin.icon}</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Result count tooltip */}
        <View style={styles.resultTooltip}>
          <Text style={styles.resultTooltipText}>{filteredPins.length} results in area</Text>
        </View>

        {/* Zoom controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn}>
            <Text style={styles.zoomBtnText}>+</Text>
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut}>
            <Text style={styles.zoomBtnText}>−</Text>
          </TouchableOpacity>
        </View>

        {/* My location button */}
        <TouchableOpacity style={styles.locationBtn} onPress={() => setRegion(r => ({ ...r, latitude: 3.139, longitude: 101.6869 }))}>
          <Text style={styles.locationBtnText}>◎</Text>
        </TouchableOpacity>

        {/* Create Event button */}
        <TouchableOpacity style={styles.createEventBtn} onPress={() => router.push('/createEvent')}>
          <Text style={styles.createEventBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet for NGO/Vet profile preview */}
      <Modal visible={!!selectedOrg} transparent animationType="slide">
        <Pressable style={styles.sheetOverlay} onPress={() => setSelectedOrg(null)}>
          <View style={styles.sheetCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetContent}>
              <Image
                source={{ uri: `https://api.dicebear.com/9.x/initials/png?seed=${selectedOrg?.title || 'org'}&size=80` }}
                style={styles.sheetAvatar}
              />
              <Text style={styles.sheetName}>{selectedOrg?.title}</Text>
              <View style={styles.sheetBadge}>
                <Text style={styles.sheetBadgeText}>
                  {selectedOrg?.type === 'vet' ? 'Certified Vet' : 'Certified NGO'}
                </Text>
              </View>
              <Text style={styles.sheetSubtext}>Tap below to view full profile</Text>
              <TouchableOpacity
                style={styles.sheetViewBtn}
                onPress={() => {
                  const org = selectedOrg;
                  setSelectedOrg(null);
                  if (org) router.push({ pathname: '/orgProfile', params: { id: org.id, name: org.title, type: org.type } });
                }}
              >
                <Text style={styles.sheetViewBtnText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const DARK = '#1C1C1E';
const GREY_BG = '#F2F2F7';
const GREY_TEXT = '#8E8E93';
const WHITE = '#FFFFFF';
const BORDER = '#E5E5EA';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: WHITE, paddingTop: 50 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, backgroundColor: WHITE, zIndex: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: DARK },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: GREY_BG, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: DARK, padding: 0 },
  filterIconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center' },
  filterIconText: { fontSize: 16 },
  chipsRow: { backgroundColor: WHITE, paddingBottom: 10, zIndex: 10 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: GREY_BG },
  chipActive: { backgroundColor: DARK },
  chipText: { fontSize: 13, fontWeight: '500', color: DARK },
  chipTextActive: { color: WHITE },
  mapContainer: { flex: 1, position: 'relative' },
  // Radar
  radarContainer: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  radarDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#2D5016', borderWidth: 3, borderColor: WHITE, position: 'absolute' },
  // Pins
  pinBubble: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: GREY_BG },
  pinBubbleDark: { backgroundColor: DARK },
  pinBubbleGrey: { backgroundColor: '#6E6E73' },
  pinBubbleOutline: { backgroundColor: WHITE, borderWidth: 2, borderColor: DARK },
  pinIcon: { fontSize: 18 },
  // Tooltip
  resultTooltip: { position: 'absolute', top: 16, alignSelf: 'center', backgroundColor: DARK, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  resultTooltipText: { fontSize: 13, color: WHITE, fontWeight: '500' },
  // Zoom
  zoomControls: { position: 'absolute', right: 16, top: 80, backgroundColor: WHITE, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4, overflow: 'hidden' },
  zoomBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  zoomBtnText: { fontSize: 22, color: DARK },
  zoomDivider: { height: StyleSheet.hairlineWidth, backgroundColor: BORDER },
  // Location
  locationBtn: { position: 'absolute', right: 16, top: 190, width: 44, height: 44, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  locationBtnText: { fontSize: 22, color: DARK },
  createEventBtn: { position: 'absolute', bottom: 24, alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: DARK, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  createEventBtnText: { fontSize: 28, color: WHITE, fontWeight: '300', lineHeight: 30 },
  // Bottom sheet
  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheetCard: { backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, paddingTop: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D1D6', alignSelf: 'center', marginBottom: 16 },
  sheetContent: { alignItems: 'center', paddingHorizontal: 24 },
  sheetAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 12 },
  sheetName: { fontSize: 20, fontWeight: '700', color: DARK, marginBottom: 6 },
  sheetBadge: { backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, marginBottom: 8 },
  sheetBadgeText: { fontSize: 12, fontWeight: '600', color: '#6b6b6b' },
  sheetSubtext: { fontSize: 13, color: '#8E8E93', marginBottom: 16 },
  sheetViewBtn: { backgroundColor: DARK, paddingVertical: 14, paddingHorizontal: 48, borderRadius: 24 },
  sheetViewBtnText: { color: WHITE, fontSize: 15, fontWeight: '600' },
});
