import { Stack } from "expo-router";

/**
 * Auth group layout — headerless stack for sign-in/sign-up screens.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
