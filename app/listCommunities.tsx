import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Config } from '@/constants/Config';

interface Community {
  id: string;
  name: string;
  followers: number;
  bio: string;
  icon: string;
  location: string;
}

const FALLBACK_DATA: Community[] = [
  {
    id: '1',
    name: 'SPCA Selangor',
    followers: 1845,
    bio: 'Official community for SPCA Selangor supporters and volunteers.',
    icon: '🐾',
    location: 'Selangor, MY',
  },
  {
    id: '2',
    name: 'Vets for Strays',
    followers: 4261,
    bio: 'Connecting vets who volunteer their time for stray animals.',
    icon: '🩺',
    location: 'Kuala Lumpur, MY',
  },
  {
    id: '3',
    name: 'KucingCare Community',
    followers: 2789,
    bio: 'A community of cat lovers dedicated to TNR and colony care.',
    icon: '🐱',
    location: 'Penang, MY',
  },
];

export default function ListCommunities() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const res = await fetch(`${Config.API_BASE_URL}/orgs?type=community`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setCommunities(data);
      }
    } catch {
      // use fallback data
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Community }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/communityProfile',
          params: {
            id: item.id,
            name: item.name,
            followers: String(item.followers),
            posts: '5',
            bio: item.bio,
            location: item.location,
          },
        })
      }
    >
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>
            {item.followers.toLocaleString()} followers
          </Text>
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Communities</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#8E8E93" />
      ) : (
        <FlatList
          data={communities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 18,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  bio: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 18,
  },
});
