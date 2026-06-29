import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="discoverMapScreen" />
      <Stack.Screen
        name="profile"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
