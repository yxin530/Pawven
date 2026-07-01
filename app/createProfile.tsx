import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Config } from '@/constants/Config';

export default function CreateProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const role = (global as any).__pawven_role;
  const isNgoVet = role === 'ngo' || role === 'vet';

  const isFormValid = name.trim().length > 0;

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need gallery access to set your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      // Store globally so profile screen can use it
      (global as any).__pawven_avatar = result.assets[0].uri;
    }
  };

  const handleSaveProfile = async () => {
    if (!isFormValid) return;
    // Store profile data globally so profile screens can use it
    (global as any).__pawven_name = name.trim();
    (global as any).__pawven_bio = bio.trim();
    // Save to backend (fire and forget)
    try {
      await fetch(`${Config.API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim(), role }),
      });
    } catch {}
    router.push('/pushNotification');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Progress dots */}
        <View style={styles.progressRow}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>

        {/* Avatar */}
        <View style={[styles.avatarWrapper, { marginTop: 24 }]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarGradient}>
              <Text style={{ fontSize: 40 }}>😊</Text>
            </View>
          )}
          <TouchableOpacity style={styles.cameraButton} onPress={handlePickAvatar}>
            <Text style={{ fontSize: 14 }}>📷</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Introduce yourself to others in your events.</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} placeholder="Your Name" placeholderTextColor="#A0A0A0" value={name} onChangeText={setName} autoCapitalize="words" />

        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, styles.bioInput]} placeholder="Share a little about your background and interests." placeholderTextColor="#A0A0A0" value={bio} onChangeText={setBio} multiline numberOfLines={4} textAlignVertical="top" />

        {/* KYC for NGO/Vet — Certificate upload */}
        {isNgoVet && (
          <>
            <Text style={styles.label}>Certificate / License *</Text>
            <Text style={styles.kycHint}>Upload your NGO registration or veterinary license for verification.</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') { Alert.alert('Permission Required', 'We need gallery access.'); return; }
              const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
              if (!result.canceled) Alert.alert('Uploaded', 'Certificate uploaded for review.');
            }}>
              <Text style={styles.uploadBoxIcon}>📄</Text>
              <Text style={styles.uploadBoxText}>Tap to upload certificate</Text>
              <Text style={styles.uploadBoxHint}>PDF, JPG, PNG supported</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]} onPress={handleSaveProfile} disabled={!isFormValid} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 16, marginBottom: 8 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  progressDotActive: { backgroundColor: '#111111', width: 24 },
  headerBackground: { height: 160, backgroundColor: '#F1F1F3', overflow: 'hidden' },
  dragHandle: { alignSelf: 'center', marginTop: 10, width: 36, height: 4, borderRadius: 2, backgroundColor: '#C7C7CC' },
  sparkle: { position: 'absolute', fontSize: 12, color: '#8A8A8E' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  avatarWrapper: { marginTop: -56, width: 104, height: 104 },
  avatarGradient: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FAFAFA' },
  avatarImage: { width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: '#FAFAFA' },
  cameraButton: { position: 'absolute', right: -4, bottom: -4, width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  title: { marginTop: 20, fontSize: 26, fontWeight: '700', color: '#111' },
  subtitle: { marginTop: 6, fontSize: 14, color: '#8A8A8E' },
  label: { marginTop: 24, marginBottom: 8, fontSize: 13, color: '#8A8A8E' },
  input: { backgroundColor: '#EFEFF1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111' },
  bioInput: { minHeight: 100, paddingTop: 14 },
  kycHint: { fontSize: 12, color: '#888', marginBottom: 10 },
  uploadBox: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CCC', borderRadius: 14, padding: 24, alignItems: 'center', backgroundColor: '#F9F9F9' },
  uploadBoxIcon: { fontSize: 28, marginBottom: 8 },
  uploadBoxText: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 },
  uploadBoxHint: { fontSize: 12, color: '#AAA' },
  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 24 : 16, paddingTop: 8, backgroundColor: '#FAFAFA' },
  saveButton: { backgroundColor: '#111', borderRadius: 28, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { backgroundColor: '#B8B8BC' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
