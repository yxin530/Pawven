import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

const SettingsRow = ({ icon, iconImage, label, onPress, isLast }: { icon?: string; iconImage?: any; label: string; onPress?: () => void; isLast?: boolean }) => (
  <>
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      {iconImage ? (
        <Image source={iconImage} style={{ width: 20, height: 20, marginRight: 12 }} resizeMode="contain" />
      ) : (
        <Text style={styles.rowIcon}>{icon}</Text>
      )}
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
    {!isLast && <View style={styles.rowDivider} />}
  </>
);

export default function AccountSection() {
  const router = useRouter();

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Manage your notification preferences', [
      { text: 'Turn Off', style: 'destructive', onPress: () => Alert.alert('Notifications turned off') },
      { text: 'Keep On', style: 'cancel' },
    ]);
  };

  const handlePrivacy = () => {
    // Will route to privacy screen when created
    Alert.alert('Privacy', 'Privacy settings screen coming soon.');
  };

  const handleLogOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          // Clear global user data
          (global as any).__pawven_name = undefined;
          (global as any).__pawven_bio = undefined;
          (global as any).__pawven_avatar = undefined;
          (global as any).__pawven_role = undefined;
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <SettingsRow iconImage={require('@/assets/icons/bellIcon.png')} label="Notifications" onPress={handleNotifications} />
        <SettingsRow icon="🛡️" label="Privacy" onPress={handlePrivacy} />
        <SettingsRow iconImage={require('@/assets/icons/logout.png')} label="Log Out" onPress={handleLogOut} isLast />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>🐾 Pawven</Text>
        <Text style={styles.footerTagline}>© 2026 Pawven. Helping strays, one step at a time.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#6b6b6b', marginBottom: 10, marginLeft: 2 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e8e8e8', overflow: 'hidden', marginBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 17 },
  rowIcon: { fontSize: 16, width: 26, marginRight: 12, textAlign: 'center', color: '#4a4a4a' },
  rowLabel: { flex: 1, fontSize: 16, color: '#111111' },
  rowChevron: { fontSize: 20, color: '#c0c0c0', lineHeight: 22 },
  rowDivider: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 56 },
  footer: { alignItems: 'center', paddingTop: 16, paddingBottom: 8, borderTopWidth: 1, borderTopColor: '#eeeeee' },
  footerBrand: { fontSize: 15, fontWeight: '700', color: '#111111', marginBottom: 6 },
  footerTagline: { fontSize: 12, color: '#9a9a9a', textAlign: 'center' },
});
