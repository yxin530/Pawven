import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Card, Badge, FilterPill } from '@/components/ui';
import { useLocation } from '@/hooks/useLocation';
import mockEvents from '@/data/events';
import mockFeeders from '@/data/feeders';
import mockOrganizations from '@/data/organizations';
import type { DiscoverFilter, GeoLocation } from '@/types';

/** Default center coordinates (Kuala Lumpur) when location is denied */
const DEFAULT_CENTER: GeoLocation = {
  latitude: 3.14,
  longitude: 101.69,
  address: 'Kuala Lumpur, Malaysia',
};

type ViewMode = 'feed' | 'map';

interface DiscoverItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  type: 'feeder' | 'event' | 'ngo' | 'vet';
  category: string;
  location: GeoLocation;
}

/** Filter pill options */
const FILTER_OPTIONS: { label: string; value: DiscoverFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Feeders', value: 'feeders' },
  { label: 'Events', value: 'events' },
  { label: 'NGOs', value: 'ngos' },
  { label: 'Vets', value: 'vets' },
];

/**
 * Transforms raw mock data into a unified DiscoverItem array for display.
 */
function buildDiscoverItems(): DiscoverItem[] {
  const items: DiscoverItem[] = [];

  for (const event of mockEvents) {
    items.push({
      id: event.id,
      title: event.title,
      subtitle: `Hosted by ${event.hostName}`,
      imageUrl: event.coverPhotoUrl,
      type: 'event',
      category: event.category,
      location: event.location,
    });
  }

  for (const feeder of mockFeeders) {
    items.push({
      id: feeder.id,
      title: feeder.name,
      subtitle: feeder.location.address ?? 'Feeder location',
      imageUrl: `https://images.pawven.app/feeders/${feeder.id}.jpg`,
      type: 'feeder',
      category: feeder.status,
      location: feeder.location,
    });
  }

  for (const org of mockOrganizations) {
    items.push({
      id: org.id,
      title: org.name,
      subtitle: org.description.slice(0, 80) + '…',
      imageUrl: org.logoUrl,
      type: org.type,
      category: org.type,
      location: org.location,
    });
  }

  return items;
}

/**
 * Returns items filtered by the active DiscoverFilter.
 */
function filterItems(items: DiscoverItem[], filter: DiscoverFilter): DiscoverItem[] {
  if (filter === 'all') return items;
  if (filter === 'feeders') return items.filter((i) => i.type === 'feeder');
  if (filter === 'events') return items.filter((i) => i.type === 'event');
  if (filter === 'ngos') return items.filter((i) => i.type === 'ngo');
  if (filter === 'vets') return items.filter((i) => i.type === 'vet');
  return items;
}

/**
 * Returns a display-friendly type label for badge rendering.
 */
function getTypeLabel(type: DiscoverItem['type']): string {
  switch (type) {
    case 'feeder':
      return 'Feeder';
    case 'event':
      return 'Event';
    case 'ngo':
      return 'NGO';
    case 'vet':
      return 'Vet';
    default:
      return type;
  }
}

/**
 * MapPlaceholder — a simple stand-in for @rnmapbox/maps that renders
 * marker data as a list, since Mapbox requires native build configuration.
 */
function MapPlaceholder({
  items,
  center,
}: {
  items: DiscoverItem[];
  center: GeoLocation;
}) {
  return (
    <View className="flex-1 bg-surface rounded-xl mx-4 my-2 p-4 border border-border">
      <View className="items-center mb-4">
        <Text className="text-text font-semibold text-base">Map View</Text>
        <Text className="text-text-secondary text-xs mt-1">
          Centered on {center.address ?? `${center.latitude.toFixed(2)}, ${center.longitude.toFixed(2)}`}
        </Text>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-text-secondary text-sm">No results found</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              className="flex-row items-center py-3 border-b border-border"
              accessibilityRole="button"
              accessibilityLabel={`${item.title} marker`}
            >
              <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
                <Text className="text-sm">
                  {item.type === 'feeder'
                    ? '📡'
                    : item.type === 'event'
                    ? '📅'
                    : item.type === 'ngo'
                    ? '🏠'
                    : '🏥'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-text text-sm font-medium" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-text-secondary text-xs" numberOfLines={1}>
                  {item.location.address ?? `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

/**
 * Discover screen — provides a scrollable card feed with filter pills and
 * a toggle to switch between card feed and map view.
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 */
export default function DiscoverScreen() {
  const [activeFilter, setActiveFilter] = useState<DiscoverFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const { location } = useLocation();

  const allItems = useMemo(() => buildDiscoverItems(), []);
  const filteredItems = useMemo(
    () => filterItems(allItems, activeFilter),
    [allItems, activeFilter]
  );

  const mapCenter = location ?? DEFAULT_CENTER;

  const handleFilterPress = (filter: DiscoverFilter) => {
    setActiveFilter(filter);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'feed' ? 'map' : 'feed'));
  };

  const renderCard = ({ item }: { item: DiscoverItem }) => (
    <Card style="mb-4">
      <Image
        source={{ uri: item.imageUrl }}
        className="w-full h-44 rounded-lg mb-3"
        resizeMode="cover"
        accessibilityLabel={`Cover image for ${item.title}`}
      />
      <View className="gap-1.5">
        <View className="flex-row items-center gap-2">
          <Badge label={getTypeLabel(item.type)} category={item.category} size="sm" />
        </View>
        <Text className="text-lg font-semibold text-text" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-sm text-text-secondary" numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header with filter pills and view toggle */}
      <View className="pt-14 pb-2 px-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-text">Discover</Text>
          <Pressable
            onPress={toggleViewMode}
            className="bg-surface border border-border rounded-full px-3 py-1.5"
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${viewMode === 'feed' ? 'map' : 'feed'} view`}
          >
            <Text className="text-sm font-medium text-text">
              {viewMode === 'feed' ? '🗺️ Map' : '📋 Feed'}
            </Text>
          </Pressable>
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTER_OPTIONS.map((option) => (
            <FilterPill
              key={option.value}
              label={option.label}
              active={activeFilter === option.value}
              onChange={() => handleFilterPress(option.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content area */}
      {viewMode === 'feed' ? (
        filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-text-secondary text-base text-center">
              No results found
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <MapPlaceholder items={filteredItems} center={mapCenter} />
      )}
    </View>
  );
}
