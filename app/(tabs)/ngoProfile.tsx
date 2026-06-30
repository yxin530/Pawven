import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Config } from '@/constants/Config';

export default function NGOVetProfileScreen() {
  const router = useRouter();
  const role = (global as any).__pawven_role === 'vet' ? 'Vet' : 'NGO';
  const orgName = role === 'Vet' ? 'Dr. Lim Cat Clinic' : 'Paws & Care NGO';

  const [feederData, setFeederData] = useState([
    { name: 'Feeder #1', kibbles: '1,240 g', lastFed: '2h ago' },
    { name: 'Feeder #2', kibbles: '890 g', lastFed: '5h ago' },
    { name: 'Feeder #3', kibbles: '2,100 g', lastFed: '1d ago' },
  ]);

  useEffect(() => {
    const fetchFeeders = async () => {
      try {
        const res = await fetch(`${Config.API_BASE_URL}/feeders`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((f: any, idx: number) => {
            const lastDispensed = f.last_dispensed ? getTimeAgoSimple(f.last_dispensed) : 'N/A';
            return {
              name: f.name || `Feeder #${idx + 1}`,
              kibbles: `${f.kibble_level?.toLocaleString() || 0} g`,
              lastFed: lastDispensed,
            };
          });
          setFeederData(mapped);
        }
      } catch (e) {
        console.log('Using mock feeder data:', e);
      }
    };
    fetchFeeders();
  }, []);

  const getTimeAgoSimple = (dateStr: string): string => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleEditProfile = async () => {
    Alert.alert('Upload Photo', 'Choose how you want to upload', [
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission Required', 'We need gallery access.'); return; }
          await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        },
      },
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission Required', 'We need camera access.'); return; }
          await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={styles.coverPhoto}>
          <Text style={styles.coverPhotoLabel}>Cover Photo</Text>
          <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditProfile}>
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Image source={{ uri: 'https://api.dicebear.com/9.x/avataaars/png?seed=ngo&size=160' }} style={{ width: 80, height: 80, borderRadius: 40 }} />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.orgName}>{orgName}</Text>
            <View style={styles.verifiedBadge}><Text style={styles.verifiedBadgeText}>Certified {role}</Text></View>
          </View>
          <Text style={styles.locationText}>📍 Kuala Lumpur, Malaysia</Text>
          <Text style={styles.bioText}>Dedicated to the welfare of community cats and strays. We manage 12 colonies across KL and provide veterinary support, TNR programs, and smart feeding solutions.</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statNumber}>12</Text><Text style={styles.statLabel}>Colonies</Text></View>
          <View style={[styles.statItem, styles.statItemBorder]}><Text style={styles.statNumber}>8</Text><Text style={styles.statLabel}>Feeders</Text></View>
          <View style={styles.statItem}><Text style={styles.statNumber}>340</Text><Text style={styles.statLabel}>Feedings</Text></View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/feederManagement')}>
            <Text style={styles.primaryBtnText}>⚙️ Manage Feeders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/applySmartFeeder')}>
            <Text style={styles.secondaryBtnText}>+ Apply Feeder</Text>
          </TouchableOpacity>
        </View>

        {/* Feeder Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Feeder Tracking Record</Text>
          <View style={styles.tableCard}>
            {feederData.map((r, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCell}>{r.name}</Text>
                <Text style={styles.tableCellCenter}>{r.kibbles}</Text>
                <Text style={styles.tableCellRight}>{r.lastFed}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllWrapper} onPress={() => router.push('/feederManagement')}>
            <Text style={styles.viewAllText}>View all records</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Posts</Text>
          <View style={styles.createPostRow}>
            <View style={styles.smallAvatar}>
              <Image source={{ uri: 'https://api.dicebear.com/9.x/avataaars/png?seed=ngo&size=80' }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            </View>
            <View style={styles.createPostInput}>
              <Text style={styles.createPostPlaceholder}>Share an update or feeding activity…</Text>
            </View>
          </View>
          {/* No existing posts — empty state */}
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyPostsText}>No posts yet. Share your first update!</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  coverPhoto: { height: 140, backgroundColor: '#dcdcdc', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  coverPhotoLabel: { color: '#8a8a8a', fontSize: 14 },
  editProfileBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  editProfileBtnText: { fontSize: 13, fontWeight: '600', color: '#111' },
  avatarWrapper: { marginTop: -40, marginLeft: 16 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', borderWidth: 3, borderColor: '#fff', overflow: 'hidden', elevation: 2 },
  profileInfo: { paddingHorizontal: 16, marginTop: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orgName: { fontSize: 22, fontWeight: '700', color: '#111' },
  verifiedBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  verifiedBadgeText: { fontSize: 12, fontWeight: '600', color: '#6b6b6b' },
  locationText: { fontSize: 14, color: '#6b6b6b', marginTop: 6 },
  bioText: { fontSize: 14, lineHeight: 21, color: '#111', marginTop: 12 },
  statsRow: { flexDirection: 'row', marginTop: 20, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e9e9e9' },
  statItem: { flex: 1, alignItems: 'center' },
  statItemBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e9e9e9' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 12, color: '#6b6b6b', marginTop: 4 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 12 },
  primaryBtn: { flex: 1, backgroundColor: '#000', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  secondaryBtn: { flex: 1, backgroundColor: '#fff', paddingVertical: 14, borderRadius: 24, borderWidth: 1, borderColor: '#e9e9e9', alignItems: 'center' },
  secondaryBtnText: { color: '#111', fontSize: 14, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  tableCard: { borderWidth: 1, borderColor: '#e9e9e9', borderRadius: 12, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#e9e9e9' },
  tableCell: { flex: 1, fontSize: 14, color: '#111' },
  tableCellCenter: { flex: 1, fontSize: 14, color: '#111', textAlign: 'center' },
  tableCellRight: { flex: 1, fontSize: 14, color: '#111', textAlign: 'right' },
  viewAllWrapper: { alignItems: 'center', marginTop: 16 },
  viewAllText: { fontSize: 13, color: '#111', textDecorationLine: 'underline' },
  createPostRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  smallAvatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', marginRight: 10 },
  createPostInput: { flex: 1, backgroundColor: '#f7f7f7', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12 },
  createPostPlaceholder: { fontSize: 14, color: '#9a9a9a' },
  emptyPosts: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#f9f9f9', borderRadius: 12 },
  emptyPostsText: { fontSize: 13, color: '#999' },
});
