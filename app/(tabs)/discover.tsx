import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Config } from '@/constants/Config';
import { getRandomAvatar } from '@/constants/Avatars';
import CalendarDateIcon from '@/components/ui/CalendarDateIcon';
import { toggleFollow, isFollowingOrg } from '@/store/follow-store';

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterKey = 'All' | 'Feeder' | 'Communities Activity' | 'NGOs';

// ─── Mock data ────────────────────────────────────────────────────────────────
const FEEDERS = [
  { id: 'feeder_001', name: 'Cats Canteen', area: 'Ampang, Selangor', colony: 'Kibble 85%', distance: '~nearby', following: false },
  { id: 'feeder_003', name: 'Taman Desa Feeder', area: 'Taman Desa, Kuala Lumpur', colony: 'Kibble 72%', distance: '~nearby', following: false },
];

const COMMUNITY_POSTS = [
  { id: 'event_003', type: 'photo', time: 'Aug 15', title: 'Colony Count in Taman Desa', participants: 22, likes: 0 },
  { id: 'community_002', type: 'text', icon: '👥', name: 'SPCA Selangor', desc: 'Protecting and caring for abandoned cats through rescue, adoption, education and community feeding.', time: 'Active' },
  { id: 'community_003', type: 'text', icon: '🩺', name: 'Vets for Strays', desc: 'Veterinarians and volunteers sharing medical resources for stray animals.', time: 'Active' },
  { id: 'community_004', type: 'text', icon: '🐾', name: 'KucingCare', desc: 'Local rescue initiative helping stray cats with feeding, treatment and adoption.', time: 'Active' },
];

const NGOS = [
  { id: 'ngo_001', name: 'SPCA Selangor', volunteers: '183 volunteers', icon: '🏢', following: false, followers: '5231' },
  { id: 'ngo_004', name: 'KucingCare', volunteers: '91 volunteers', icon: '🐾', following: false, followers: '2789' },
];

const VETS = [
  { id: 'vet_001', name: 'Dr Priya Sharma', clinic: 'Petaling Jaya · 10 AM - 7 PM', rating: '4.9', specialty: 'Community cats & rescue', followers: '1623' },
  { id: 'vet_002', name: 'Dr Kevin Ong', clinic: 'Bukit Mertajam · 9 AM - 6 PM', rating: '4.8', specialty: 'Surgery & rescue medicine', followers: '2148' },
  { id: 'vet_003', name: 'Dr Lim Pet Clinic', clinic: 'Subang Jaya · 9 AM - 8 PM', rating: '4.7', specialty: 'Stray animal welfare', followers: '3578' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.8}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity onPress={onSeeAll}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
  </View>
);

