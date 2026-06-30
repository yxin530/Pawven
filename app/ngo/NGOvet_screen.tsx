import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

// ---------------------------------------------
// Types
// ---------------------------------------------
interface FeederRecord {
  id: string;
  name: string;
  kibbles: string;
  lastFed: string;
}

interface Post {
  id: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  content: string;
  hasImage: boolean;
  likes: number;
  comments: number;
}

interface NGOVetProfileScreenProps {
  orgName?: string;
  location?: string;
  bio?: string;
  isVerified?: boolean;
  role?: 'NGO' | 'Vet';
  stats?: {
    colonies: number;
    feeders: number;
    feedings: number;
  };
  feederRecords?: FeederRecord[];
  posts?: Post[];
  onEditProfile?: () => void;
  onManageFeeders?: () => void;
  onApplyFeeder?: () => void;
  onViewAllRecords?: () => void;
}

// ---------------------------------------------
// Default mock data (matches the design reference)
// ---------------------------------------------
const defaultFeederRecords: FeederRecord[] = [
  { id: '1', name: 'Feeder #1', kibbles: '1,240 g', lastFed: '2h ago' },
  { id: '2', name: 'Feeder #2', kibbles: '890 g', lastFed: '5h ago' },
  { id: '3', name: 'Feeder #3', kibbles: '2,100 g', lastFed: '1d ago' },
];

const defaultPosts: Post[] = [
  {
    id: '1',
    authorName: 'Paws & Care NGO',
    date: '12 Jan 2026',
    content:
      'Feeder #1 at Taman Desa dispensed 320g this morning. 6 cats spotted! 🐱 Community support has been amazing this week.',
    hasImage: true,
    likes: 24,
    comments: 8,
  },
];

