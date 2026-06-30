import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Config } from '@/constants/Config';

export type UserRole = 'ngo' | 'vet' | 'cat-lover';

type RoleOption = {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'ngo',
    title: 'NGO / Organisation',
    description: 'We run rescue, adoption, or welfare programmes for cats and other animals.',
    icon: '🏢',
  },
  {
    id: 'vet',
    title: 'Veterinarian',
    description: "I'm a licensed vet or vet technician providing medical care to cats.",
    icon: '🩺',
  },
  {
    id: 'cat-lover',
    title: 'Cat Lover',
    description: 'I love cats and want to connect, adopt, foster, or support the community.',
    icon: '❤️',
  },
];

export default function OnboardingRoleScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ngo');

  const handleContinue = () => {
    // Store role globally so Home screen routes to correct profile
    (global as any).__pawven_role = selectedRole;

    // Fire-and-forget POST to save role selection
    fetch(`${Config.API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: selectedRole }),
    }).catch((e) => console.log('Role save failed (non-blocking):', e));

    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <View style={styles.logoIcon}>
          <Text style={{ fontSize: 14, color: '#fff' }}>🐾</Text>
        </View>
        <Text style={styles.logoText}>Pawven</Text>
      </View>

      {/* Progress dots */}
      <View style={styles.progressRow}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Title */}
      <Text style={styles.title}>What best describes you?</Text>
      <Text style={styles.subtitle}>
        Select your role so we can personalise your experience on Pawven.
      </Text>

      {/* Role options */}
      <View style={styles.optionsList}>
        {ROLE_OPTIONS.map((option) => {
          const isSelected = selectedRole === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => setSelectedRole(option.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.optionIconCircle, isSelected && styles.optionIconCircleSelected]}>
                <Text style={{ fontSize: 20 }}>{option.icon}</Text>
              </View>

              <View style={styles.optionTextWrapper}>
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                  {option.description}
                </Text>
              </View>

              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <Text style={{ fontSize: 10, color: '#111' }}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
        <Text style={styles.continueButtonText}>Continue  →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 60 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 19, fontWeight: '700', color: '#111', marginLeft: 10 },
  progressRow: { flexDirection: 'row', marginTop: 22, gap: 6 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#eee' },
  progressDotActive: { backgroundColor: '#111' },
  title: { fontSize: 26, fontWeight: '700', color: '#111', marginTop: 24 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 8, lineHeight: 20 },
  optionsList: { marginTop: 24 },
  optionCard: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 14, padding: 16, marginBottom: 14, backgroundColor: '#fff' },
  optionCardSelected: { backgroundColor: '#111', borderColor: '#111' },
  optionIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center' },
  optionIconCircleSelected: { backgroundColor: '#fff' },
  optionTextWrapper: { flex: 1, marginLeft: 14, marginRight: 10 },
  optionTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  optionTitleSelected: { color: '#fff' },
  optionDescription: { fontSize: 13, color: '#888', marginTop: 4, lineHeight: 19 },
  optionDescriptionSelected: { color: '#ccc' },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#ccc', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioCircleSelected: { backgroundColor: '#fff', borderColor: '#fff' },
  continueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', borderRadius: 14, paddingVertical: 16, marginTop: 8 },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
