import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="roleSelect" />
      <Stack.Screen name="createProfile" />
      <Stack.Screen name="pushNotification" />
      <Stack.Screen name="discoverMapScreen" />
      <Stack.Screen name="badgesScreen" />
      <Stack.Screen name="feederManagement" />
      <Stack.Screen name="createEvent" />
      <Stack.Screen name="eventDetail" />
      <Stack.Screen name="eventAttendees" />
      <Stack.Screen name="orgProfile" />
      <Stack.Screen name="communityProfile" />
      <Stack.Screen name="listNgos" />
      <Stack.Screen name="listVets" />
      <Stack.Screen name="listCommunities" />
      <Stack.Screen name="listFeeders" />
      <Stack.Screen name="listEvents" />
      <Stack.Screen name="smartFeeder" />
      <Stack.Screen name="notificationEvent_screen" />
      <Stack.Screen name="ngo" />
      <Stack.Screen
        name="profile"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
