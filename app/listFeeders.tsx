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

interface Feeder {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  kibbleLevel: number;
}

const FALLBACK_DATA: Feeder[] = [
  { id: 'feeder_001', name: 'Cats Canteen', location: 'Ampang, Selangor', status: 'online', kibbleLevel: 85 },
  { id: 'feeder_003', name: 'Taman Desa Feeder', location: 'Taman Desa, Kuala Lumpur', status: 'online', kibbleLevel: 72 },
  { id: 'feeder_002', name: 'Home for Cats', location: 'Toa Payoh, Singapore', status: 'online', kibbleLevel: 62 },
];

export default function ListFeeders() {
  const router = useRouter();
  const [feeders, setFeeders] = useState<Feeder[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeders();
  }, []);

  const fetchFeeders = async () => {
    try {
      const res = await fetch(`${Config.API_BASE_URL}/feeders`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setFeeders(data);
      }
    } catch {
      // use fallback data
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Feeder }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/smartFeeder', params: { id: item.id, name: item.name, address: item.location, kibbleLevel: String(item.kibbleLevel), status: item.status } })}
    >
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🍽️</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.location}</Text>
        </View>
        <View style={styles.rightCol}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: '#E8F5E9' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: '#4CAF50' },
              ]}
            >
              🟢 online
            </Text>
          </View>
          <Text style={styles.kibbleText}>{item.kibbleLevel}% kibble</Text>
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
        <Text style={styles.title}>Smart Feeders</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#8E8E93" />
      ) : (
        <FlatList
          data={feeders.filter(f => f.status === 'online')}
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
    alignItems: 'center',
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
  rightCol: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  kibbleText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});
