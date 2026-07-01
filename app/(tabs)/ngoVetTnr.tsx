import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Config } from '@/constants/Config';

// ---------------------------------------------
// Types
// ---------------------------------------------
type CaseStatus = 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Declined';
type FilterTab = 'All' | 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Declined';

interface ProgressStep {
  label: string;
  done: boolean;
  timestamp?: string;
}

interface TNRCase {
  id: string;
  caseNumber: string;
  status: CaseStatus;
  timeAgo: string;
  title: string;
  location: string;
  catCount: string;
  reporterName: string;
  reporterEmail: string;
  reporterMessage?: string;
  progressSteps?: ProgressStep[];
  completionNote?: string;
  declineReason?: string;
}

interface TNRReportCasesScreenProps {
  pendingCount?: number;
  acceptedCount?: number;
  declinedCount?: number;
  cases?: TNRCase[];
  onAcceptCase?: (caseId: string) => void;
  onDeclineCase?: (caseId: string) => void;
  onAutoUpdate?: (caseId: string) => void;
  onManualNote?: (caseId: string) => void;
  onNotifyReporter?: (caseId: string) => void;
  onOpenReporter?: (caseId: string) => void;
}

// ---------------------------------------------
// Mock data (matches the design reference)
// ---------------------------------------------
const defaultCases: TNRCase[] = [
  {
    id: '1',
    caseNumber: '#TNR-2026-041',
    status: 'Pending',
    timeAgo: '2 hrs ago',
    title: 'Stray Cat Colony',
    location: 'Jalan Ampang, KL',
    catCount: '~5 cats spotted',
    reporterName: 'Siti Rahmah',
    reporterEmail: 'siti.rahmah@email.com',
    reporterMessage:
      '"Cats near wet market, some injured. Need urgent trapping assistance."',
  },
  {
    id: '2',
    caseNumber: '#TNR-2026-037',
    status: 'In Progress',
    timeAgo: '1 day ago',
    title: 'Feral Cat Group',
    location: 'Taman Desa, KL',
    catCount: '~3 cats',
    reporterName: 'Ahmad Faiz',
    reporterEmail: 'a.faiz@email.com',
    progressSteps: [
      { label: 'Case Accepted', done: true, timestamp: '14 Jan 2026, 09:30 AM — Auto-notified reporter' },
      { label: 'Trap Set', done: true, timestamp: '14 Jan 2026, 02:00 PM — Auto-notified reporter' },
      { label: 'Neutering Scheduled', done: false, timestamp: 'Pending' },
      { label: 'Return to Site', done: false, timestamp: 'Pending' },
    ],
  },
  {
    id: '3',
    caseNumber: '#TNR-2026-029',
    status: 'Completed',
    timeAgo: '5 days ago',
    title: 'Alley Cat Community',
    location: 'Chow Kit, KL',
    catCount: '4 cats neutered',
    reporterName: 'Nurul Aina',
    reporterEmail: 'nurul.aina@email.com',
    completionNote: 'All 4 cats returned. Case closed on 10 Jan 2026.',
  },
  {
    id: '4',
    caseNumber: '#TNR-2026-035',
    status: 'Declined',
    timeAgo: '3 days ago',
    title: 'Roadside Stray',
    location: 'Kepong, KL',
    catCount: '~2 cats',
    reporterName: 'Lee Wei Ming',
    reporterEmail: '',
    declineReason: 'Outside service area. Reporter auto-notified.',
  },
];

const FILTER_TABS: FilterTab[] = ['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Declined'];

// ---------------------------------------------
// Helpers
// ---------------------------------------------
const getTimeAgo = (dateStr: string): string => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours} hrs ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const getStatusBadgeStyle = (status: CaseStatus) => {
  switch (status) {
    case 'Pending':
      return { bg: COLORS.black, text: COLORS.white };
    case 'In Progress':
      return { bg: COLORS.black, text: COLORS.white };
    case 'Completed':
      return { bg: COLORS.badgeBg, text: COLORS.textPrimary };
    case 'Declined':
      return { bg: COLORS.badgeBg, text: COLORS.textSecondary };
    case 'Accepted':
      return { bg: COLORS.black, text: COLORS.white };
    default:
      return { bg: COLORS.badgeBg, text: COLORS.textPrimary };
  }
};

