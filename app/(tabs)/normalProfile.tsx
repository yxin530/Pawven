import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Config } from '@/constants/Config';

// Get TNR completed count from backend (0 for new users)
export default function ProfileScreen() {
  const router = useRouter();
  const [badgesCount, setBadgesCount] = useState(0);
  const [catsNeutered, setCatsNeutered] = useState(0);
  const [catsFed, setCatsFed] = useState(0);
  const [eventsJoined, setEventsJoined] = useState(0);
  const [eventsHosted, setEventsHosted] = useState(0);

  // Get profile data from global (set during createProfile)
  const userName = (global as any).__pawven_name || '';
  const userBio = (global as any).__pawven_bio || '';
  const userAvatar = (global as any).__pawven_avatar || '';
  const isNewUser = !userName;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [badgesRes, reportsRes] = await Promise.all([
          fetch(`${Config.API_BASE_URL}/badges`),
          fetch(`${Config.API_BASE_URL}/reports`),
        ]);
        if (badgesRes.ok) {
          const badges = await badgesRes.json();
          if (Array.isArray(badges)) {
            setBadgesCount(badges.length);
          }
        }
        if (reportsRes.ok) {
          const reports = await reportsRes.json();
          if (Array.isArray(reports)) {
            const completedCount = reports.filter((r: any) => r.status === 'completed').length;
            setCatsNeutered(completedCount);
          }
        }
      } catch (e) {
        // Keep 0 values for new users
      }
    };
    fetchData();
  }, []);

  const handleCameraPress = () => {
    Alert.alert(
      'Upload Photo',
      'Choose how you want to upload your photo',
      [
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'We need access to your photo gallery to upload images.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled) {
              console.log('Selected:', result.assets[0].uri);
            }
          },
        },
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'We need access to your camera to take photos.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled) {
              console.log('Captured:', result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cover Photo */}
      <View style={styles.coverPhoto}>
        <Text style={styles.coverPhotoText}>Cover Photo</Text>
        <TouchableOpacity style={styles.editCoverButton} onPress={handleCameraPress}>
          <Text style={styles.editCoverText}>📷 Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarCircle}>
          <Image
            source={{ uri: userAvatar || 'https://api.dicebear.com/9.x/avataaars/png?seed=default&size=160' }}
            style={styles.avatarImage}
          />
        </View>
        <TouchableOpacity style={styles.avatarEditButton} onPress={handleCameraPress}>
          <Text style={{ fontSize: 10, color: '#fff' }}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Name / Edit Profile */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.name}>{userName || 'New User'}</Text>
          <Text style={styles.subtitle}>Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
        </View>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>Bio</Text>
          <TouchableOpacity>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bioText}>
          {userBio || 'No bio yet. Tap Edit to add one!'}
        </Text>
      </View>

      {/* Apply for Smart Feeder Button */}
      <TouchableOpacity
        style={styles.smartFeederButton}
        onPress={() => router.push('/(tabs)/applySmartFeeder')}
        activeOpacity={0.8}
      >
        <Text style={styles.smartFeederButtonText}>🐾 Apply for Smart Feeder →</Text>
      </TouchableOpacity>

      {/* Milestones */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.readOnlyRow}>
          <Text style={styles.readOnlyText}>🔒 Read-only</Text>
        </View>
      </View>

      <View style={styles.gridRow}>
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIconBox}><Text style={{ fontSize: 18 }}>🍲</Text></View>
          <Text style={styles.milestoneNumber}>{catsFed}</Text>
          <Text style={styles.milestoneLabel}>Cats Fed</Text>
        </View>
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIconBox}><Text style={{ fontSize: 18 }}>❤️</Text></View>
          <Text style={styles.milestoneNumber}>{catsNeutered}</Text>
          <Text style={styles.milestoneLabel}>Cats Neutered</Text>
        </View>
      </View>

      <View style={styles.gridRow}>
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIconBox}><Text style={{ fontSize: 18 }}>📅</Text></View>
          <Text style={styles.milestoneNumber}>{eventsJoined}</Text>
          <Text style={styles.milestoneLabel}>Events Joined</Text>
        </View>
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIconBox}><Text style={{ fontSize: 18 }}>🚩</Text></View>
          <Text style={styles.milestoneNumber}>{eventsHosted}</Text>
          <Text style={styles.milestoneLabel}>Events Hosted</Text>
        </View>
      </View>

      {/* Badges Earned */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Badges Earned</Text>
        <View style={styles.readOnlyRow}>
          <Text style={styles.readOnlyText}>🔒 Read-only</Text>
        </View>
      </View>

      {badgesCount > 0 ? (
        <View style={styles.badgesGrid}>
          {[
            { icon: '🍲', label: 'First Feed' },
            { icon: '⭐', label: '10 Feedings' },
            { icon: '🏆', label: '50 Feedings' },
            { icon: '💉', label: 'First TNR' },
            { icon: '🚩', label: 'Host Event' },
            { icon: '🛡️', label: '5 Cats Helped' },
          ].map((badge, idx) => (
            <View key={idx} style={styles.badgeItem}>
              <View style={styles.badgeIconBox}>
                <Text style={{ fontSize: 22 }}>{badge.icon}</Text>
              </View>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ paddingVertical: 30, alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 12, marginHorizontal: 16 }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🏅</Text>
          <Text style={{ fontSize: 14, color: '#999' }}>No badges earned yet</Text>
          <Text style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>Start feeding, reporting, or joining events!</Text>
        </View>
      )}

      <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push('/badgesScreen')}>
        <Text style={styles.viewAllText}>🐾  {badgesCount > 0 ? `View All ${badgesCount} Badges` : 'No badges yet — start exploring!'}</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 32 },
  coverPhoto: { height: 110, backgroundColor: '#d9d9d9', alignItems: 'center', justifyContent: 'center' },
  coverPhotoText: { color: '#fff', fontSize: 14 },
  editCoverButton: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4 },
  editCoverText: { color: '#fff', fontSize: 12 },
  avatarWrapper: { marginTop: -40, marginLeft: 16, width: 80, height: 80 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', borderWidth: 3, borderColor: '#fff', overflow: 'hidden', elevation: 2 },
  avatarImage: { width: '100%', height: '100%' },
  avatarEditButton: { position: 'absolute', right: 0, bottom: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, marginTop: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  editProfileButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  editProfileText: { fontSize: 13, color: '#111' },
  card: { marginTop: 16, marginHorizontal: 16, borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#111' },
  editLink: { fontSize: 13, color: '#555', textDecorationLine: 'underline' },
  bioText: { fontSize: 13, color: '#444', marginTop: 8, lineHeight: 19 },
  smartFeederButton: { marginTop: 16, marginHorizontal: 16, backgroundColor: '#2f9e44', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  smartFeederButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 22 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  readOnlyRow: { flexDirection: 'row', alignItems: 'center' },
  readOnlyText: { fontSize: 12, color: '#888' },
  gridRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 12 },
  milestoneCard: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14 },
  milestoneIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  milestoneNumber: { fontSize: 22, fontWeight: '700', color: '#111' },
  milestoneLabel: { fontSize: 13, color: '#666', marginTop: 2 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 12 },
  badgeItem: { width: '33.33%', alignItems: 'center', marginBottom: 18 },
  badgeIconBox: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeLabel: { fontSize: 12, color: '#333', textAlign: 'center' },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingVertical: 14, marginHorizontal: 16, marginTop: 4 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: '#111' },
});