const NGOVetProfileScreen: React.FC<NGOVetProfileScreenProps> = ({
  orgName = 'Paws & Care NGO',
  location = 'Kuala Lumpur, Malaysia',
  bio = 'Dedicated to the welfare of community cats and strays. We manage 12 colonies across KL and provide veterinary support, TNR programs, and smart feeding solutions.',
  isVerified = true,
  role = 'NGO',
  stats = { colonies: 12, feeders: 8, feedings: 340 },
  feederRecords = defaultFeederRecords,
  posts = defaultPosts,
  onEditProfile,
  onManageFeeders,
  onApplyFeeder,
  onViewAllRecords,
}) => {
  const [postText, setPostText] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.pawIcon}>🐾</Text>
          <Text style={styles.appName}>Pawven</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Photo */}
        <View style={styles.coverPhoto}>
          <Text style={styles.coverPhotoLabel}>Cover Photo</Text>
          <TouchableOpacity style={styles.editProfileBtn} onPress={onEditProfile}>
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🧑</Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.orgName}>{orgName}</Text>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>
                  Verified {role}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{location}</Text>
          </View>

          <Text style={styles.bioText}>{bio}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.colonies}</Text>
            <Text style={styles.statLabel}>Colonies</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Text style={styles.statNumber}>{stats.feeders}</Text>
            <Text style={styles.statLabel}>Feeders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.feedings}</Text>
            <Text style={styles.statLabel}>Feedings</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onManageFeeders}>
            <Text style={styles.primaryBtnIcon}>⚙️</Text>
            <Text style={styles.primaryBtnText}>Manage Feeders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onApplyFeeder}>
            <Text style={styles.secondaryBtnIcon}>+</Text>
            <Text style={styles.secondaryBtnText}>Apply Feeder</Text>
          </TouchableOpacity>
        </View>

        {/* Feeder Tracking Record */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderIcon}>📈</Text>
            <Text style={styles.sectionHeaderText}>Feeder Tracking Record</Text>
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colFeeder]}>
                Feeder
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colKibbles]}>
                Kibbles (g)
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colLastFed]}>
                Last Fed
              </Text>
            </View>

            {feederRecords.map((record, index) => (
              <View
                key={record.id}
                style={[
                  styles.tableRow,
                  index === feederRecords.length - 1 && styles.tableRowLast,
                ]}
              >
                <Text style={[styles.tableCell, styles.colFeeder]}>
                  {record.name}
                </Text>
                <Text style={[styles.tableCell, styles.colKibbles, styles.tableCellCenter]}>
                  {record.kibbles}
                </Text>
                <Text style={[styles.tableCell, styles.colLastFed, styles.tableCellRight]}>
                  {record.lastFed}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={onViewAllRecords} style={styles.viewAllWrapper}>
            <Text style={styles.viewAllText}>View all records</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderIcon}>📝</Text>
            <Text style={styles.sectionHeaderText}>Posts</Text>
          </View>

          {/* Create Post */}
          <View style={styles.createPostRow}>
            <View style={styles.smallAvatarCircle}>
              <Text style={styles.smallAvatarEmoji}>🧑</Text>
            </View>
            <View style={styles.createPostInputWrapper}>
              <TextInput
                style={styles.createPostInput}
                placeholder="Share an update or feeding activity…"
                placeholderTextColor="#9a9a9a"
                value={postText}
                onChangeText={setPostText}
              />
            </View>
          </View>

          {/* Post List */}
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeaderRow}>
                <View style={styles.smallAvatarCircle}>
                  <Text style={styles.smallAvatarEmoji}>🧑</Text>
                </View>
                <View>
                  <Text style={styles.postAuthor}>{post.authorName}</Text>
                  <Text style={styles.postDate}>{post.date}</Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

              {post.hasImage && (
                <View style={styles.postImagePlaceholder}>
                  <Text style={styles.postImageLabel}>Post Image</Text>
                </View>
              )}

              <View style={styles.postFooterRow}>
                <TouchableOpacity style={styles.postFooterAction}>
                  <Text style={styles.postFooterIcon}>♡</Text>
                  <Text style={styles.postFooterText}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postFooterAction}>
                  <Text style={styles.postFooterIcon}>💬</Text>
                  <Text style={styles.postFooterText}>{post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postFooterAction}>
                  <Text style={styles.postFooterIcon}>↗</Text>
                  <Text style={styles.postFooterText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------------------------------
// Styles
// ---------------------------------------------
const COLORS = {
  background: '#ffffff',
  textPrimary: '#111111',
  textSecondary: '#6b6b6b',
  textMuted: '#9a9a9a',
  border: '#e9e9e9',
  coverBg: '#dcdcdc',
  black: '#000000',
  white: '#ffffff',
  badgeBg: '#f0f0f0',
  tableHeaderBg: '#fafafa',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pawIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  coverPhoto: {
    height: 140,
    backgroundColor: COLORS.coverBg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coverPhotoLabel: {
    color: '#8a8a8a',
    fontSize: 14,
  },
  editProfileBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  avatarWrapper: {
    marginTop: -45,
    marginLeft: 16,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.white,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  profileInfo: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orgName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  verifiedBadge: {
    backgroundColor: COLORS.badgeBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black,
    paddingVertical: 14,
    borderRadius: 24,
  },
  primaryBtnIcon: {
    color: COLORS.white,
    fontSize: 14,
    marginRight: 6,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnIcon: {
    color: COLORS.textPrimary,
    fontSize: 14,
    marginRight: 6,
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.tableHeaderBg,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tableHeaderCell: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  colFeeder: {
    flex: 1,
  },
  colKibbles: {
    flex: 1,
  },
  colLastFed: {
    flex: 1,
  },
  viewAllWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  viewAllText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    textDecorationLine: 'underline',
  },
  createPostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  smallAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smallAvatarEmoji: {
    fontSize: 18,
  },
  createPostInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.tableHeaderBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createPostInput: {
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },
  postCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  postDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  postImagePlaceholder: {
    height: 160,
    backgroundColor: COLORS.coverBg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  postImageLabel: {
    color: '#8a8a8a',
    fontSize: 13,
  },
  postFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  postFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postFooterIcon: {
    fontSize: 16,
    marginRight: 6,
    color: COLORS.textSecondary,
  },
  postFooterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

export default NGOVetProfileScreen;