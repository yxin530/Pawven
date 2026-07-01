import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPostsByOrg } from '@/data/posts';

export default function CommunityProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    followers?: string;
    posts?: string;
    bio?: string;
    location?: string;
  }>();

  const communityName = params.name || 'Community';
  const followersCount = params.followers || '0';
  const postsCount = params.posts || '0';
  const bio = params.bio || 'No description available.';
  const locationArea = params.location || '';

  const [isFollowing, setIsFollowing] = useState(false);
  const posts = getPostsByOrg(communityName);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Cover */}
        <View style={styles.cover} />

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: `https://api.dicebear.com/9.x/initials/png?seed=${communityName}&size=160` }}
            style={styles.avatar}
          />
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.communityName}>{communityName}</Text>
          {locationArea ? <Text style={styles.location}>📍 {locationArea}</Text> : null}
          <Text style={styles.bio}>{bio}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={isFollowing ? styles.followingBtn : styles.followBtn}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text style={isFollowing ? styles.followingBtnText : styles.followBtnText}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {posts.length > 0 ? (
            posts.map(post => (
              <View key={post.id} style={styles.postCard}>
                <Text style={styles.postText}>{post.text}</Text>
                <View style={styles.postFooter}>
                  <Text style={styles.postTime}>{post.time}</Text>
                  <Text style={styles.postStats}>🤍 {post.likes}  💬 {post.comments}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📝</Text>
              <Text style={styles.emptyStateText}>No posts yet</Text>
              <Text style={styles.emptyStateSubtext}>This community hasn't shared any updates.</Text>
            </View>
          )}
        </View>

        {/* Members preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          <View style={styles.membersRow}>
            {[0, 1, 2, 3, 4].map(i => (
              <Image
                key={i}
                source={{ uri: `https://api.dicebear.com/9.x/avataaars/png?seed=member${i}&size=48` }}
                style={[styles.memberAvatar, { marginLeft: i === 0 ? 0 : -8 }]}
              />
            ))}
            <Text style={styles.membersMore}>+{followersCount}</Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  headerOverlay: { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: '#fff' },
  cover: { height: 140, backgroundColor: '#e0e0e0' },
  avatarWrapper: { marginTop: -40, marginLeft: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff' },
  infoSection: { paddingHorizontal: 16, marginTop: 12 },
  communityName: { fontSize: 22, fontWeight: '700', color: '#111' },
  location: { fontSize: 13, color: '#666', marginTop: 6 },
  bio: { fontSize: 14, lineHeight: 21, color: '#333', marginTop: 12 },
  statsRow: { flexDirection: 'row', marginTop: 20, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e9e9e9' },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e9e9e9' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 12, color: '#6b6b6b', marginTop: 4 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 12 },
  followBtn: { flex: 1, backgroundColor: '#111', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  followBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  followingBtn: { flex: 1, backgroundColor: '#f2f2f2', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  followingBtnText: { color: '#111', fontSize: 14, fontWeight: '600' },
  shareBtn: { flex: 1, backgroundColor: '#fff', paddingVertical: 14, borderRadius: 24, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  shareBtnText: { color: '#111', fontSize: 14, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  emptyState: { paddingVertical: 40, alignItems: 'center', borderWidth: 1, borderColor: '#e9e9e9', borderRadius: 12 },
  emptyStateEmoji: { fontSize: 32, marginBottom: 8 },
  emptyStateText: { fontSize: 15, fontWeight: '600', color: '#666' },
  emptyStateSubtext: { fontSize: 13, color: '#999', marginTop: 4 },
  membersRow: { flexDirection: 'row', alignItems: 'center' },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff' },
  membersMore: { fontSize: 13, color: '#666', marginLeft: 12 },
  postCard: { borderWidth: 1, borderColor: '#e9e9e9', borderRadius: 12, padding: 14, marginBottom: 10 },
  postText: { fontSize: 14, lineHeight: 20, color: '#222' },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  postTime: { fontSize: 12, color: '#999' },
  postStats: { fontSize: 12, color: '#999' },
});
