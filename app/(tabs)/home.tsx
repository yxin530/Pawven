import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { FilterPill } from "@/components/ui";
import { BottomSheet } from "@/components/ui/BottomSheet";
import mockEvents from "@/data/events";
import mockFeeders from "@/data/feeders";
import mockOrganizations from "@/data/organizations";
import type { Event, Feeder, Organization } from "@/types";

// Filter options
type FilterType = "all" | "feeders" | "communities" | "events" | "ngos" | "vets";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Feeders", value: "feeders" },
  { label: "Communities", value: "communities" },
  { label: "Events", value: "events" },
  { label: "NGOs", value: "ngos" },
  { label: "Vets", value: "vets" },
];

// Unified feed item
interface FeedItem {
  id: string;
  type: "event" | "feeder" | "ngo" | "vet";
  title: string;
  subtitle: string;
  imageUrl: string;
  time?: string;
  location?: string;
  description?: string;
  dateKey: string;
  dayLabel: string;
}

function formatDateLabel(dateStr: string): { dateKey: string; dayLabel: string } {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  if (d.toDateString() === today.toDateString()) {
    return { dateKey, dayLabel: `Today / ${dayNames[d.getDay()]}` };
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return { dateKey, dayLabel: `Tomorrow / ${dayNames[d.getDay()]}` };
  }
  return { dateKey, dayLabel: `${d.getDate()} ${monthNames[d.getMonth()]} / ${dayNames[d.getDay()]}` };
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function buildFeedItems(): FeedItem[] {
  const items: FeedItem[] = [];
  const todayInfo = formatDateLabel(new Date().toISOString());

  for (const event of mockEvents) {
    const { dateKey, dayLabel } = formatDateLabel(event.startTime);
    items.push({
      id: event.id,
      type: "event",
      title: event.title,
      subtitle: event.hostName,
      imageUrl: event.coverPhotoUrl,
      time: formatTime(event.startTime),
      location: event.location.address,
      description: event.description,
      dateKey,
      dayLabel,
    });
  }

  for (const feeder of mockFeeders) {
    items.push({
      id: feeder.id,
      type: "feeder",
      title: feeder.name,
      subtitle: `${feeder.kibbleLevel}% kibble · ${feeder.status}`,
      imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop",
      location: feeder.location.address ?? undefined,
      description: `Smart feeder with ${feeder.kibbleLevel}% kibble remaining. Tap "Feed Now" to dispense food for nearby strays.`,
      dateKey: todayInfo.dateKey,
      dayLabel: todayInfo.dayLabel,
    });
  }

  for (const org of mockOrganizations) {
    items.push({
      id: org.id,
      type: org.type === "ngo" ? "ngo" : "vet",
      title: org.name,
      subtitle: org.hours,
      imageUrl: org.logoUrl,
      location: org.location.address,
      description: org.description,
      dateKey: todayInfo.dateKey,
      dayLabel: todayInfo.dayLabel,
    });
  }

  return items;
}

function filterItems(items: FeedItem[], filter: FilterType): FeedItem[] {
  if (filter === "all") return items;
  if (filter === "feeders") return items.filter((i) => i.type === "feeder");
  if (filter === "events") return items.filter((i) => i.type === "event");
  if (filter === "ngos") return items.filter((i) => i.type === "ngo");
  if (filter === "vets") return items.filter((i) => i.type === "vet");
  if (filter === "communities") return items.filter((i) => i.type === "ngo" || i.type === "vet");
  return items;
}

interface FeedSection {
  dateKey: string;
  dayLabel: string;
  items: FeedItem[];
}

function groupByDate(items: FeedItem[]): FeedSection[] {
  const map = new Map<string, FeedSection>();
  for (const item of items) {
    if (!map.has(item.dateKey)) {
      map.set(item.dateKey, { dateKey: item.dateKey, dayLabel: item.dayLabel, items: [] });
    }
    map.get(item.dateKey)!.items.push(item);
  }
  return Array.from(map.values());
}

export default function HomeScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const allItems = useMemo(() => buildFeedItems(), []);
  const filtered = useMemo(() => filterItems(allItems, activeFilter), [allItems, activeFilter]);
  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  const handleItemPress = (item: FeedItem) => {
    setSelectedItem(item);
    setSheetVisible(true);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Map Section Header */}
        <Pressable
          className="px-5 pt-4 pb-2 flex-row items-center"
          onPress={() => router.push("/(tabs)/discover")}
        >
          <Text className="text-2xl font-bold text-text">Map</Text>
          <Text className="text-2xl text-text-secondary ml-1">{">"}</Text>
        </Pressable>

        {/* Map Feature Card */}
        <Pressable
          className="mx-5 mb-6 bg-surface border border-border rounded-2xl p-4 flex-row items-center"
          onPress={() => router.push("/(tabs)/discover")}
        >
          <View className="w-14 h-14 bg-primary/10 rounded-xl items-center justify-center mr-4">
            <Text className="text-2xl">🗺️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text text-sm leading-5">
              Find nearby feeders on the map and feed stray cats with a single tap. Your kibble, their happiness.
            </Text>
          </View>
        </Pressable>

        {/* For You Section with Filter Badges */}
        <View className="px-5 pb-2">
          <Text className="text-xl font-bold text-text">For You</Text>
          <Text className="text-sm text-text-secondary mt-0.5 mb-3">Nearby ◇</Text>

          {/* Filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          >
            {FILTERS.map((filter) => (
              <FilterPill
                key={filter.value}
                label={filter.label}
                active={activeFilter === filter.value}
                onChange={() => setActiveFilter(filter.value)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Feed Sections grouped by date */}
        {sections.length === 0 ? (
          <View className="px-5 py-10 items-center">
            <Text className="text-text-secondary text-sm">No results found</Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.dateKey} className="mt-4">
              {/* Date Header */}
              <View className="px-5 pb-3">
                <Text className="text-base font-semibold text-text">
                  {section.dayLabel}
                </Text>
              </View>

              {/* Items */}
              {section.items.map((item) => (
                <Pressable
                  key={item.id}
                  className="px-5 py-3 flex-row"
                  onPress={() => handleItemPress(item)}
                >
                  {/* Thumbnail */}
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-20 h-20 rounded-xl"
                    resizeMode="cover"
                  />

                  {/* Content */}
                  <View className="flex-1 ml-3 justify-center">
                    <Text className="text-xs text-text-secondary mb-0.5" numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                    <Text className="text-base font-semibold text-text" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View className="flex-row items-center mt-1.5 gap-3">
                      {item.time && (
                        <Text className="text-xs text-text-secondary">⏰ {item.time}</Text>
                      )}
                      {item.location && (
                        <Text className="text-xs text-text-secondary" numberOfLines={1}>
                          📍 {item.location}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ))
        )}

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Bottom Sheet */}
      <BottomSheet
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        item={selectedItem}
      />
    </View>
  );
}
