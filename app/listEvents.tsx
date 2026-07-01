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

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  attending: number;
  category: string;
}

const FALLBACK_DATA: EventItem[] = [
  {
    id: '1',
    title: 'Workshop by SPCA',
    date: 'Aug 2',
    location: 'SPCA Selangor HQ',
    attending: 43,
    category: 'Workshop',
  },
  {
    id: '2',
    title: 'Vet Volunteer Day',
    date: 'Aug 9',
    location: 'PJ Animal Clinic',
    attending: 37,
    category: 'Volunteer',
  },
  {
    id: '3',
    title: 'Colony Count',
    date: 'Aug 15',
    location: 'Taman Desa, KL',
    attending: 22,
    category: 'TNR',
  },
  {
    id: '4',
    title: 'Cat Owners Hangout',
    date: 'Aug 23',
    location: 'Bangsar South',
    attending: 58,
    category: 'Social',
  },
];

export default function ListEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${Config.API_BASE_URL}/events`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setEvents(data);
      }
    } catch {
      // use fallback data
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Workshop': return '#E3F2FD';
      case 'Volunteer': return '#E8F5E9';
      case 'TNR': return '#FFF3E0';
      case 'Social': return '#F3E5F5';
      default: return '#F2F2F7';
    }
  };

  const renderItem = ({ item }: { item: EventItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/eventDetail',
          params: { id: item.id, title: item.title, location: item.location },
        })
      }
    >
      <View style={styles.cardTop}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.dateText}>📅 {item.date}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>📍 {item.location}</Text>
      <Text style={styles.attendingText}>👥 {item.attending} attending</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Events</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#8E8E93" />
      ) : (
        <FlatList
          data={events}
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  attendingText: {
    fontSize: 13,
    color: '#8E8E93',
  },
});
