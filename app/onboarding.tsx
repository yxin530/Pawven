import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScrollView className="flex-1" bounces={false}>
        {/* Hero Section - Dark background */}
        <View className="bg-text pt-12 pb-8 rounded-b-3xl">
          {/* Decorative circles */}
          <View className="absolute top-6 left-6 w-20 h-20 rounded-full bg-white/10" />
          <View className="absolute top-4 right-8 w-24 h-24 rounded-full bg-white/10" />
          <View className="absolute top-16 right-4 w-16 h-16 rounded-full bg-white/8" />

          {/* Logo & tagline */}
          <View className="items-center mt-12 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-white rounded-lg items-center justify-center mr-2">
                <Text className="text-xl">🐾</Text>
              </View>
              <Text className="text-white text-2xl font-bold">Pawven</Text>
            </View>
            <Text className="text-white/80 text-center text-sm px-8">
              Track, connect & protect animals in your community
            </Text>
          </View>

          {/* Stat pills */}
          <View className="flex-row justify-center gap-3 mt-4 px-6">
            <View className="bg-white/15 rounded-full px-4 py-2.5 flex-row items-center">
              <View className="w-7 h-7 bg-white/20 rounded-full items-center justify-center mr-2">
                <Text className="text-xs">🐾</Text>
              </View>
              <View>
                <Text className="text-white text-sm font-semibold">TNR Report</Text>
                <Text className="text-white/60 text-xs">Colony #42 · 3 new</Text>
              </View>
            </View>

            <View className="bg-white/15 rounded-full px-4 py-2.5 flex-row items-center">
              <View className="w-7 h-7 bg-white/20 rounded-full items-center justify-center mr-2">
                <Text className="text-xs">📍</Text>
              </View>
              <View>
                <Text className="text-white text-sm font-semibold">Nearby</Text>
                <Text className="text-white/60 text-xs">12 feeders · 0.3 km</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Welcome Section - Light background */}
        <View className="px-6 pt-8 pb-4">
          <Text className="text-2xl font-bold text-text text-center">
            Welcome to Pawven
          </Text>
          <Text className="text-text-secondary text-center mt-2 text-sm leading-5">
            Join thousands of volunteers, feeders & NGOs{"\n"}working together for stray animals.
          </Text>
        </View>

        {/* Feature List */}
        <View className="px-6 mt-4">
          {/* Feature 1: Discover on Map */}
          <View className="flex-row items-start mb-6">
            <View className="w-11 h-11 bg-surface rounded-xl items-center justify-center mr-4">
              <Text className="text-lg">🗺️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text font-semibold text-base">Discover on Map</Text>
              <Text className="text-text-secondary text-sm mt-0.5 leading-5">
                Find feeders, NGOs and active communities near you in real-time.
              </Text>
            </View>
          </View>

          {/* Feature 2: TNR Reporting */}
          <View className="flex-row items-start mb-6">
            <View className="w-11 h-11 bg-surface rounded-xl items-center justify-center mr-4">
              <Text className="text-lg">📋</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text font-semibold text-base">TNR Reporting</Text>
              <Text className="text-text-secondary text-sm mt-0.5 leading-5">
                Log trap-neuter-return activities and track colony progress.
              </Text>
            </View>
          </View>

          {/* Feature 3: Community Hub */}
          <View className="flex-row items-start mb-6">
            <View className="w-11 h-11 bg-surface rounded-xl items-center justify-center mr-4">
              <Text className="text-lg">🤝</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text font-semibold text-base">Community Hub</Text>
              <Text className="text-text-secondary text-sm mt-0.5 leading-5">
                Connect with NGOs, vets and local groups in your area.
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="px-6 mt-4 pb-4">
          {/* Get Started button */}
          <Button
            onPress={() => router.push("/(auth)/sign-up")}
            className="mb-3"
          >
            Get started
          </Button>

          {/* Sign In button */}
          <Button
            variant="outline"
            onPress={() => router.push("/(auth)/sign-in")}
          >
            Sign in
          </Button>
        </View>

        {/* Terms */}
        <View className="px-6 pt-3 pb-6">
          <Text className="text-text-secondary text-xs text-center">
            By continuing you agree to our{" "}
            <Text className="text-text font-medium underline">Terms</Text>
            {" "}and{" "}
            <Text className="text-text font-medium underline">Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
