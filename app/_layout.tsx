import "../global.css";
import { Stack } from "expo-router";

/**
 * Root layout. Skips Clerk auth in dev (no key).
 * Once you add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to .env, auth will activate.
 */
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="profile"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
