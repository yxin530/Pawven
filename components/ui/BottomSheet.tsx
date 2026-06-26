import React from "react";
import { Modal, Pressable, Text, View, Image, ScrollView } from "react-native";

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  item: {
    id: string;
    type: "event" | "feeder" | "ngo" | "vet";
    title: string;
    subtitle: string;
    imageUrl: string;
    time?: string;
    location?: string;
    description?: string;
    ctaLabel?: string;
  } | null;
}

export function BottomSheet({ visible, onDismiss, item }: BottomSheetProps) {
  if (!item) return null;

  const ctaLabel = item.ctaLabel ?? getDefaultCTA(item.type);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onDismiss} />

      <View className="bg-background rounded-t-3xl px-5 pt-4 pb-8 min-h-[340px]">
        {/* Handle bar */}
        <View className="items-center mb-4">
          <View className="w-10 h-1 rounded-full bg-border" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Cover image */}
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-44 rounded-xl mb-4"
            resizeMode="cover"
          />

          {/* Type badge */}
          <View className="flex-row mb-2">
            <View className="bg-primary/15 rounded-full px-3 py-1">
              <Text className="text-primary text-xs font-semibold capitalize">
                {item.type}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-text text-xl font-bold mb-1">{item.title}</Text>

          {/* Subtitle / host */}
          <Text className="text-text-secondary text-sm mb-3">{item.subtitle}</Text>

          {/* Time & Location */}
          <View className="flex-row flex-wrap gap-4 mb-4">
            {item.time && (
              <View className="flex-row items-center">
                <Text className="text-text-secondary text-sm">⏰ {item.time}</Text>
              </View>
            )}
            {item.location && (
              <View className="flex-row items-center">
                <Text className="text-text-secondary text-sm">📍 {item.location}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {item.description && (
            <Text className="text-text text-sm leading-5 mb-4">
              {item.description}
            </Text>
          )}

          {/* CTA Button */}
          <Pressable className="bg-primary rounded-xl py-4 items-center mt-2">
            <Text className="text-white font-semibold text-base">{ctaLabel}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function getDefaultCTA(type: string): string {
  switch (type) {
    case "feeder":
      return "Feed Now";
    case "event":
      return "RSVP";
    case "ngo":
      return "Donate";
    case "vet":
      return "Donate";
    default:
      return "View";
  }
}

export default BottomSheet;
