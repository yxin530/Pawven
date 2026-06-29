import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

/**
 * Entry point — shows onboarding if not signed in, tabs if signed in.
 */
export default function Index() {
  const session = useAuthStore((s) => s.session);

  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/onboarding" />;
}
