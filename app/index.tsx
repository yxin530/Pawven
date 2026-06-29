import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

// ─── Icon placeholders ───────────────────────────────────────────────────────
const PawIcon = () => <Text style={styles.appIconEmoji}>🐾</Text>;
const TNRIcon = () => <Text style={styles.featureIconEmoji}>🐱</Text>;
const NearbyIcon = () => <Text style={styles.featureIconEmoji}>📍</Text>;
const MapIcon = () => <Text style={styles.listIconEmoji}>🗺️</Text>;
const ReportIcon = () => <Text style={styles.listIconEmoji}>📋</Text>;
const CommunityIcon = () => <Text style={styles.listIconEmoji}>👥</Text>;

// ─── Hero bubble decorations ─────────────────────────────────────────────────
const HeroBubbles = () => (
  <>
    <View style={[styles.bubble, styles.bubbleTopLeft]} />
    <View style={[styles.bubble, styles.bubbleTopRight]} />
    <View style={[styles.bubble, styles.bubbleCenter]} />
  </>
);

// ─── Hero stat cards ──────────────────────────────────────────────────────────
const StatCard = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
  <View style={styles.statCard}>
    {icon}
    <View style={styles.statCardText}>
      <Text style={styles.statCardTitle}>{title}</Text>
      <Text style={styles.statCardSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

// ─── Feature list row ─────────────────────────────────────────────────────────
const FeatureRow = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <View style={styles.featureRow}>
    <View style={styles.featureIconWrap}>{icon}</View>
    <View style={styles.featureTextWrap}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/sign-up');
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero section ── */}
        <View style={styles.hero}>
          <HeroBubbles />

          {/* App logo + name */}
          <View style={styles.logoRow}>
            <View style={styles.appIconWrap}>
              <PawIcon />
            </View>
            <Text style={styles.appName}>Pawven</Text>
          </View>

          <Text style={styles.heroTagline}>
            Track, connect &amp; protect animals in your community
          </Text>

          {/* Stat cards */}
          <View style={styles.statCardRow}>
            <StatCard
              icon={<TNRIcon />}
              title="TNR Report"
              subtitle="Colony #42 · 3 new"
            />
            <StatCard
              icon={<NearbyIcon />}
              title="Nearby"
              subtitle="12 feeders · 0.3 km"
            />
          </View>
        </View>

        {/* ── Body section ── */}
        <View style={styles.body}>
          <Text style={styles.welcomeTitle}>Welcome to Pawven</Text>
          <Text style={styles.welcomeSubtitle}>
            Join thousands of volunteers, feeders &amp; NGOs{'\n'}working
            together for stray animals.
          </Text>

          <View style={styles.featureList}>
            <FeatureRow
              icon={<MapIcon />}
              title="Discover on Map"
              description="Find feeders, NGOs and active communities near you in real-time."
            />
            <FeatureRow
              icon={<ReportIcon />}
              title="TNR Reporting"
              description="Log trap-neuter-return activities and track colony progress."
            />
            <FeatureRow
              icon={<CommunityIcon />}
              title="Community Hub"
              description="Connect with NGOs, vets and local groups in your area."
            />
          </View>

          {/* CTA buttons */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleGetStarted}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Get started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleSignIn}
            activeOpacity={0.7}
          >
            <Text style={styles.btnSecondaryText}>Sign in</Text>
          </TouchableOpacity>

          {/* Legal footer */}
          <Text style={styles.legal}>
            By continuing you agree to our{' '}
            <Text style={styles.legalLink}>Terms</Text> and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK = '#1C1C1E';
const DARK_CARD = '#2C2C2E';
const BUBBLE = '#2E2E30';
const WHITE = '#FFFFFF';
const GREY_TEXT = '#8E8E93';
const BODY_BG = '#FFFFFF';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: DARK,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Decorative background bubbles
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: BUBBLE,
  },
  bubbleTopLeft: {
    width: 140,
    height: 140,
    top: -30,
    left: -40,
  },
  bubbleTopRight: {
    width: 110,
    height: 110,
    top: -20,
    right: -20,
  },
  bubbleCenter: {
    width: 160,
    height: 160,
    top: 20,
    left: '30%' as any,
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  appIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  appIconEmoji: {
    fontSize: 22,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: 0.3,
  },

  heroTagline: {
    fontSize: 15,
    color: '#AEAEB2',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    zIndex: 1,
    paddingHorizontal: 16,
  },

  // Stat cards
  statCardRow: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 1,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_CARD,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  featureIconEmoji: {
    fontSize: 18,
  },
  statCardText: {
    flex: 1,
  },
  statCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
  },
  statCardSubtitle: {
    fontSize: 11,
    color: GREY_TEXT,
    marginTop: 2,
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: {
    flex: 1,
    backgroundColor: BODY_BG,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
  },

  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: GREY_TEXT,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 32,
  },

  // Feature list
  featureList: {
    gap: 24,
    marginBottom: 36,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listIconEmoji: {
    fontSize: 18,
  },
  featureTextWrap: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 13,
    color: GREY_TEXT,
    lineHeight: 19,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnSecondaryText: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '500',
  },

  // Footer
  legal: {
    fontSize: 11,
    color: GREY_TEXT,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: {
    color: '#1C1C1E',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