const FeederRow = ({ item }: { item: any }) => {
  const [following, setFollowing] = useState(isFollowingOrg(item.id));
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.feederRow} onPress={() => router.push({ pathname: '/smartFeeder', params: { id: item.id, name: item.name } })} activeOpacity={0.85}>
      <View style={styles.feederAvatar}>
        <Image source={getRandomAvatar(parseInt(item.id?.replace(/\D/g, '') || '0', 10))} style={{ width: 48, height: 48, borderRadius: 24 }} />
      </View>
      <View style={styles.feederInfo}>
        <Text style={styles.feederName}>{item.name}</Text>
        <Text style={styles.feederArea}>{item.area}</Text>
        <View style={styles.feederMeta}>
          <Text style={styles.feederMetaText}>🐾 {item.colony}</Text>
          <Text style={[styles.feederMetaText, { marginLeft: 12 }]}>📍 {item.distance}</Text>
        </View>
      </View>
      <TouchableOpacity style={following ? styles.btnFollowing : styles.btnOutline} onPress={() => setFollowing(toggleFollow(item.id))}>
        <Text style={following ? styles.btnFollowingText : styles.btnOutlineText}>{following ? 'Following' : 'Follow'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const CommunityPhotoPost = ({ item, onPress }: { item: any; onPress?: () => void }) => (
  <TouchableOpacity style={styles.communityPhotoCard} onPress={onPress} activeOpacity={0.88}>
    <View style={styles.communityPhotoBanner}>
      <Image source={require('@/assets/images/eventCover1.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </View>
    <View style={styles.communityPhotoBody}>
      <Text style={styles.communityTime}>{item.time}</Text>
      <Text style={styles.communityTitle}>{item.title}</Text>
      <View style={styles.communityFooter}>
        <View style={styles.participantStack}>
          {[0, 1].map(i => (<View key={i} style={[styles.participantAvatar, { marginLeft: i === 0 ? 0 : -8 }]}><Image source={getRandomAvatar(i)} style={{ width: 24, height: 24, borderRadius: 12 }} /></View>))}
          <Text style={styles.participantText}>+{item.participants} participants</Text>
        </View>
        <Text style={styles.likeText}>🤍 {item.likes}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const CommunityTextPost = ({ item }: { item: any }) => {
  const router = useRouter();
  const avatarIndex = parseInt(item.id?.replace(/\D/g, '') || '0', 10);
  return (
    <TouchableOpacity
      style={styles.communityTextCard}
      onPress={() => router.push({ pathname: '/communityProfile', params: { id: item.id || '', name: item.name || '', bio: item.desc || '', location: '' } })}
      activeOpacity={0.85}
    >
      <View style={styles.communityTextIcon}>
        <Image source={getRandomAvatar(avatarIndex)} style={{ width: 40, height: 40, borderRadius: 20 }} />
      </View>
      <View style={styles.communityTextBody}>
        <Text style={styles.communityTextName}>{item.name}</Text>
        <Text style={styles.communityTextDesc}>{item.desc}</Text>
        <Text style={styles.communityTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const NgoCard = ({ item }: { item: any }) => {
  const [following, setFollowing] = useState(isFollowingOrg(item.id));
  const router = useRouter();
  const avatarIndex = parseInt(item.id?.replace(/\D/g, '') || '0', 10);
  return (
    <TouchableOpacity style={styles.ngoCard} onPress={() => router.push({ pathname: '/orgProfile', params: { id: item.id, name: item.name, type: 'ngo', volunteers: item.volunteers || '0', followers: item.followers || '0' } })} activeOpacity={0.85}>
      <View style={styles.ngoIcon}><Image source={getRandomAvatar(avatarIndex)} style={{ width: 48, height: 48, borderRadius: 24 }} /></View>
      <Text style={styles.ngoName}>{item.name}</Text>
      <Text style={styles.ngoVolunteers}>{item.volunteers}</Text>
      <TouchableOpacity style={following ? styles.btnSolid : styles.btnOutlineNgo} onPress={() => setFollowing(toggleFollow(item.id))}>
        <Text style={following ? styles.btnSolidText : styles.btnOutlineNgoText}>{following ? 'Following' : 'Follow'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const VetRow = ({ item }: { item: any }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.vetRow} onPress={() => router.push({ pathname: '/orgProfile', params: { id: item.id, name: item.name, type: 'vet', volunteers: item.rating ? `⭐ ${item.rating}` : '0', followers: item.followers || '0' } })} activeOpacity={0.85}>
      <View style={styles.vetAvatar}><Image source={require('@/assets/images/vetProfilepic.png')} style={{ width: 44, height: 44, borderRadius: 22 }} /></View>
      <View style={styles.vetInfo}>
        <Text style={styles.vetName}>{item.name}</Text>
        <Text style={styles.vetClinic}>{item.clinic}</Text>
        <Text style={styles.vetRating}>⭐ {item.rating} · {item.specialty}</Text>
      </View>
      <TouchableOpacity style={styles.btnOutline}><Text style={styles.btnOutlineText}>Book</Text></TouchableOpacity>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const FILTERS: FilterKey[] = ['All', 'Feeder', 'Communities Activity', 'NGOs'];

export default function DiscoverScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [feeders, setFeeders] = useState(FEEDERS);
  const [orgs, setOrgs] = useState(NGOS);
  const [vets, setVets] = useState(VETS);
  const [communityPosts, setCommunityPosts] = useState(COMMUNITY_POSTS);

  useEffect(() => {
    // Fetch feeders from backend (only online ones show)
    fetch(`${Config.API_BASE_URL}/feeders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFeeders(data.filter((f: any) => f.status === 'online').map((f: any) => ({
            id: f.id,
            name: f.name,
            area: f.address || 'Unknown',
            colony: `Kibble ${f.kibble_level}%`,
            distance: '~nearby',
            following: false,
          })));
        }
      })
      .catch(() => {});

    // Fetch organizations (filter to Malaysia — lat > 1.5)
    fetch(`${Config.API_BASE_URL}/orgs`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const malaysiaOrgs = data.filter((o: any) => !o.lat || o.lat > 1.5);
          const ngoList = malaysiaOrgs.filter((o: any) => o.type === 'ngo').map((o: any) => ({
            id: o.id, name: o.name, volunteers: '—', icon: '🏢', following: false, followers: '0',
          }));
          const vetList = malaysiaOrgs.filter((o: any) => o.type === 'vet').map((o: any) => ({
            id: o.id, name: o.name, clinic: `${o.address} · ${o.hours}`, rating: '4.8', specialty: o.description?.slice(0, 30) || '', followers: '0',
          }));
          if (ngoList.length) setOrgs(ngoList);
          if (vetList.length) setVets(vetList);
        }
      })
      .catch(() => {});

    // Fetch events and show as community activity
    fetch(`${Config.API_BASE_URL}/events`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const eventPosts = data.map((e: any) => ({
            id: e.id,
            type: 'photo' as const,
            time: e.start_time ? new Date(e.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Upcoming',
            title: e.title,
            participants: e.rsvp_count || 0,
            likes: 0,
          }));
          setCommunityPosts([...eventPosts, ...COMMUNITY_POSTS]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <View style={styles.safeArea}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <Text style={styles.pageTitle}>Discover</Text>
        <TouchableOpacity style={styles.mapBtn} onPress={() => router.push('/discoverMapScreen')} activeOpacity={0.85}>
          <Text style={styles.mapBtnIcon}>🗺️</Text>
          <Text style={styles.mapBtnText}>Map</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search feeders, NGOs, vets..." placeholderTextColor="#AEAEB2" />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => <FilterChip key={f} label={f} active={activeFilter === f} onPress={() => setActiveFilter(f)} />)}
        </ScrollView>

        {/* Featured */}
        <View style={styles.featuredCard}>
          <Text style={styles.featuredEyebrow}>FEATURED</Text>
          <Text style={styles.featuredTitle}>Singapore National TNR Week</Text>
          <Text style={styles.featuredMeta}>Jan 20–26, 2026 · Island-wide</Text>
          <TouchableOpacity style={styles.featuredBtn}><Text style={styles.featuredBtnText}>Learn more</Text></TouchableOpacity>
        </View>

        {/* Feeders */}
        {(activeFilter === 'All' || activeFilter === 'Feeder') && (<><SectionHeader title="Feeders" onSeeAll={() => router.push('/listFeeders')} /><View style={styles.card}>{feeders.map((item: any, idx: number) => (<View key={item.id}><FeederRow item={item} />{idx < feeders.length - 1 && <View style={styles.divider} />}</View>))}</View></>)}

        {/* Communities */}
        {(activeFilter === 'All' || activeFilter === 'Communities Activity') && (<><SectionHeader title="Communities Activity" onSeeAll={() => router.push('/listCommunities')} />{communityPosts.filter(p => p.type === 'photo').slice(0, 3).map((item: any) => <CommunityPhotoPost key={item.id} item={item} onPress={() => router.push({ pathname: '/eventDetail', params: { id: item.id, title: item.title, date: item.time, going: String(item.participants || 0) } })} />)}{communityPosts.filter(p => p.type === 'text').slice(0, 2).map((item: any) => <CommunityTextPost key={item.id} item={item} />)}</>)}

        {/* NGOs */}
        {(activeFilter === 'All' || activeFilter === 'NGOs') && (<><SectionHeader title="NGOs" onSeeAll={() => router.push('/listNgos')} /><View style={styles.ngoRow}>{orgs.map((item: any) => <NgoCard key={item.id} item={item} />)}</View></>)}

        {/* Vets */}
        {activeFilter === 'All' && (<><SectionHeader title="Vets" onSeeAll={() => router.push('/listVets')} /><View style={styles.card}>{vets.map((item: any, idx: number) => (<View key={item.id}><VetRow item={item} />{idx < vets.length - 1 && <View style={styles.divider} />}</View>))}</View></>)}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK = '#1C1C1E';
const GREY_BG = '#F2F2F7';
const GREY_TEXT = '#8E8E93';
const WHITE = '#FFFFFF';
const BORDER = '#E5E5EA';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: WHITE, paddingTop: 50 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: WHITE, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BORDER },
  pageTitle: { fontSize: 22, fontWeight: '700', color: DARK },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: BORDER, backgroundColor: WHITE },
  mapBtnIcon: { fontSize: 14 },
  mapBtnText: { fontSize: 14, fontWeight: '600', color: DARK },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: GREY_BG, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, gap: 8 },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: DARK, padding: 0 },
  filterRow: { gap: 8, paddingBottom: 16, paddingRight: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: GREY_BG },
  chipActive: { backgroundColor: DARK },
  chipText: { fontSize: 14, fontWeight: '500', color: DARK },
  chipTextActive: { color: WHITE },
  featuredCard: { backgroundColor: DARK, borderRadius: 16, padding: 20, marginBottom: 28 },
  featuredEyebrow: { fontSize: 11, fontWeight: '600', color: GREY_TEXT, letterSpacing: 1, marginBottom: 8 },
  featuredTitle: { fontSize: 20, fontWeight: '700', color: WHITE, marginBottom: 6 },
  featuredMeta: { fontSize: 13, color: GREY_TEXT, marginBottom: 18 },
  featuredBtn: { backgroundColor: WHITE, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  featuredBtnText: { fontSize: 15, fontWeight: '600', color: DARK },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: DARK },
  seeAll: { fontSize: 13, color: GREY_TEXT },
  card: { backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 24, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: BORDER, marginHorizontal: 16 },
  feederRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  feederAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  feederInfo: { flex: 1 },
  feederName: { fontSize: 15, fontWeight: '600', color: DARK, marginBottom: 2 },
  feederArea: { fontSize: 12, color: GREY_TEXT, marginBottom: 4 },
  feederMeta: { flexDirection: 'row' },
  feederMetaText: { fontSize: 11, color: GREY_TEXT },
  communityPhotoCard: { backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: 'hidden', marginBottom: 10 },
  communityPhotoBanner: { height: 110, backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center' },
  communityPhotoLabel: { fontSize: 13, color: GREY_TEXT },
  communityPhotoBody: { padding: 14 },
  communityTime: { fontSize: 12, color: GREY_TEXT, marginBottom: 4 },
  communityTitle: { fontSize: 15, fontWeight: '600', color: DARK, marginBottom: 10 },
  communityFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  participantStack: { flexDirection: 'row', alignItems: 'center' },
  participantAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: WHITE },
  participantText: { fontSize: 12, color: GREY_TEXT, marginLeft: 8 },
  likeText: { fontSize: 13, color: GREY_TEXT },
  communityTextCard: { flexDirection: 'row', backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, gap: 12, marginBottom: 24, alignItems: 'flex-start' },
  communityTextIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  communityTextBody: { flex: 1 },
  communityTextName: { fontSize: 14, fontWeight: '600', color: DARK, marginBottom: 4 },
  communityTextDesc: { fontSize: 13, color: GREY_TEXT, lineHeight: 19, marginBottom: 6 },
  ngoRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  ngoCard: { flex: 1, backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, alignItems: 'center', gap: 4 },
  ngoIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  ngoName: { fontSize: 13, fontWeight: '600', color: DARK, textAlign: 'center' },
  ngoVolunteers: { fontSize: 11, color: GREY_TEXT, marginBottom: 10 },
  vetRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  vetAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: GREY_BG, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  vetInfo: { flex: 1 },
  vetName: { fontSize: 15, fontWeight: '600', color: DARK, marginBottom: 2 },
  vetClinic: { fontSize: 12, color: GREY_TEXT, marginBottom: 3 },
  vetRating: { fontSize: 12, color: GREY_TEXT },
  btnOutline: { borderWidth: 1.5, borderColor: DARK, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, alignItems: 'center', flexShrink: 0 },
  btnOutlineText: { fontSize: 13, fontWeight: '600', color: DARK },
  btnFollowing: { backgroundColor: GREY_BG, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, alignItems: 'center', flexShrink: 0 },
  btnFollowingText: { fontSize: 13, fontWeight: '500', color: DARK },
  btnSolid: { backgroundColor: DARK, borderRadius: 10, paddingVertical: 8, width: '100%', alignItems: 'center' },
  btnSolidText: { fontSize: 12, fontWeight: '600', color: WHITE },
  btnOutlineNgo: { borderWidth: 1.5, borderColor: DARK, borderRadius: 10, paddingVertical: 8, width: '100%', alignItems: 'center' },
  btnOutlineNgoText: { fontSize: 12, fontWeight: '600', color: DARK },
});
