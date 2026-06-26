import { Tabs, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { Colors } from "@/constants/Colors";

function ProfileButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/profile")}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      style={{
        marginLeft: 16,
        width: 28,
        height: 28,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <Text style={{ fontSize: 14 }}>👤</Text>
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.disabled,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: true,
        headerStyle: { backgroundColor: Colors.background },
        headerTitleStyle: { color: Colors.text, fontWeight: "600", fontSize: 18 },
        headerShadowVisible: false,
        headerLeft: () => <ProfileButton />,
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
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="tnr"
        options={{
          title: "TNR",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🐾</Text>,
        }}
      />
    </Tabs>
  );
}