// ---------------------------------------------
// Component
// ---------------------------------------------
const TNRReportCasesScreen: React.FC<TNRReportCasesScreenProps> = ({
  pendingCount: _pendingCount,
  acceptedCount: _acceptedCount,
  declinedCount: _declinedCount,
  cases = defaultCases,
  onAcceptCase,
  onDeclineCase,
  onAutoUpdate,
  onManualNote,
  onNotifyReporter,
  onOpenReporter,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveCases, setLiveCases] = useState<TNRCase[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [declinedCount, setDeclinedCount] = useState(0);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${Config.API_BASE_URL}/reports`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: TNRCase[] = data.map((r: any, idx: number) => ({
          id: r.id,
          caseNumber: `#TNR-${new Date(r.created_at).getFullYear()}-${String(idx + 1).padStart(3, '0')}`,
          status: r.status === 'open' ? 'Pending' : r.status === 'in_progress' ? 'In Progress' : r.status === 'completed' ? 'Completed' : r.status === 'declined' ? 'Declined' : 'Pending',
          timeAgo: getTimeAgo(r.created_at),
          title: r.notes || 'Stray Cat Report',
          location: r.address || 'Unknown location',
          catCount: r.activity_type || 'TNR',
          reporterName: 'Reporter',
          reporterEmail: '',
          reporterMessage: r.notes || undefined,
        }));
        setLiveCases(mapped);
        setPendingCount(mapped.filter(c => c.status === 'Pending').length);
        setAcceptedCount(mapped.filter(c => c.status === 'In Progress' || c.status === 'Accepted').length);
        setDeclinedCount(mapped.filter(c => c.status === 'Declined').length);
      } else {
        // No reports = empty state for new NGOs/Vets
        setLiveCases([]);
      }
    } catch {
      // No fallback mock data — new NGOs see empty
      setLiveCases([]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAccept = async (caseId: string) => {
    try {
      const orgName = (global as any).__pawven_name || 'NGO/Vet';
      const res = await fetch(`${Config.API_BASE_URL}/reports/${caseId}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToName: orgName }),
      });
      if (res.ok) {
        // Update local state
        setLiveCases(prev => prev.map(c =>
          c.id === caseId ? { ...c, status: 'In Progress' as CaseStatus } : c
        ));
        setPendingCount(p => Math.max(0, p - 1));
        setAcceptedCount(a => a + 1);
      }
    } catch {
      // Fallback: update locally
      setLiveCases(prev => prev.map(c =>
        c.id === caseId ? { ...c, status: 'In Progress' as CaseStatus } : c
      ));
    }
    onAcceptCase?.(caseId);
  };

  const handleDecline = async (caseId: string) => {
    try {
      const res = await fetch(`${Config.API_BASE_URL}/reports/${caseId}/decline`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setLiveCases(prev => prev.map(c =>
          c.id === caseId ? { ...c, status: 'Declined' as CaseStatus } : c
        ));
        setPendingCount(p => Math.max(0, p - 1));
        setDeclinedCount(d => d + 1);
      }
    } catch {
      setLiveCases(prev => prev.map(c =>
        c.id === caseId ? { ...c, status: 'Declined' as CaseStatus } : c
      ));
    }
    onDeclineCase?.(caseId);
  };

  const handleComplete = async (caseId: string) => {
    try {
      const res = await fetch(`${Config.API_BASE_URL}/reports/${caseId}/complete`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setLiveCases(prev => prev.map(c =>
          c.id === caseId ? { ...c, status: 'Completed' as CaseStatus } : c
        ));
        setAcceptedCount(a => Math.max(0, a - 1));
      }
    } catch {
      setLiveCases(prev => prev.map(c =>
        c.id === caseId ? { ...c, status: 'Completed' as CaseStatus } : c
      ));
    }
  };

  const filteredCases = liveCases.filter((c) => {
    const matchesTab = activeTab === 'All' || c.status === activeTab;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      c.location.toLowerCase().includes(q) ||
      c.reporterName.toLowerCase().includes(q) ||
      c.caseNumber.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Portal Badge Row */}
        <View style={styles.portalRow}>
          <View style={styles.portalBadge}>
            <View style={styles.portalAvatarIcon}>
              <Text style={styles.portalAvatarIconText}>👤</Text>
            </View>
            <Text style={styles.portalBadgeText}>NGO / Vet Portal</Text>
          </View>
          <Text style={styles.portalSubtext}>Manage TNR Reports</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>TNR Report Cases</Text>
        <Text style={styles.subtitle}>
          Review, accept or decline incoming trap-neuter-return cases
        </Text>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{acceptedCount}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{declinedCount}</Text>
            <Text style={styles.statLabel}>Declined</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, reporter, ID..."
            placeholderTextColor="#9a9a9a"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Case Cards */}
        {filteredCases.map((c) => {
          const badgeStyle = getStatusBadgeStyle(c.status);
          return (
            <View key={c.id} style={styles.caseCard}>
              {/* Card Header */}
              <View style={styles.caseHeaderRow}>
                <Text style={styles.caseNumber}>{c.caseNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
                    {c.status}
                  </Text>
                </View>
                <Text style={styles.timeAgo}>{c.timeAgo}</Text>
              </View>

              {/* Case Info Row */}
              <View style={styles.caseInfoRow}>
                <View style={styles.catPhotoPlaceholder}>
                  <Text style={styles.catPhotoLabel}>Cat Photo</Text>
                </View>
                <View style={styles.caseInfoText}>
                  <Text style={styles.caseTitle}>{c.title}</Text>
                  <View style={styles.caseDetailRow}>
                    <Text style={styles.caseDetailIcon}>📍</Text>
                    <Text style={styles.caseDetailText}>{c.location}</Text>
                  </View>
                  <View style={styles.caseDetailRow}>
                    <Text style={styles.caseDetailIcon}>🐾</Text>
                    <Text style={styles.caseDetailText}>{c.catCount}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Reporter Row */}
              <View style={styles.reporterRow}>
                <View style={styles.reporterAvatarCircle}>
                  <Text style={styles.reporterAvatarText}>👤</Text>
                </View>
                <View style={styles.reporterInfo}>
                  <Text style={styles.reporterName}>
                    Reported by: {c.reporterName}
                  </Text>
                  {!!c.reporterEmail && (
                    <Text style={styles.reporterEmail}>{c.reporterEmail}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.openReporterBtn}
                  onPress={() => onOpenReporter?.(c.id)}
                >
                  <Text style={styles.openReporterIcon}>⤴</Text>
                </TouchableOpacity>
              </View>

              {/* Status-specific content */}
              {c.status === 'Pending' && c.reporterMessage && (
                <>
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{c.reporterMessage}</Text>
                  </View>
                  <View style={styles.caseActionRow}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(c.id)}
                    >
                      <Text style={styles.acceptBtnIcon}>✓</Text>
                      <Text style={styles.acceptBtnText}>Accept Case</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      onPress={() => handleDecline(c.id)}
                    >
                      <Text style={styles.declineBtnIcon}>✕</Text>
                      <Text style={styles.declineBtnText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {c.status === 'In Progress' && c.progressSteps && (
                <>
                  <View style={styles.progressBox}>
                    <Text style={styles.progressBoxTitle}>TNR Progress Updates</Text>
                    {c.progressSteps.map((step, idx) => (
                      <View key={idx} style={styles.progressStepRow}>
                        <View
                          style={[
                            styles.progressStepIcon,
                            step.done && styles.progressStepIconDone,
                          ]}
                        >
                          {step.done ? (
                            <Text style={styles.progressStepCheck}>✓</Text>
                          ) : (
                            <View style={styles.progressStepDot} />
                          )}
                        </View>
                        <View style={styles.progressStepTextWrapper}>
                          <Text
                            style={[
                              styles.progressStepLabel,
                              !step.done && styles.progressStepLabelMuted,
                            ]}
                          >
                            {step.label}
                          </Text>
                          <Text
                            style={[
                              styles.progressStepTimestamp,
                              !step.done && styles.progressStepLabelMuted,
                            ]}
                          >
                            {step.timestamp}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.sendUpdateLabel}>Send Progress Update</Text>
                  <View style={styles.caseActionRow}>
                    <TouchableOpacity
                      style={styles.outlinePillBtn}
                      onPress={() => onAutoUpdate?.(c.id)}
                    >
                      <Text style={styles.outlinePillIcon}>⚡</Text>
                      <Text style={styles.outlinePillText}>Auto Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.outlinePillBtn}
                      onPress={() => onManualNote?.(c.id)}
                    >
                      <Text style={styles.outlinePillIcon}>✎</Text>
                      <Text style={styles.outlinePillText}>Manual Note</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.notifyReporterBtn}
                    onPress={() => onNotifyReporter?.(c.id)}
                  >
                    <Text style={styles.notifyReporterIcon}>➤</Text>
                    <Text style={styles.notifyReporterText}>Notify Reporter</Text>
                  </TouchableOpacity>
                </>
              )}

              {c.status === 'Completed' && c.completionNote && (
                <View style={styles.completedBox}>
                  <Text style={styles.completedBoxIcon}>✓</Text>
                  <Text style={styles.completedBoxText}>{c.completionNote}</Text>
                </View>
              )}

              {c.status === 'Declined' && c.declineReason && (
                <View style={styles.declinedBox}>
                  <Text style={styles.declinedBoxText}>
                    Reason: {c.declineReason}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------------------------------
// Colors
// ---------------------------------------------
const COLORS = {
  background: '#ffffff',
  textPrimary: '#111111',
  textSecondary: '#6b6b6b',
  textMuted: '#9a9a9a',
  border: '#e5e5e5',
  black: '#000000',
  white: '#ffffff',
  badgeBg: '#f0f0f0',
  cardBg: '#ffffff',
  sectionBg: '#fafafa',
  photoBg: '#d6d6d6',
};

// ---------------------------------------------
// Styles
// ---------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Portal row
  portalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  portalAvatarIcon: {
    marginRight: 6,
  },
  portalAvatarIconText: {
    fontSize: 12,
  },
  portalBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  portalSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },

  // Stat cards
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Filter tabs
  filterScroll: {
    marginBottom: 16,
  },
  filterScrollContent: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 8,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterPillActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  filterPillTextActive: {
    color: COLORS.white,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: COLORS.textMuted,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },

  // Case card
  caseCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  caseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.sectionBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  caseNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeAgo: {
    marginLeft: 'auto',
    fontSize: 12,
    color: COLORS.textMuted,
  },

  caseInfoRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  catPhotoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.photoBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catPhotoLabel: {
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  caseInfoText: {
    flex: 1,
    justifyContent: 'center',
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  caseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  caseDetailIcon: {
    fontSize: 12,
    marginRight: 5,
    color: COLORS.textSecondary,
  },
  caseDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 14,
    marginHorizontal: 14,
  },

  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  reporterAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reporterAvatarText: {
    fontSize: 16,
  },
  reporterInfo: {
    flex: 1,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reporterEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  openReporterBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openReporterIcon: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  // Pending - message + actions
  messageBox: {
    backgroundColor: COLORS.sectionBg,
    borderRadius: 12,
    marginHorizontal: 14,
    padding: 14,
    marginBottom: 14,
  },
  messageText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    lineHeight: 19,
  },
  caseActionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black,
    paddingVertical: 13,
    borderRadius: 24,
  },
  acceptBtnIcon: {
    color: COLORS.white,
    fontSize: 13,
    marginRight: 6,
  },
  acceptBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  declineBtnIcon: {
    fontSize: 13,
    marginRight: 6,
    color: COLORS.textPrimary,
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // In Progress
  progressBox: {
    backgroundColor: COLORS.sectionBg,
    borderRadius: 12,
    marginHorizontal: 14,
    padding: 14,
    marginBottom: 14,
  },
  progressBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  progressStepRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  progressStepIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  progressStepIconDone: {
    backgroundColor: COLORS.black,
  },
  progressStepCheck: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  progressStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.black,
  },
  progressStepTextWrapper: {
    flex: 1,
  },
  progressStepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressStepTimestamp: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  progressStepLabelMuted: {
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  sendUpdateLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: 14,
    marginBottom: 10,
  },
  outlinePillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.sectionBg,
    paddingVertical: 12,
    borderRadius: 22,
  },
  outlinePillIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  outlinePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  notifyReporterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 14,
    paddingVertical: 13,
    borderRadius: 24,
  },
  notifyReporterIcon: {
    color: COLORS.white,
    fontSize: 13,
    marginRight: 6,
  },
  notifyReporterText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Completed
  completedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.sectionBg,
    borderRadius: 12,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 14,
  },
  completedBoxIcon: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  completedBoxText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
  },

  // Declined
  declinedBox: {
    backgroundColor: COLORS.sectionBg,
    borderRadius: 12,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 14,
  },
  declinedBoxText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
});

export default TNRReportCasesScreen;