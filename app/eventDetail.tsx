import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Share,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Config } from '@/constants/Config';

// Generic avatar
const AvatarIcon = ({ uri, size = 40 }: { uri?: string; size?: number }) => {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.4 }}>👤</Text>
    </View>
  );
};

type RegistrationState = 'register' | 'pending' | 'registered' | 'invited-only';

export default function EventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    date?: string;
    location?: string;
    address?: string;
    description?: string;
    going?: string;
    coverPhoto?: string;
    requireApproval?: string;
    visibility?: string;
  }>();

  const eventId = params.id || '';
  const [eventTitle, setEventTitle] = useState(params.title || 'Event Title');
  const [dateRange, setDateRange] = useState(params.date || '');
  const [locationName, setLocationName] = useState(params.location || 'Venue Name');
  const [address, setAddress] = useState(params.address || '');
  const [description, setDescription] = useState(params.description || '');
  const [goingCount, setGoingCount] = useState(parseInt(params.going || '0', 10));
  const [coverImageUri, setCoverImageUri] = useState(params.coverPhoto || '');
  const [requireApproval, setRequireApproval] = useState(params.requireApproval === 'true');
  const [visibility, setVisibility] = useState(params.visibility || 'Public');

  const [regState, setRegState] = useState<RegistrationState>(
    params.visibility === 'Private' ? 'invited-only' : 'register'
  );
  const [isInvited, setIsInvited] = useState(false); // Will be true if user was invited by host
  const [attendees, setAttendees] = useState<{ id: string; uri?: string }[]>([
    { id: 'a1' }, { id: 'a2' }, { id: 'a3' }, { id: 'a4' }, { id: 'a5' },
  ]);
  const [showMorePopover, setShowMorePopover] = useState(false);

  // Host info — loaded from backend or defaults
  const [hosts, setHosts] = useState([
    { id: '1', name: 'Event Host', role: 'Organizer', instagram: 'https://instagram.com/pawven', email: 'host@pawven.app' },
  ]);

  // ─── Fetch event details from backend ─────────────────────────────────
  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${Config.API_BASE_URL}/events`);
        if (!res.ok) return;
        const events = await res.json();
        const event = Array.isArray(events) ? events.find((e: any) => e.id === eventId) : null;
        if (event) {
          setEventTitle(event.title || eventTitle);
          setDescription(event.description || '');
          setLocationName(event.address || locationName);
          setAddress(event.address || '');
          setCoverImageUri(event.cover_photo_url || '');
          setGoingCount(event.rsvp_count || 0);
          if (event.require_approval) setRequireApproval(true);
          if (event.visibility === 'Private') {
            setVisibility('Private');
            // For private events, check if user is invited (mock: always not invited unless host)
            // In production, you'd check an invites table
            setRegState('invited-only');
            setIsInvited(false);
          }
          // Host contact info
          if (event.host_instagram || event.host_email) {
            setHosts([{
              id: '1',
              name: 'Event Host',
              role: 'Organizer',
              instagram: event.host_instagram || '',
              email: event.host_email || '',
            }]);
          }
          if (event.start_time) {
            const s = new Date(event.start_time);
            const e = event.end_time ? new Date(event.end_time) : null;
            const dateStr = s.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const timeStr = s.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            const endStr = e ? ` - ${e.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}` : '';
            setDateRange(`${dateStr}, ${timeStr}${endStr}`);
          }
        }
      } catch {
        // Use params as fallback
      }
    };
    fetchEvent();
  }, [eventId]);

  // ─── Register ─────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (regState === 'registered' || regState === 'pending' || regState === 'invited-only') return;

    try {
      const res = await fetch(`${Config.API_BASE_URL}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (requireApproval) {
          setRegState('pending');
        } else {
          setRegState('registered');
          setGoingCount(data.rsvpCount || goingCount + 1);
          const userAvatar = (global as any).__pawven_avatar;
          setAttendees(prev => [{ id: 'me', uri: userAvatar }, ...prev]);
        }
      } else if (res.status === 409) {
        setRegState('registered');
        Alert.alert('Already Registered', 'You are already registered for this event.');
      } else {
        throw new Error('Failed');
      }
    } catch {
      // Fallback: register locally
      if (requireApproval) {
        setRegState('pending');
      } else {
        setRegState('registered');
        setGoingCount(prev => prev + 1);
        const userAvatar = (global as any).__pawven_avatar;
        setAttendees(prev => [{ id: 'me', uri: userAvatar }, ...prev]);
      }
    }

    if (requireApproval) {
      Alert.alert('Pending Approval', 'Your registration is pending host approval.');
    } else {
      Alert.alert('Registered! 🎉', 'You are now going to this event.');
    }
  };

  // ─── Share ────────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${eventTitle}" on Pawven!\n📅 ${dateRange}\n📍 ${locationName}`,
      });
    } catch {}
  };

  // ─── Contact ──────────────────────────────────────────────────────────
  const handleContact = () => {
    const host = hosts[0];
    const contactLines: string[] = [];
    if (host.instagram && host.instagram.length > 0) {
      const handle = host.instagram.replace('https://instagram.com/', '').replace('https://www.instagram.com/', '');
      contactLines.push(`📷 Instagram: @${handle}`);
    }
    if (host.email && host.email.length > 0) {
      contactLines.push(`✉️ Email: ${host.email}`);
    }
    if (contactLines.length === 0) {
      Alert.alert('No Contact Info', 'The host has not provided contact information.');
      return;
    }
    Alert.alert(
      `Contact ${host.name}`,
      contactLines.join('\n'),
      [{ text: 'OK' }]
    );
  };

  // ─── Report ───────────────────────────────────────────────────────────
  const handleReport = () => {
    setShowMorePopover(false);
    Alert.alert(
      'Report Event',
      'Are you sure you want to report this event? Our team will review it.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you. We will review this event.') },
      ]
    );
  };

  // ─── Map preview tap ──────────────────────────────────────────────────
  const handleMapPress = () => {
    router.push('/discoverMapScreen');
  };

  // ─── Register button label & style ────────────────────────────────────
  const getRegisterButtonLabel = () => {
    switch (regState) {
      case 'invited-only':
        return isInvited ? 'RSVP' : 'Invite Only';
      case 'pending': return '⏳ Pending Approval';
      case 'registered': return '✓ Registered';
      default: return 'Register';
    }
  };

  const getRegisterButtonStyle = () => {
    switch (regState) {
      case 'invited-only':
        return isInvited ? styles.primaryAction : styles.primaryActionDisabled;
      case 'pending': return styles.primaryActionPending;
      case 'registered': return styles.primaryActionRegistered;
      default: return styles.primaryAction;
    }
  };

  const getRegisterTextStyle = () => {
    switch (regState) {
      case 'invited-only':
        return isInvited ? styles.primaryActionText : styles.primaryActionTextDisabled;
      case 'pending': return styles.primaryActionTextPending;
      case 'registered': return styles.primaryActionTextRegistered;
      default: return styles.primaryActionText;
    }
  };

  const isRegisterDisabled = () => {
    if (regState === 'registered' || regState === 'pending') return true;
    if (regState === 'invited-only' && !isInvited) return true;
    return false;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.circleButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.circleButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.topBarTitle} numberOfLines={1}>{eventTitle}</Text>

        <TouchableOpacity style={styles.circleButtonSmall} onPress={handleShare} activeOpacity={0.8}>
          <Text style={{ fontSize: 14 }}>↗️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover */}
        <View style={styles.coverWrapper}>
          {coverImageUri ? (
            <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Text style={{ fontSize: 40 }}>🖼️</Text>
            </View>
          )}
        </View>

        <Text style={styles.eventTitleLarge}>{eventTitle}</Text>
        <Text style={styles.dateRange}>{dateRange}</Text>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={getRegisterButtonStyle()}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={isRegisterDisabled()}
          >
            <Text style={getRegisterTextStyle()}>{getRegisterButtonLabel()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={handleContact} activeOpacity={0.85}>
            <Text style={styles.secondaryActionText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={() => setShowMorePopover(true)} activeOpacity={0.85}>
            <Text style={styles.secondaryActionText}>More</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Location */}
        <Text style={styles.sectionLabel}>Location</Text>
        <Text style={styles.locationName}>{locationName}</Text>
        <Text style={styles.address}>{address}</Text>
        <TouchableOpacity onPress={handleMapPress} activeOpacity={0.85}>
          <View style={styles.mapPlaceholder}>
            <View style={styles.mapPin}>
              <Text style={{ fontSize: 14 }}>📍</Text>
            </View>
            <Text style={styles.mapPlaceholderText}>Tap to view on map</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Hosts */}
        <Text style={styles.sectionLabel}>Hosts</Text>
        {hosts.map((host) => (
          <TouchableOpacity key={host.id} style={styles.hostRow} onPress={handleContact} activeOpacity={0.8}>
            <AvatarIcon size={40} />
            <View style={styles.hostTextWrap}>
              <Text style={styles.hostName}>{host.name}</Text>
              <Text style={styles.hostRole}>{host.role}</Text>
            </View>
            <Text style={styles.hostContactHint}>💬</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* Who's going */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionLabel}>Who's Going</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/eventAttendees', params: { id: eventId, title: eventTitle } })}>
            <Text style={{ fontSize: 13, color: '#7FB8FF' }}>Manage →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.goingCount}>{goingCount} Going</Text>

        <View style={styles.attendeeRow}>
          {attendees.slice(0, 6).map((attendee, index) => (
            <View key={attendee.id} style={[styles.attendeeAvatarWrap, { marginLeft: index === 0 ? 0 : -10 }]}>
              <AvatarIcon uri={attendee.uri} size={30} />
            </View>
          ))}
          {goingCount > 6 && (
            <View style={[styles.attendeeAvatarWrap, { marginLeft: -10 }]}>
              <View style={[styles.avatarFallback, { width: 30, height: 30, borderRadius: 15 }]}>
                <Text style={{ fontSize: 10, color: '#FFF' }}>+{goingCount - 6}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* About */}
        <Text style={styles.sectionLabel}>About Event</Text>
        {description ? (
          <Text style={styles.descriptionText}>{description}</Text>
        ) : (
          <Text style={styles.descriptionText}>No additional details provided for this event.</Text>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* More popover */}
      <Modal visible={showMorePopover} transparent animationType="fade">
        <Pressable style={styles.popoverOverlay} onPress={() => setShowMorePopover(false)}>
          <View style={styles.popoverCard}>
            <TouchableOpacity style={styles.popoverItem} onPress={handleReport} activeOpacity={0.7}>
              <Text style={styles.popoverItemIcon}>🚩</Text>
              <Text style={styles.popoverItemText}>Report Event</Text>
            </TouchableOpacity>
            <View style={styles.popoverDivider} />
            <TouchableOpacity style={styles.popoverItem} onPress={() => setShowMorePopover(false)} activeOpacity={0.7}>
              <Text style={styles.popoverItemIcon}>✕</Text>
              <Text style={styles.popoverItemTextCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111214' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  circleButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  circleButtonText: { fontSize: 18, color: '#FFFFFF' },
  circleButtonSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, marginHorizontal: 12, fontSize: 15, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  coverWrapper: { marginTop: 8, marginBottom: 16 },
  coverImage: { width: '100%', aspectRatio: 1.4, borderRadius: 20 },
  coverPlaceholder: { backgroundColor: '#2A2E33', alignItems: 'center', justifyContent: 'center' },
  eventTitleLarge: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', lineHeight: 30 },
  dateRange: { marginTop: 8, fontSize: 14, color: '#B8B8BC' },
  actionRow: { flexDirection: 'row', marginTop: 16, gap: 8 },
  primaryAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 12, flex: 1 },
  primaryActionRegistered: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 12, flex: 1 },
  primaryActionPending: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF9800', borderRadius: 14, paddingVertical: 12, flex: 1 },
  primaryActionDisabled: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 12, flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  primaryActionText: { fontSize: 14, fontWeight: '700', color: '#111111' },
  primaryActionTextRegistered: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  primaryActionTextPending: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  primaryActionTextDisabled: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  secondaryAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingVertical: 12, flex: 1 },
  secondaryActionText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 20 },
  sectionLabel: { fontSize: 13, color: '#8A8A8E', marginBottom: 8 },
  locationName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  address: { fontSize: 14, color: '#B8B8BC', lineHeight: 20, marginBottom: 16 },
  mapPlaceholder: { height: 160, borderRadius: 16, backgroundColor: '#2A2E33', alignItems: 'center', justifyContent: 'center' },
  mapPin: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4A9D6F', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  mapPlaceholderText: { fontSize: 12, color: '#8A8A8E' },
  hostRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarFallback: { backgroundColor: '#5B6470', alignItems: 'center', justifyContent: 'center' },
  hostTextWrap: { marginLeft: 12, flex: 1 },
  hostName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  hostRole: { fontSize: 13, color: '#8A8A8E', marginTop: 2 },
  hostContactHint: { fontSize: 18 },
  goingCount: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 10 },
  attendeeRow: { flexDirection: 'row', alignItems: 'center' },
  attendeeAvatarWrap: { borderWidth: 2, borderColor: '#111214', borderRadius: 18 },
  descriptionText: { fontSize: 14, lineHeight: 22, color: '#D6D6D8' },
  // Popover
  popoverOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popoverCard: { width: 260, backgroundColor: '#2A2E33', borderRadius: 16, overflow: 'hidden' },
  popoverItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, gap: 12 },
  popoverItemIcon: { fontSize: 16 },
  popoverItemText: { fontSize: 15, fontWeight: '500', color: '#FF3B30' },
  popoverItemTextCancel: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  popoverDivider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.12)' },
});
