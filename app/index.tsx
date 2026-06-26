import { Redirect } from "expo-router";

/**
 * Entry point — goes straight to tabs (dev mode, no auth).
 * When Clerk is configured, this will check auth state first.
 */
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
