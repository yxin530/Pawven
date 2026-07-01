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
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Config } from '@/constants/Config';
import { getPostsByOrg, Post } from '@/data/posts';

export default function NGOVetProfileScreen() {
  const router = useRouter();
  const role = (global as any).__pawven_role === 'vet' ? 'Vet' : 'NGO';

  const [name, setName] = useState<string>(
    (global as any).__pawven_name || (role === 'Vet' ? 'Dr. Lim Cat Clinic' : 'Paws & Care NGO')
  );
  const [bio, setBio] = useState<string>(
    (global as any).__pawven_bio || 'No bio yet. Tap Edit Profile to add one.'
  );
  const [avatar, setAvatar] = useState<string>(
    (global as any).__pawven_avatar || 'https://api.dicebear.com/9.x/avataaars/png?seed=ngo&size=160'
  );

  const [feederData, setFeederData] = useState([
    { name: 'No feeders yet', kibbles: '—', lastFed: '—' },
  ]);
  const [followers, setFollowers] = useState(0);
  const [feedersCount, setFeedersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // Posts state
  const [localPosts, setLocalPosts] = useState<{ id: string; text: string; time: string; likes: number; comments: number }[]>([]);
  const [orgPosts, setOrgPosts] = useState<Post[]>([]);

  // Edit Profile Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editBio, setEditBio] = useState(bio);
  const [editAvatar, setEditAvatar] = useState(avatar);

  // Post Creation Modal
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [newPostText, setNewPostText] = useState('');

  useEffect(() => {
    const existing = getPostsByOrg(name);
    setOrgPosts(existing);
  }, [name]);

  useEffect(() => {
    const fetchFeeders = async () => {
      try {
        const res = await fetch(`${Config.API_BASE_URL}/feeders`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setFeedersCount(data.length);
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
      } catch {
        // Keep empty state for new orgs
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

  const totalPosts = localPosts.length + orgPosts.length;

  // A) Contact button handler
  const handleContact = () => {
    Alert.alert('Contact Us', 'How would you like to reach us?', [
      { text: 'WhatsApp', onPress: () => Alert.alert('WhatsApp', '+60 12-345 6789') },
      { text: 'Email', onPress: () => Alert.alert('Email', 'contact@pawven.org') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // B) Follow toggle
  const handleFollowToggle = () => {
    if (isFollowing) {
      setFollowers((prev) => prev - 1);
      setIsFollowing(false);
    } else {
      setFollowers((prev) => prev + 1);
      setIsFollowing(true);
    }
  };

  // C) Edit Profile - open modal
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
      Alert.alert('Permission Required', 'We need gallery access to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  // D) Post creation
  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    const post = {
      id: `local_${Date.now()}`,
      text: newPostText.trim(),
      time: 'just now',
      likes: 0,
      comments: 0,
    };
    setLocalPosts((prev) => [post, ...prev]);
    setNewPostText('');
    setPostModalVisible(false);
  };

  const allPosts = [...localPosts, ...orgPosts];

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
            <Image source={{ uri: avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.orgName}>{name}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✅ Certified {role}</Text>
            </View>
          </View>
          <Text style={styles.locationText}>📍 Kuala Lumpur, Malaysia</Text>
          <Text style={styles.bioText}>{bio}</Text>
        </View>

        {/* Add Contact (own profile) */}
        <View style={styles.contactFollowRow}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => {
            Alert.alert('Add Contact Info', 'Set your contact details so others can reach you.', [
              { text: 'Set WhatsApp', onPress: () => Alert.alert('WhatsApp', 'Feature coming soon — your number will be visible to visitors.') },
              { text: 'Set Email', onPress: () => Alert.alert('Email', 'Feature coming soon — your email will be visible to visitors.') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}>
            <Text style={styles.contactBtnText}>📞 Add Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Text style={styles.statNumber}>{totalPosts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{feedersCount}</Text>
            <Text style={styles.statLabel}>Feeders</Text>
          </View>
        </View>

        {/* Action Buttons — only show if user owns feeders */}
        {feedersCount > 0 && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/feederManagement')}>
              <Text style={styles.primaryBtnText}>⚙️ Manage Feeders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(tabs)/applySmartFeeder')}>
              <Text style={styles.secondaryBtnText}>+ Apply Feeder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Apply for Smart Feeder — show when user has no feeders */}
        {feedersCount === 0 && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/applySmartFeeder')}>
              <Text style={styles.primaryBtnText}>🐾 Apply for Smart Feeder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feeder Tracking — only show if user owns feeders */}
        {feedersCount > 0 && (
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
        )}

        {/* Posts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Posts</Text>

          {/* D) Post creation bar */}
          <TouchableOpacity style={styles.createPostRow} onPress={() => setPostModalVisible(true)}>
            <View style={styles.smallAvatar}>
              <Image source={{ uri: avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            </View>
            <View style={styles.createPostInput}>
              <Text style={styles.createPostPlaceholder}>Share an update...</Text>
            </View>
          </TouchableOpacity>

          {/* E) Posts Display */}
          {allPosts.length === 0 ? (
            <View style={styles.emptyPosts}>
              <Text style={styles.emptyPostsText}>No posts yet. Share your first update!</Text>
            </View>
          ) : (
            allPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <Text style={styles.postText}>{post.text}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.postTime}>{post.time}</Text>
                  <Text style={styles.postStats}>❤️ {post.likes}  💬 {post.comments}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* C) Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TouchableOpacity style={styles.avatarEditBtn} onPress={handleChangeAvatar}>
              <Image source={{ uri: editAvatar }} style={styles.avatarEditImg} />
              <Text style={styles.avatarEditLabel}>📷 Change Avatar</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter name"
            />

            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Enter bio"
              multiline
              numberOfLines={3}
            />

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

      {/* D) Post Creation Modal */}
      <Modal visible={postModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Post</Text>

            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={newPostText}
              onChangeText={setNewPostText}
              placeholder="What's on your mind?"
              multiline
              numberOfLines={4}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setPostModalVisible(false); setNewPostText(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleCreatePost}>
                <Text style={styles.modalSaveText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  orgName: { fontSize: 22, fontWeight: '700', color: '#111', flexShrink: 1 },
  verifiedBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  verifiedBadgeText: { fontSize: 12, fontWeight: '600', color: '#6b6b6b' },
  locationText: { fontSize: 14, color: '#6b6b6b', marginTop: 6 },
  bioText: { fontSize: 14, lineHeight: 21, color: '#111', marginTop: 12 },
  contactFollowRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 12 },
  contactBtn: { flex: 1, backgroundColor: '#f0f0f0', paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  contactBtnText: { fontSize: 14, fontWeight: '600', color: '#111' },
  followBtn: { flex: 1, backgroundColor: '#111', paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  followBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  followingBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#111' },
  followingBtnText: { color: '#111' },
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
  postCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 12 },
  postText: { fontSize: 14, color: '#111', lineHeight: 20 },
  postMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  postTime: { fontSize: 12, color: '#999' },
  postStats: { fontSize: 12, color: '#6b6b6b' },
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
  avatarEditBtn: { alignItems: 'center', marginBottom: 8 },
  avatarEditImg: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  avatarEditLabel: { fontSize: 13, color: '#111', fontWeight: '600' },
});
