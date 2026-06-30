import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1C1C1E",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarStyle: {
          position: "absolute",
          bottom: 24,
          left: 40,
          right: 40,
          borderRadius: 32,
          height: 52,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.4)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 10,
          paddingBottom: 4,
          paddingTop: 4,
          overflow: "hidden",
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { borderRadius: 32, overflow: "hidden" }]}>
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🧭</Text>,
        }}
      />
      <Tabs.Screen
        name="tnr"
        options={{
          title: "TNR",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="normalProfile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="applySmartFeeder"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
