import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Image,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Config } from '@/constants/Config';

// ---------------------------------------------
// Types
// ---------------------------------------------
type Visibility = 'Public' | 'Private' | 'Friends Only';
type Capacity = 'Unlimited' | 'Limited';

interface CreateEventScreenProps {
  profileAvatarUri?: string;
}

interface EventFormData {
  coverPhotoUri: string | null;
  eventName: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
  requireApproval: boolean;
  price: string;
  visibility: Visibility;
  capacity: Capacity;
}

type ActivePicker = 'none' | 'start-date' | 'start-time' | 'end-date' | 'end-time';

// ---------------------------------------------
// Helpers
// ---------------------------------------------
const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const addOneHour = (date: Date) => new Date(date.getTime() + 60 * 60 * 1000);

// ---------------------------------------------
// Component
// ---------------------------------------------
const CreateEventScreen: React.FC<CreateEventScreenProps> = ({
  profileAvatarUri,
}) => {
  const router = useRouter();
  const [coverPhotoUri, setCoverPhotoUri] = useState<string | null>(null);
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addOneHour(new Date()));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requireApproval, setRequireApproval] = useState(false);
  const [price, setPrice] = useState('Free');
  const [visibility, setVisibility] = useState<Visibility>('Public');
  const [capacity, setCapacity] = useState<Capacity>('Unlimited');

  const [activePicker, setActivePicker] = useState<ActivePicker>('none');

  const isFormValid = eventName.trim().length > 0;

  const handlePickCoverPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.length) {
      setCoverPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      await fetch(`${Config.API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventName,
          description,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          address: location,
          category: 'meetup',
        }),
      });
      Alert.alert('Success', 'Event created!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundOverlay} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.back()}>
            {profileAvatarUri ? (
              <Image source={{ uri: profileAvatarUri }} style={styles.profileAvatarImg} />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarIcon}>👤</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create Event</Text>

          <TouchableOpacity
            style={[styles.doneBtn, isFormValid && styles.doneBtnActive]}
            onPress={handleSubmit}
            disabled={!isFormValid}
          >
            <Text style={[styles.doneBtnCheck, isFormValid && styles.doneBtnCheckActive]}>
              ✓
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cover Photo */}
        <TouchableOpacity
          style={[styles.coverPhotoContainer, !coverPhotoUri && styles.coverPhotoEmpty]}
          onPress={handlePickCoverPhoto}
          activeOpacity={0.85}
        >
          {coverPhotoUri ? (
            <>
              <Image source={{ uri: coverPhotoUri }} style={styles.coverPhotoImage} />
              <View style={styles.coverPhotoEditBadge}>
                <Text style={styles.coverPhotoEditIcon}>🖼️+</Text>
              </View>
            </>
          ) : (
            <View style={styles.coverPhotoAddRow}>
              <Text style={styles.coverPhotoAddIcon}>🖼️+</Text>
              <Text style={styles.coverPhotoAddText}>Add Cover Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Event Name */}
        <View style={styles.fieldGroup}>
          <TextInput
            style={styles.eventNameInput}
            placeholder="Event Name"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={eventName}
            onChangeText={setEventName}
          />
        </View>

        {/* Start / End */}
        <View style={styles.fieldGroup}>
          <View style={styles.dateRow}>
            <View style={styles.dateRowDots}>
              <View style={styles.dotFilled} />
              <View style={styles.dotConnector} />
              <View style={styles.dotOutline} />
            </View>

            <View style={styles.dateRowContent}>
              <View style={styles.dateRowLine}>
                <Text style={styles.dateRowLabel}>Start</Text>
                <View style={styles.dateRowValueGroup}>
                  <TouchableOpacity onPress={() => setActivePicker('start-date')}>
                    <Text style={styles.dateRowValue}>{formatDate(startDate)}</Text>
                  </TouchableOpacity>
                  <Text style={styles.dateRowValue}> at </Text>
                  <TouchableOpacity onPress={() => setActivePicker('start-time')}>
                    <Text style={styles.dateRowValue}>{formatTime(startDate)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dateRowDivider} />

              <View style={styles.dateRowLine}>
                <Text style={styles.dateRowLabel}>End</Text>
                <TouchableOpacity onPress={() => setActivePicker('end-time')}>
                  <Text style={styles.dateRowValue}>{formatTime(endDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.fieldGroup}>
          <View style={styles.iconInputRow}>
            <Text style={styles.iconInputIcon}>📍</Text>
            <TextInput
              style={styles.iconInputField}
              placeholder="Choose Location"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <View style={styles.iconInputRow}>
            <Text style={styles.iconInputIcon}>📝</Text>
            <TextInput
              style={styles.iconInputField}
              placeholder="Add Description"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
        </View>

        {/* Ticketing */}
        <Text style={styles.sectionLabel}>Ticketing</Text>
        <View style={styles.fieldGroup}>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsIcon}>🔒</Text>
            <Text style={styles.settingsLabel}>Require Approval</Text>
            <Switch
              value={requireApproval}
              onValueChange={setRequireApproval}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#ffffff' }}
              thumbColor={requireApproval ? '#000000' : '#ffffff'}
              ios_backgroundColor="rgba(255,255,255,0.2)"
            />
          </View>

          <View style={styles.settingsRowDivider} />

          <TouchableOpacity style={styles.settingsRow}>
            <Text style={styles.settingsIcon}>$</Text>
            <Text style={styles.settingsLabel}>Price</Text>
            <View style={styles.settingsValueGroup}>
              <Text style={styles.settingsValue}>{price}</Text>
              <Text style={styles.settingsChevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Options */}
        <Text style={styles.sectionLabel}>Options</Text>
        <View style={styles.fieldGroup}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() =>
              setVisibility((prev) =>
                prev === 'Public' ? 'Friends Only' : prev === 'Friends Only' ? 'Private' : 'Public'
              )
            }
          >
            <Text style={styles.settingsIcon}>🌐</Text>
            <Text style={styles.settingsLabel}>Visibility</Text>
            <View style={styles.settingsValueGroup}>
              <Text style={styles.settingsValueBold}>{visibility}</Text>
              <Text style={styles.settingsStepper}>⌃⌄</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingsRowDivider} />

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => setCapacity((prev) => (prev === 'Unlimited' ? 'Limited' : 'Unlimited'))}
          >
            <Text style={styles.settingsIcon}>👥</Text>
            <Text style={styles.settingsLabel}>Capacity</Text>
            <View style={styles.settingsValueGroup}>
              <Text style={styles.settingsValueBold}>{capacity}</Text>
              <Text style={styles.settingsStepper}>⌃⌄</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------------------------------
// Colors
// ---------------------------------------------
const COLORS = {
  background: '#1c1c1e',
  overlay: 'rgba(20,20,22,0.6)',
  cardBg: 'rgba(120,120,128,0.24)',
  cardBorder: 'rgba(255,255,255,0.08)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.4)',
  doneInactiveBg: 'rgba(120,120,128,0.32)',
  doneActiveBg: '#ffffff',
};

// ---------------------------------------------
// Styles
// ---------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 48,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileBtn: {
    width: 40,
    height: 40,
  },
  profileAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(120,120,128,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarIcon: {
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  doneBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.doneInactiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnActive: {
    backgroundColor: COLORS.doneActiveBg,
    shadowColor: '#ffffff',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  doneBtnCheck: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  doneBtnCheckActive: {
    color: '#000000',
  },

  // Cover photo
  coverPhotoContainer: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: COLORS.cardBg,
  },
  coverPhotoEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    aspectRatio: undefined,
    paddingVertical: 28,
  },
  coverPhotoImage: {
    width: '100%',
    height: '100%',
  },
  coverPhotoAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverPhotoAddIcon: {
    fontSize: 16,
    marginRight: 8,
    color: COLORS.textSecondary,
  },
  coverPhotoAddText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  coverPhotoEditBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPhotoEditIcon: {
    fontSize: 12,
    color: '#ffffff',
  },

  // Field group (frosted card)
  fieldGroup: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  eventNameInput: {
    fontSize: 17,
    color: COLORS.textPrimary,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  // Date row
  dateRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  dateRowDots: {
    alignItems: 'center',
    width: 16,
    marginRight: 12,
    paddingTop: 4,
  },
  dotFilled: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
  },
  dotConnector: {
    width: 1,
    flex: 1,
    minHeight: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 4,
  },
  dotOutline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
  },
  dateRowContent: {
    flex: 1,
  },
  dateRowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dateRowLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  dateRowValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateRowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dateRowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },

  // Icon input rows (location/description)
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  iconInputIcon: {
    fontSize: 16,
    marginRight: 12,
    color: COLORS.textSecondary,
  },
  iconInputField: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 4,
  },

  // Settings rows (toggle / value / chevron)
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  settingsRowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 18,
  },
  settingsIcon: {
    fontSize: 15,
    width: 22,
    color: COLORS.textSecondary,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  settingsValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  settingsValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  settingsChevron: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  settingsStepper: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 14,
  },

  // Date/time picker modal (iOS)
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerModalCard: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  pickerModalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a84ff',
  },
});

export default CreateEventScreen;