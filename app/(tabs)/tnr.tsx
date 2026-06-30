import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import TNRReportCasesScreen from './ngoVetTnr';
import { Config } from '@/constants/Config';

// ─── Types ────────────────────────────────────────────────────────────────────

type CaseStatus = 'Pending' | 'In Progress' | 'Done';
type FilterTab = 'All' | 'Pending' | 'In Progress' | 'Completed';

interface TNRCase {
  id: string;
  title: string;
  location: string;
  reportedDate: string;
  status: CaseStatus;
  stepsCompleted: number;
  totalSteps: number;
  assignedTo?: string;
  scheduledDate?: string;
  vet?: string;
  awaitingMessage?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CASES: TNRCase[] = [
  {
    id: '1',
    title: 'Orange Tabby',
    location: 'Taman Jaya',
    reportedDate: '3 Jan 2026',
    status: 'Done',
    stepsCompleted: 4,
    totalSteps: 4,
    assignedTo: 'KL Cat Rescue NGO',
    vet: 'Dr. Amir Clinic',
  },
  {
    id: '2',
    title: 'Grey Stray',
    location: 'SS2 Carpark',
    reportedDate: '10 Feb 2026',
    status: 'In Progress',
    stepsCompleted: 2,
    totalSteps: 4,
    assignedTo: 'Paws Society',
    scheduledDate: '20 Feb 2026',
  },
  {
    id: '3',
    title: 'Black Cat',
    location: 'PJ Old Town',
    reportedDate: '15 Feb 2026',
    status: 'Pending',
    stepsCompleted: 1,
    totalSteps: 4,
    awaitingMessage: 'Awaiting NGO assignment',
  },
];

// ─── Step Icons ───────────────────────────────────────────────────────────────

const STEPS = ['Reported', 'NGO\nAssigned', 'Neutered', 'Released'];

function StepIndicator({
  label,
  completed,
}: {
  label: string;
  completed: boolean;
}) {
  return (
    <View style={styles.stepItem}>
      <View
        style={[
          styles.stepCircle,
          completed ? styles.stepCircleCompleted : styles.stepCircleEmpty,
        ]}
      >
        {completed && <Text style={styles.stepCheckmark}>✓</Text>}
      </View>
      <Text style={[styles.stepLabel, completed && styles.stepLabelCompleted]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Case Card ────────────────────────────────────────────────────────────────

function CaseCard({ item }: { item: TNRCase }) {
  const progressRatio = item.stepsCompleted / item.totalSteps;

  const badgeStyle =
    item.status === 'Done'
      ? styles.badgeDone
      : item.status === 'In Progress'
      ? styles.badgeInProgress
      : styles.badgePending;

  const badgeTextStyle =
    item.status === 'Done'
      ? styles.badgeTextDone
      : styles.badgeTextOutline;

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={styles.catIconBox}>
          <Text style={styles.catIconText}>🐱</Text>
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>
            {item.title}{' '}
            <Text style={styles.cardLocation}>— {item.location}</Text>
          </Text>
          <Text style={styles.cardDate}>Reported {item.reportedDate}</Text>
        </View>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>{item.status}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]}
        />
      </View>
      <Text style={styles.progressStepCount}>
        {item.stepsCompleted}/{item.totalSteps} steps
      </Text>

      {/* Step indicators */}
      <View style={styles.stepsRow}>
        {STEPS.map((label, i) => (
          <StepIndicator
            key={i}
            label={label}
            completed={i < item.stepsCompleted}
          />
        ))}
      </View>

      {/* Footer info */}
      {item.assignedTo && item.vet ? (
        <Text style={styles.cardFooterText}>
          Handled by: {item.assignedTo} · Vet: {item.vet}
        </Text>
      ) : item.assignedTo && item.scheduledDate ? (
        <Text style={styles.cardFooterText}>
          Assigned to: {item.assignedTo} · Scheduled: {item.scheduledDate}
        </Text>
      ) : item.awaitingMessage ? (
        <Text style={styles.cardFooterText}>{item.awaitingMessage}</Text>
      ) : null}
    </View>
  );
}

// ─── TNR Progress Screen (with cases) ────────────────────────────────────────

function TNRWithCases({ onReport }: { onReport: () => void }) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [cases, setCases] = useState<TNRCase[]>(MOCK_CASES);
  const filters: FilterTab[] = ['All', 'Pending', 'In Progress', 'Completed'];

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch(`${Config.API_BASE_URL}/reports`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: TNRCase[] = data.map((r: any) => ({
            id: r.id,
            title: r.notes || 'Untitled',
            location: r.address || 'Unknown',
            reportedDate: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
            status: r.status === 'open' ? 'Pending' : r.status === 'in_progress' ? 'In Progress' : 'Done',
            stepsCompleted: r.status === 'open' ? 1 : r.status === 'in_progress' ? 2 : 4,
            totalSteps: 4,
          }));
          setCases(mapped);
        }
      } catch (e) {
        // Keep mock data as fallback
        console.log('Using mock TNR cases:', e);
      }
    };
    fetchCases();
  }, []);

  const reported = cases.length;
  const inProgress = cases.filter(c => c.status === 'In Progress').length;
  const completed = cases.filter(c => c.status === 'Done').length;

  const filtered =
    activeFilter === 'All'
      ? cases
      : cases.filter(c => {
          if (activeFilter === 'Completed') return c.status === 'Done';
          return c.status === activeFilter;
        });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.pageTitle}>TNR Progress</Text>
        <Text style={styles.pageSubtitle}>
          Track cases you reported to NGOs & vets for neutering
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { value: reported, label: 'Reported' },
            { value: inProgress, label: 'In Progress' },
            { value: completed, label: 'Completed' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterTab,
                activeFilter === f && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === f && styles.filterTabTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Case cards */}
        {filtered.map(item => (
          <CaseCard key={item.id} item={item} />
        ))}

        {/* Report button — moves with scroll */}
        <TouchableOpacity
          style={[styles.reportButton, { marginTop: 20 }]}
          onPress={onReport}
          activeOpacity={0.85}
        >
          <Text style={styles.reportButtonText}>+ Report a New Case</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── TNR Progress Screen (empty state) ───────────────────────────────────────

