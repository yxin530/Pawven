import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function PushNotificationScreen() {
  const router = useRouter();

  const handleEnable = () => {
    // In production: request push notification permissions here
    router.replace('/(tabs)/home');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Card stack visual */}
        <View style={styles.cardStack}>
          <View style={[styles.cardBehind, { transform: [{ translateX: 10 }, { translateY: 6 }] }]} />
          <View style={[styles.cardBehind, { transform: [{ translateX: 5 }, { translateY: 3 }] }]} />
          <View style={styles.cardFront}>
            <View style={styles.pawBadge}><Text style={{ fontSize: 12, color: '#fff' }}>🐾</Text></View>
            <Text style={styles.cardAppName}>PAWVEN</Text>
            <View style={styles.cardLineLong} />
            <View style={styles.cardLineShort} />
          </View>
        </View>

        <Text style={styles.title}>Turn on push notifications.</Text>
        <Text style={styles.subtitle}>
          Get alerts when a smart feeder near you needs a hand, cat lovers plan
          new activities, or a TNR case you're following gets an update from
          the NGO or vet.
        </Text>

        <TouchableOpacity style={styles.enableButton} onPress={handleEnable} activeOpacity={0.85}>
          <Text style={styles.enableButtonText}>Turn on notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipButtonText}>Not now</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>Manage your notification categories in Settings at any time.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 120 },
  cardStack: { width: 180, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 48 },
  cardBehind: { position: 'absolute', width: 160, height: 68, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)' },
  cardFront: { width: 160, height: 68, borderRadius: 14, backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  pawBadge: { position: 'absolute', top: 12, left: 14, width: 20, height: 20, borderRadius: 6, backgroundColor: '#4A9D6F', alignItems: 'center', justifyContent: 'center' },
  cardAppName: { marginLeft: 28, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: '#1C1C1E' },
  cardLineLong: { marginTop: 10, height: 6, borderRadius: 3, width: '90%', backgroundColor: '#E2E2E4' },
  cardLineShort: { marginTop: 6, height: 6, borderRadius: 3, width: '55%', backgroundColor: '#E2E2E4' },
  title: { fontSize: 24, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#B8B8BC', textAlign: 'center', marginBottom: 48 },
  enableButton: { width: '100%', backgroundColor: '#FFF', borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  enableButtonText: { fontSize: 16, fontWeight: '700', color: '#111' },
  skipButton: { paddingVertical: 8 },
  skipButtonText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  footerNote: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 24, fontSize: 12, color: '#7A7A7E', textAlign: 'center', paddingHorizontal: 16 },
});
