import React from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { Colors } from "@/constants/Colors";

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface"
        >
          <Text className="text-text text-lg">✕</Text>
        </Pressable>
        <Text className="text-text font-semibold text-lg">Profile</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 rounded-full bg-surface items-center justify-center mb-4 border border-border">
          <Text className="text-3xl">👤</Text>
        </View>

        <Text className="text-text text-xl font-semibold mb-1">
          {session?.name ?? "Guest"}
        </Text>
        <Text className="text-text-secondary text-sm mb-8">
          {session?.email ?? "No email"}
        </Text>

        <Pressable
          onPress={handleSignOut}
          className="w-full max-w-xs py-3 rounded-lg items-center bg-secondary"
        >
          <Text className="text-white font-medium text-base">Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}