function TNREmpty({ onReport }: { onReport: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.pageTitle}>TNR Progress</Text>
        <Text style={styles.pageSubtitle}>
          Track your trap-neuter-return activity
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { value: 0, label: 'Cases\nReported' },
            { value: 0, label: 'Cats Trapped' },
            { value: 0, label: 'Returned' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={[styles.statLabel, { textAlign: 'center' }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Overall progress */}
        <View style={styles.overallProgressCard}>
          <View style={styles.overallProgressHeader}>
            <Text style={styles.overallProgressTitle}>Overall Progress</Text>
            <Text style={styles.overallProgressPct}>0%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '0%' }]} />
          </View>
          <Text style={styles.noActivityText}>No activity recorded yet.</Text>
        </View>

        {/* Empty state */}
        <View style={styles.emptyStateCard}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIconText}>🐱</Text>
          </View>
          <Text style={styles.emptyTitle}>No cases reported yet</Text>
          <Text style={styles.emptyBody}>
            You haven't reported any stray cat cases.{'\n'}Start by reporting
            your first TNR case to{'\n'}track your progress.
          </Text>
        </View>

        {/* How it works */}
        <Text style={styles.howItWorksTitle}>How it works</Text>
        {[
          {
            n: 1,
            title: 'Report a stray',
            desc: 'Submit location and details of a stray cat you spotted.',
            active: true,
          },
          {
            n: 2,
            title: 'Trap & Neuter',
            desc: 'Work with local volunteers or clinics for TNR.',
            active: false,
          },
          {
            n: 3,
            title: 'Return & Track',
            desc: 'Mark the cat returned and monitor progress over time.',
            active: false,
          },
        ].map(step => (
          <View key={step.n} style={styles.howItWorksRow}>
            <View
              style={[
                styles.howItWorksNumber,
                step.active && styles.howItWorksNumberActive,
              ]}
            >
              <Text
                style={[
                  styles.howItWorksNumberText,
                  step.active && styles.howItWorksNumberTextActive,
                ]}
              >
                {step.n}
              </Text>
            </View>
            <View style={styles.howItWorksContent}>
              <Text style={styles.howItWorksStepTitle}>{step.title}</Text>
              <Text style={styles.howItWorksStepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        {/* Report button — moves with scroll */}
        <TouchableOpacity
          style={[styles.reportButton, { marginTop: 20 }]}
          onPress={onReport}
          activeOpacity={0.85}
        >
          <Text style={styles.reportButtonText}>+ Report Your First Case</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Report a Case Screen ─────────────────────────────────────────────────────

function ReportCaseScreen({ onBack }: { onBack: () => void }) {
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationMethod, setLocationMethod] = useState<'auto' | 'map' | 'manual'>('auto');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const MAX_DESC = 500;

  const [mapRegion] = useState({
    latitude: 3.139,
    longitude: 101.6869,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Auto-detect location
  const handleUseMyLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to auto-detect your position.');
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setSelectedLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setAddress(`${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`);
      setLocationMethod('auto');
    } catch {
      Alert.alert('Error', 'Could not get your location. Please try again or pick manually.');
    }
    setLoadingLocation(false);
  };

  // Pick on map
  const handleMapPress = (e: MapPressEvent) => {
    const coord = e.nativeEvent.coordinate;
    setSelectedLocation(coord);
    setAddress(`${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}`);
    setLocationMethod('map');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.screenContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.reportHeader}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.pageTitle}>Report a Case</Text>
            <Text style={styles.pageSubtitle}>Fill in details about the stray cat</Text>
          </View>
        </View>

        {/* Photo / Video */}
        <Text style={styles.fieldLabel}>Photo / Video <Text style={styles.fieldOptional}>(Optional)</Text></Text>
        <View style={styles.uploadBox}>
          <View style={styles.uploadIconCircle}><Text style={styles.uploadIcon}>☁️</Text></View>
          <Text style={styles.uploadTitle}>Tap to upload</Text>
          <Text style={styles.uploadHint}>JPG, PNG, MP4 supported</Text>
          <TouchableOpacity style={styles.chooseFileButton} activeOpacity={0.7}>
            <Text style={styles.chooseFileText}>Choose File</Text>
          </TouchableOpacity>
        </View>

        {/* Thumbnails row */}
        <View style={styles.thumbnailRow}>
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>🖼</Text>
            <View style={styles.thumbnailRemove}><Text style={styles.thumbnailRemoveText}>✕</Text></View>
          </View>
          <TouchableOpacity style={styles.thumbnailAdd} activeOpacity={0.7}>
            <Text style={styles.thumbnailAddText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Location <Text style={styles.fieldRequired}>*</Text></Text>

        {/* Location method selector */}
        <View style={styles.locationMethodRow}>
          <TouchableOpacity
            style={[styles.locationMethodBtn, locationMethod === 'auto' && styles.locationMethodBtnActive]}
            onPress={handleUseMyLocation}
          >
            <Text style={[styles.locationMethodText, locationMethod === 'auto' && styles.locationMethodTextActive]}>
              {loadingLocation ? '...' : '◎ My Location'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.locationMethodBtn, locationMethod === 'map' && styles.locationMethodBtnActive]}
            onPress={() => setLocationMethod('map')}
          >
            <Text style={[styles.locationMethodText, locationMethod === 'map' && styles.locationMethodTextActive]}>📍 Pick on Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.locationMethodBtn, locationMethod === 'manual' && styles.locationMethodBtnActive]}
            onPress={() => setLocationMethod('manual')}
          >
            <Text style={[styles.locationMethodText, locationMethod === 'manual' && styles.locationMethodTextActive]}>✏️ Address</Text>
          </TouchableOpacity>
        </View>

        {/* Map for picking location */}
        {(locationMethod === 'map' || locationMethod === 'auto') && (
          <View style={styles.mapPickerContainer}>
            <MapView
              style={styles.mapPicker}
              provider={PROVIDER_DEFAULT}
              initialRegion={mapRegion}
              onPress={handleMapPress}
              showsUserLocation={locationMethod === 'auto'}
            >
              {selectedLocation && (
                <Marker coordinate={selectedLocation}>
                  <View style={styles.selectedPin}><Text style={{ fontSize: 20 }}>📍</Text></View>
                </Marker>
              )}
            </MapView>
            {locationMethod === 'map' && (
              <Text style={styles.mapHint}>Tap on the map to drop a pin</Text>
            )}
          </View>
        )}

        {/* Manual address input */}
        {locationMethod === 'manual' && (
          <View style={styles.addressInputRow}>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter full address..."
              placeholderTextColor="#AAAAAA"
              value={address}
              onChangeText={(text) => { setAddress(text); setSelectedLocation(null); }}
            />
          </View>
        )}

        {/* Show selected coordinates */}
        {selectedLocation && (
          <View style={styles.coordDisplay}>
            <Text style={styles.coordText}>📍 {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}</Text>
          </View>
        )}
        {address && locationMethod === 'manual' && (
          <View style={styles.coordDisplay}>
            <Text style={styles.coordText}>� {address}</Text>
          </View>
        )}

        {/* Description */}
        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Description <Text style={styles.fieldRequired}>*</Text></Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder={'Describe the stray cat — color, size, behavior,\ncondition, number of cats, and any other relevant\ndetails...'}
          placeholderTextColor="#AAAAAA"
          multiline
          maxLength={MAX_DESC}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{description.length} / {MAX_DESC}</Text>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>Your report will be shared with nearby TNR volunteers and verified coordinators to help schedule trapping and veterinary care.</Text>
        </View>

        {/* Submit button — moves with scroll */}
        <TouchableOpacity style={[styles.reportButton, { marginTop: 24 }]} activeOpacity={0.85} onPress={async () => {
          if (!description.trim()) {
            Alert.alert('Required', 'Please add a description.');
            return;
          }
          if (!selectedLocation && !address) {
            Alert.alert('Required', 'Please provide a location.');
            return;
          }
          try {
            const payload = {
              lat: selectedLocation?.latitude || null,
              lng: selectedLocation?.longitude || null,
              address: address || '',
              notes: description,
              activityType: 'tnr',
            };
            const res = await fetch(`${Config.API_BASE_URL}/report`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              Alert.alert('Success', 'Your report has been submitted!');
              onBack();
            } else {
              const err = await res.json().catch(() => ({}));
              Alert.alert('Error', err.error || 'Failed to submit report. Please try again.');
            }
          } catch (e) {
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
            console.log('Report submission error:', e);
          }
        }}>
          <Text style={styles.reportButtonText}>✈ Submit Report</Text>
        </TouchableOpacity>
        <Text style={[styles.requiredNote, { marginTop: 8, marginBottom: 20 }]}>Fields marked with * are required</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

type Screen = 'tnr-with-cases' | 'tnr-empty' | 'report-case';

export default function App() {
  // Check if user is NGO/Vet — show their TNR management screen instead
  const role = (global as any).__pawven_role;
  if (role === 'ngo' || role === 'vet') {
    return <TNRReportCasesScreen />;
  }

  const [screen, setScreen] = useState<Screen>('tnr-with-cases');
  // Toggle below to test empty state: 'tnr-empty'

  if (screen === 'report-case') {
    return (
      <ReportCaseScreen onBack={() => setScreen('tnr-with-cases')} />
    );
  }
  if (screen === 'tnr-empty') {
    return <TNREmpty onReport={() => setScreen('report-case')} />;
  }
  return (
    <TNRWithCases onReport={() => setScreen('report-case')} />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },

  // ── Typography ──
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
    marginBottom: 20,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },

  // ── Filter tabs ──
  filterScroll: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },
  filterTabActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  filterTabText: {
    fontSize: 13,
    color: '#444444',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // ── Card ──
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  catIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIconText: {
    fontSize: 20,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  cardLocation: {
    fontWeight: '400',
    color: '#111111',
  },
  cardDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },

  // ── Badge ──
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeDone: {
    backgroundColor: '#111111',
  },
  badgeInProgress: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  badgePending: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextDone: {
    color: '#FFFFFF',
  },
  badgeTextOutline: {
    color: '#444444',
  },

  // ── Progress bar ──
  progressBarTrack: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#111111',
    borderRadius: 3,
  },
  progressStepCount: {
    fontSize: 11,
    color: '#999999',
    textAlign: 'right',
    marginBottom: 12,
  },

  // ── Steps ──
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: '#111111',
  },
  stepCircleEmpty: {
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
  },
  stepCheckmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 10,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 13,
  },
  stepLabelCompleted: {
    color: '#111111',
    fontWeight: '500',
  },
  cardFooterText: {
    fontSize: 12,
    color: '#999999',
  },

  // ── Bottom bar ──
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  reportButton: {
    backgroundColor: '#111111',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // ── Empty state ──
  overallProgressCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 16,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  overallProgressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  overallProgressPct: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  noActivityText: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 8,
  },
  emptyStateCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 34,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  howItWorksTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 16,
  },
  howItWorksRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 18,
  },
  howItWorksNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howItWorksNumberActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  howItWorksNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#AAAAAA',
  },
  howItWorksNumberTextActive: {
    color: '#FFFFFF',
  },
  howItWorksContent: {
    flex: 1,
  },
  howItWorksStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  howItWorksStepDesc: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
    lineHeight: 18,
  },

  // ── Report a Case ──
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#111111',
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 10,
  },
  fieldOptional: {
    fontWeight: '400',
    color: '#AAAAAA',
  },
  fieldRequired: {
    color: '#111111',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CCCCCC',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  uploadIconCircle: {
    marginBottom: 8,
  },
  uploadIcon: {
    fontSize: 30,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 14,
  },
  chooseFileButton: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  chooseFileText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 24,
  },
  thumbnailRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailRemoveText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  thumbnailAdd: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  thumbnailAddText: {
    fontSize: 22,
    color: '#AAAAAA',
    lineHeight: 26,
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 14,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  mapPlaceholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  useLocationButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  useLocationIcon: {
    fontSize: 13,
    color: '#333333',
  },
  useLocationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111111',
  },
  addressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },
  addressInput: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
  },
  searchIcon: {
    fontSize: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#111111',
    minHeight: 120,
    backgroundColor: '#FAFAFA',
  },
  charCount: {
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
  },
  infoIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#555555',
    lineHeight: 19,
  },
  requiredNote: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 8,
  },

  // ── Location picker ──
  locationMethodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  locationMethodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  locationMethodBtnActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  locationMethodText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444444',
  },
  locationMethodTextActive: {
    color: '#FFFFFF',
  },
  mapPickerContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  mapPicker: {
    height: 180,
    borderRadius: 14,
  },
  mapHint: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  selectedPin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordDisplay: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  coordText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '500',
  },
});