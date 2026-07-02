import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Config } from '@/constants/Config';
import AccountSection from '@/components/ui/AccountSection';

// Get TNR completed count from backend (0 for new users)
export default function ProfileScreen() {
  const router = useRouter();
  const [badgesCount, setBadgesCount] = useState(0);
  const [catsNeutered, setCatsNeutered] = useState(0);
  const [catsFed, setCatsFed] = useState(0);
  const [eventsJoined, setEventsJoined] = useState(0);
  const [eventsHosted, setEventsHosted] = useState(0);

  // Get profile data from global (set during createProfile)
  const [name, setName] = useState((global as any).__pawven_name || '');
  const [bio, setBio] = useState((global as any).__pawven_bio || '');
  const [avatar, setAvatar] = useState((global as any).__pawven_avatar || '');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  const DEFAULT_AVATARS: Record<string, any> = {
    'randomProfile1': require('@/assets/images/randomProfile1.jpg'),
    'randomProfile2': require('@/assets/images/randomProfile2.jpg'),
    'vetProfilepic': require('@/assets/images/vetProfilepic.png'),
  };

  const getAvatarSource = () => {
    if (avatar) return { uri: avatar };
    const localKey = (global as any).__pawven_avatar_local;
    if (localKey && DEFAULT_AVATARS[localKey]) return DEFAULT_AVATARS[localKey];
    return require('@/assets/images/randomProfile1.jpg');
  };

  // Edit Profile Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editBio, setEditBio] = useState(bio);
  const [editAvatar, setEditAvatar] = useState(avatar);

  const isNewUser = !name;

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

  const handleEditProfile = () => {
    setEditName(name);
    setEditBio(bio);
    setEditAvatar(avatar);
    setEditModalVisible(true);
  };

  const handleEditSave = () => {
    setName(editName);
    setBio(editBio);
    setAvatar(editAvatar);
    (global as any).__pawven_name = editName;
    (global as any).__pawven_bio = editBio;
    (global as any).__pawven_avatar = editAvatar;
    setEditModalVisible(false);
  };

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need gallery access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const handleChangeCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need gallery access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setCoverPhoto(result.assets[0].uri);
    }
  };

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cover Photo */}
      <View style={styles.coverPhoto}>
        {coverPhoto ? (
          <Image source={{ uri: coverPhoto }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text style={styles.coverPhotoText}>Cover Photo</Text>
        )}
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarCircle}>
          <Image
            source={getAvatarSource()}
            style={styles.avatarImage}
          />
        </View>
      </View>

      {/* Name / Edit Profile */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.name}>{name || 'New User'}</Text>
          <Text style={styles.subtitle}>Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
        </View>
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Text style={styles.editProfileText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>Bio</Text>
        </View>
        <Text style={styles.bioText}>
          {bio || 'No bio yet. Tap Edit Profile to add one!'}
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
          <View style={styles.milestoneIconBox}><Image source={require('@/assets/icons/catsFed.jpg')} style={{ width: 28, height: 28, borderRadius: 6 }} /></View>
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
          <View style={styles.milestoneIconBox}><Image source={require('@/assets/icons/eventHosted.png')} style={{ width: 28, height: 28 }} resizeMode="contain" /></View>
          <Text style={styles.milestoneNumber}>{eventsJoined}</Text>
          <Text style={styles.milestoneLabel}>Events Joined</Text>
        </View>
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIconBox}><Image source={require('@/assets/icons/eventHosted.png')} style={{ width: 28, height: 28 }} resizeMode="contain" /></View>
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

      <AccountSection />

      <View style={{ height: 100 }} />
    </ScrollView>

    <Modal visible={editModalVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Profile</Text>

          <TouchableOpacity style={styles.avatarEditBtnModal} onPress={handleChangeAvatar}>
            <Image source={editAvatar ? { uri: editAvatar } : getAvatarSource()} style={styles.avatarEditImg} />
            <Text style={styles.avatarEditLabelModal}>📷 Change Avatar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.coverEditBtnModal} onPress={handleChangeCover}>
            <Text style={styles.coverEditLabelModal}>🖼️ Change Cover Photo</Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Name</Text>
          <TextInput style={styles.textInput} value={editName} onChangeText={setEditName} placeholder="Enter name" />

          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput style={[styles.textInput, styles.textAreaInput]} value={editBio} onChangeText={setEditBio} placeholder="Enter bio" multiline numberOfLines={3} />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleEditSave}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 32 },
  coverPhoto: { height: 110, backgroundColor: '#d9d9d9', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  coverPhotoText: { color: '#fff', fontSize: 14 },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  backBtnText: { fontSize: 18, color: '#1C1C1E' },
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
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#6b6b6b', marginBottom: 6, marginTop: 12 },
  textInput: { borderWidth: 1, borderColor: '#e9e9e9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111', backgroundColor: '#f9f9f9' },
  textAreaInput: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', marginTop: 24, gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 24, borderWidth: 1, borderColor: '#e9e9e9', alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: '#6b6b6b' },
  modalSaveBtn: { flex: 1, paddingVertical: 14, borderRadius: 24, backgroundColor: '#111', alignItems: 'center' },
  modalSaveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  avatarEditBtnModal: { alignItems: 'center', marginBottom: 8 },
  avatarEditImg: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  avatarEditLabelModal: { fontSize: 13, color: '#111', fontWeight: '600' },
  coverEditBtnModal: { alignItems: 'center', marginTop: 8, paddingVertical: 10, backgroundColor: '#f7f7f7', borderRadius: 12 },
  coverEditLabelModal: { fontSize: 13, color: '#111', fontWeight: '600' },
});
