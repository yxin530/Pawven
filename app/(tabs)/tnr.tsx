import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@/hooks/useLocation';
import { useTNRStore } from '@/store/tnr-store';
import type { TNRActivityType, GeoLocation } from '@/types';

const ACTIVITY_TYPES: { label: string; value: TNRActivityType }[] = [
  { label: 'Trapped', value: 'trapped' },
  { label: 'Neutered', value: 'neutered' },
  { label: 'Returned', value: 'returned' },
  { label: 'Feeding', value: 'feeding' },
  { label: 'Sighting', value: 'sighting' },
];

const MAX_DESCRIPTION_LENGTH = 500;

interface FormErrors {
  location?: string;
  notes?: string;
  activityType?: string;
}

/**
 * TNR Report submission form screen.
 * Collects location, cat description, and activity type.
 * Validates required fields and submits via the TNR store.
 */
export default function TNRScreen() {
  const { location: geoLocation, loading: locationLoading } = useLocation();
  const { loading: submitting, error: storeError, submitReport, updateDraft, createDraft } = useTNRStore();

  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [notes, setNotes] = useState('');
  const [activityType, setActivityType] = useState<TNRActivityType | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Initialize draft on mount
  useEffect(() => {
    createDraft();
  }, [createDraft]);

  const getLocation = useCallback((): GeoLocation | null => {
    if (geoLocation) {
      return geoLocation;
    }
    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
    return null;
  }, [geoLocation, manualLatitude, manualLongitude]);

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};
    const loc = getLocation();

    if (!loc) {
      newErrors.location = 'This field is required';
    }
    if (!notes.trim()) {
      newErrors.notes = 'This field is required';
    }
    if (!activityType) {
      newErrors.activityType = 'This field is required';
    }

    return newErrors;
  }, [getLocation, notes, activityType]);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const loc = getLocation()!;

    // Update draft in the store before submitting
    updateDraft({
      location: loc,
      notes: notes.trim(),
      activityType,
    });

    await submitReport();

    // Check if submission succeeded (no error in store)
    const currentError = useTNRStore.getState().error;
    if (!currentError) {
      setSubmitted(true);
      Alert.alert('Success', 'Your TNR report has been submitted successfully.');
      // Reset form
      setNotes('');
      setActivityType(null);
      setManualLatitude('');
      setManualLongitude('');
      setErrors({});
      setSubmitted(false);
    }
  }, [validate, getLocation, updateDraft, notes, activityType, submitReport]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text className="text-2xl font-bold text-text mb-1">TNR Report</Text>
        <Text className="text-sm text-text-secondary mb-6">
          Report a stray cat sighting or TNR activity
        </Text>

        {/* Location Section */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-text mb-2">Location *</Text>
          {locationLoading ? (
            <View className="bg-surface border border-border rounded-lg p-3">
              <Text className="text-text-secondary text-sm">
                Getting your location...
              </Text>
            </View>
          ) : geoLocation ? (
            <View className="bg-surface border border-border rounded-lg p-3">
              <Text className="text-text text-sm">
                📍 {geoLocation.latitude.toFixed(6)}, {geoLocation.longitude.toFixed(6)}
              </Text>
              {geoLocation.address ? (
                <Text className="text-text-secondary text-xs mt-1">
                  {geoLocation.address}
                </Text>
              ) : null}
            </View>
          ) : (
            <View>
              <Text className="text-text-secondary text-xs mb-2">
                Enter coordinates manually
              </Text>
              <View className="flex-row gap-3">
                <TextInput
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-text"
                  placeholder="Latitude"
                  placeholderTextColor="#B0B0B0"
                  value={manualLatitude}
                  onChangeText={setManualLatitude}
                  keyboardType="numeric"
                  accessibilityLabel="Latitude"
                />
                <TextInput
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-text"
                  placeholder="Longitude"
                  placeholderTextColor="#B0B0B0"
                  value={manualLongitude}
                  onChangeText={setManualLongitude}
                  keyboardType="numeric"
                  accessibilityLabel="Longitude"
                />
              </View>
            </View>
          )}
          {errors.location ? (
            <Text className="text-red-600 text-xs mt-1">{errors.location}</Text>
          ) : null}
        </View>

        {/* Cat Description */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-text mb-2">
            Cat Description *
          </Text>
          <TextInput
            className="bg-surface border border-border rounded-lg px-3 py-3 text-text min-h-[100px]"
            placeholder="Describe the cat (color, size, condition, behavior...)"
            placeholderTextColor="#B0B0B0"
            value={notes}
            onChangeText={setNotes}
            multiline
            maxLength={MAX_DESCRIPTION_LENGTH}
            textAlignVertical="top"
            accessibilityLabel="Cat description"
          />
          <Text className="text-xs text-text-secondary mt-1 text-right">
            {notes.length}/{MAX_DESCRIPTION_LENGTH}
          </Text>
          {errors.notes ? (
            <Text className="text-red-600 text-xs mt-1">{errors.notes}</Text>
          ) : null}
        </View>

        {/* Activity Type */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-text mb-2">
            Activity Type *
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ACTIVITY_TYPES.map((type) => {
              const isSelected = activityType === type.value;
              return (
                <Pressable
                  key={type.value}
                  onPress={() => setActivityType(type.value)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Activity type: ${type.label}`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-text'
                    }`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.activityType ? (
            <Text className="text-red-600 text-xs mt-1">
              {errors.activityType}
            </Text>
          ) : null}
        </View>

        {/* API Error Message */}
        {storeError ? (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <Text className="text-red-700 text-sm">{storeError}</Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className={`py-4 rounded-lg items-center ${
            submitting ? 'bg-disabled' : 'bg-primary'
          }`}
          accessibilityRole="button"
          accessibilityLabel="Submit TNR report"
          accessibilityState={{ disabled: submitting }}
        >
          <Text className="text-white font-semibold text-base">
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
