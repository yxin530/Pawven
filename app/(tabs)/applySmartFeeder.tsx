import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

type FeederType = {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
};

const FEEDER_TYPES: FeederType[] = [
  { id: 'mini-solar-normal', title: 'Mini Solar + Normal Feeder', description: 'Solar-powered, compact size', price: 309, icon: '☀️' },
  { id: 'normal-battery', title: 'Normal Feeder + Battery', description: 'Standard size, battery-powered', price: 289, icon: '🔋' },
  { id: 'large-battery', title: 'Large Feeder + Battery', description: 'High capacity, battery-powered', price: 359, icon: '🔋' },
  { id: 'mini-solar-large', title: 'Mini Solar + Large Feeder', description: 'Solar-powered, high capacity', price: 379, icon: '☀️' },
];

export default function ApplyForSmartFeederScreen() {
  const router = useRouter();
  const [selectedFeeder, setSelectedFeeder] = useState<string>(FEEDER_TYPES[0].id);
  const [numFeeders, setNumFeeders] = useState('2');
  const [reason, setReason] = useState('');
  const [coloniesNearby, setColoniesNearby] = useState('12');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const handleSubmit = () => {
    if (!agreedToTerms) return;
    console.log({ selectedFeeder, numFeeders, reason, coloniesNearby, additionalNotes });
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Apply for Smart Feeder</Text>
      <Text style={styles.subtitle}>Choose a feeder type and complete the form below.</Text>

      <Text style={styles.sectionLabel}>SELECT FEEDER TYPE</Text>

      <View style={styles.feederGrid}>
        {FEEDER_TYPES.map((feeder) => {
          const isSelected = selectedFeeder === feeder.id;
          return (
            <TouchableOpacity
              key={feeder.id}
              style={[styles.feederCard, isSelected && styles.feederCardSelected]}
              onPress={() => setSelectedFeeder(feeder.id)}
              activeOpacity={0.8}
            >
              <View style={styles.feederImageBox}>
                <Text style={{ fontSize: 28 }}>{feeder.icon}</Text>
              </View>

              <View style={styles.radioCircleWrapper}>
                {isSelected ? (
                  <View style={styles.radioSelected}><Text style={{ fontSize: 10, color: '#fff' }}>✓</Text></View>
                ) : (
                  <View style={styles.radioUnselected} />
                )}
              </View>

              <Text style={styles.feederTitle}>{feeder.title}</Text>
              <Text style={styles.feederDescription}>{feeder.description}</Text>
              <Text style={styles.feederPrice}>${feeder.price} USD</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>Number of Feeders Requested</Text>
      <TextInput style={styles.input} value={numFeeders} onChangeText={setNumFeeders} keyboardType="number-pad" placeholder="e.g. 2" placeholderTextColor="#aaa" />

      <Text style={styles.fieldLabel}>Reason for Request</Text>
      <TextInput style={[styles.input, styles.textArea]} value={reason} onChangeText={setReason} placeholder="Describe why you need this feeder…" placeholderTextColor="#aaa" multiline textAlignVertical="top" />

      <Text style={styles.fieldLabel}>Current Managed Colonies / Strays Nearby</Text>
      <TextInput style={styles.input} value={coloniesNearby} onChangeText={setColoniesNearby} keyboardType="number-pad" placeholder="e.g. 12" placeholderTextColor="#aaa" />

      <View style={styles.notesLabelRow}>
        <Text style={styles.fieldLabel}>Additional Notes </Text>
        <Text style={styles.optionalText}>(optional)</Text>
      </View>
      <TextInput style={[styles.input, styles.textArea]} value={additionalNotes} onChangeText={setAdditionalNotes} placeholder="Any other information…" placeholderTextColor="#aaa" multiline textAlignVertical="top" />

      <TouchableOpacity style={styles.termsRow} onPress={() => setAgreedToTerms(!agreedToTerms)} activeOpacity={0.8}>
        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
          {agreedToTerms && <Text style={{ fontSize: 10, color: '#fff' }}>✓</Text>}
        </View>
        <Text style={styles.termsText}>
          I have read and agree to the <Text style={styles.termsLink}>Feederlink Smart Feeder Terms & Conditions</Text> for requesting a smart feeder unit.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, !agreedToTerms && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!agreedToTerms}
        activeOpacity={0.85}
      >
        <Text style={styles.submitButtonText}>✈  Submit Application</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backBtnText: { fontSize: 16, color: '#111', fontWeight: '500' },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4, marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 10 },
  feederGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  feederCard: { width: '48%', borderWidth: 1, borderColor: '#e3e3e3', borderRadius: 12, padding: 12, marginBottom: 12 },
  feederCardSelected: { borderColor: '#111', borderWidth: 2 },
  feederImageBox: { height: 70, borderRadius: 8, backgroundColor: '#e8e8e8', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  radioCircleWrapper: { position: 'absolute', top: 10, right: 10 },
  radioSelected: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  radioUnselected: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#ccc', backgroundColor: '#fff' },
  feederTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginTop: 2 },
  feederDescription: { fontSize: 12, color: '#888', marginTop: 4 },
  feederPrice: { fontSize: 14, fontWeight: '700', color: '#2f9e44', marginTop: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#111', marginTop: 18, marginBottom: 8 },
  notesLabelRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 18, marginBottom: 8 },
  optionalText: { fontSize: 12, color: '#999' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111' },
  textArea: { minHeight: 90 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f7f7f7', borderRadius: 10, padding: 14, marginTop: 22 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  checkboxChecked: { backgroundColor: '#111', borderColor: '#111' },
  termsText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 19 },
  termsLink: { textDecorationLine: 'underline', color: '#111', fontWeight: '600' },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', borderRadius: 12, paddingVertical: 15, marginTop: 16 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
