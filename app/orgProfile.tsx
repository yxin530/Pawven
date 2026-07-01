import React, { useState, useEffect } from 'react';
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
import { Config } from '@/constants/Config';
import { getPostsByOrg } from '@/data/posts';

export default function OrgProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string; type?: string; volunteers?: string }>();

  const orgId = params.id || '';
  const [orgName, setOrgName] = useState(params.name || 'Organization');
  const [orgType, setOrgType] = useState(params.type || 'ngo');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [followers, setFollowers] = useState(0);
  const [volunteersLabel, setVolunteersLabel] = useState(params.volunteers || '0');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (!orgId) return;
    const fetchOrg = async () => {
      try {
        const res = await fetch(`${Config.API_BASE_URL}/orgs/${orgId}`);
        if (res.ok) {
          const org = await res.json();
          setOrgName(org.name || orgName);
          setOrgType(org.type || 'ngo');
          setDescription(org.description || '');
          setAddress(org.address || '');
          setLogoUrl(org.logo_url || '');
        }
      } catch {}
    };
    fetchOrg();
  }, [orgId]);

  const roleLabel = orgType === 'vet' ? 'Certified Vet' : 'Certified NGO';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Cover */}
        <View style={styles.cover} />

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: logoUrl || `https://api.dicebear.com/9.x/initials/png?seed=${orgName}&size=160` }}
            style={styles.avatar}
          />
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.orgName}>{orgName}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{roleLabel}</Text></View>
          </View>
          {address ? <Text style={styles.location}>📍 {address}</Text> : null}
          <Text style={styles.bio}>{description || 'No description provided.'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statNumber}>{volunteersLabel}</Text>
            <Text style={styles.statLabel}>{orgType === 'vet' ? 'Rating' : 'Volunteers'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>

        {/* Follow button */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followBtnText}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {getPostsByOrg(orgName).length > 0 ? (
            getPostsByOrg(orgName).map(post => (
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
              <Text style={styles.emptyStateText}>No posts yet</Text>
            </View>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  header: { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: '#fff' },
  cover: { height: 140, backgroundColor: '#e0e0e0' },
  avatarWrapper: { marginTop: -40, marginLeft: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff' },
  infoSection: { paddingHorizontal: 16, marginTop: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orgName: { fontSize: 22, fontWeight: '700', color: '#111', flex: 1 },
  badge: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginLeft: 8 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#6b6b6b' },
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
  contactBtn: { flex: 1, backgroundColor: '#fff', paddingVertical: 14, borderRadius: 24, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  contactBtnText: { color: '#111', fontSize: 14, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  emptyState: { paddingVertical: 40, alignItems: 'center', borderWidth: 1, borderColor: '#e9e9e9', borderRadius: 12 },
  emptyStateText: { fontSize: 14, color: '#999' },
  postCard: { borderWidth: 1, borderColor: '#e9e9e9', borderRadius: 12, padding: 14, marginBottom: 10 },
  postText: { fontSize: 14, lineHeight: 20, color: '#222' },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  postTime: { fontSize: 12, color: '#999' },
  postStats: { fontSize: 12, color: '#999' },
});
