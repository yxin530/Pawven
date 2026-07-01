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

interface Vet {
  id: string;
  name: string;
  clinic: string;
  rating: number;
  specialty: string;
}

const FALLBACK_DATA: Vet[] = [
  { id: '1', name: 'Dr Priya Sharma', clinic: 'PJ', rating: 4.9, specialty: 'Surgery' },
  { id: '2', name: 'Dr Kevin Ong', clinic: 'Bukit Mertajam', rating: 4.8, specialty: 'Dermatology' },
  { id: '3', name: 'Dr Lim Pet Clinic', clinic: 'Subang', rating: 4.7, specialty: 'General' },
];

export default function ListVets() {
  const router = useRouter();
  const [vets, setVets] = useState<Vet[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      const res = await fetch(`${Config.API_BASE_URL}/orgs?type=vet`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setVets(data);
      }
    } catch {
      // use fallback data
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Vet }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/orgProfile',
          params: { id: item.id, name: item.name, type: 'vet' },
        })
      }
    >
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🩺</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.clinic} · {item.specialty}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
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
        <Text style={styles.title}>Vets</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#8E8E93" />
      ) : (
        <FlatList
          data={vets}
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
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5A623',
  },
});
