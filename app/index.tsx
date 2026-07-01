import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const PawIcon = () => <Text style={styles.appIconEmoji}>🐾</Text>;
const TNRIcon = () => <Image source={require('@/assets/icons/tnrIcon.jpg')} style={{ width: 20, height: 20, borderRadius: 10 }} />;
const NearbyIcon = () => <Image source={require('@/assets/icons/pinMarker.jpg')} style={{ width: 20, height: 20, borderRadius: 10 }} />;
const MapIcon = () => <Text style={styles.listIconEmoji}>🗺️</Text>;
const ReportIcon = () => <Image source={require('@/assets/icons/tnrIcon.jpg')} style={{ width: 20, height: 20, borderRadius: 10 }} />;
const CommunityIcon = () => <Text style={styles.listIconEmoji}>👥</Text>;

const HeroBubbles = () => (
  <>
    <View style={[styles.bubble, styles.bubbleTopLeft]} />
    <View style={[styles.bubble, styles.bubbleTopRight]} />
    <View style={[styles.bubble, styles.bubbleCenter]} />
  </>
);

const StatCard = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <View style={styles.statCard}>
    {icon}
    <View style={styles.statCardText}>
      <Text style={styles.statCardTitle}>{title}</Text>
      <Text style={styles.statCardSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

const FeatureRow = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <View style={styles.featureRow}>
    <View style={styles.featureIconWrap}>{icon}</View>
    <View style={styles.featureTextWrap}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

export default function OnboardingScreen() {
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);

  const goToPhone = () => {
    setSheetVisible(false);
    router.push("/(auth)/phone_screen");
  };

  const goToEmail = () => {
    setSheetVisible(false);
    router.push("/(auth)/email_screen");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.hero}>
          <HeroBubbles />

          <View style={styles.logoRow}>
            <View style={styles.appIconWrap}>
              <PawIcon />
            </View>
            <Text style={styles.appName}>Pawven</Text>
          </View>

          <Text style={styles.heroTagline}>
            Feed, track & connect — all for the strays in your community
          </Text>

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

        <View style={styles.body}>
          <Text style={styles.welcomeTitle}>Welcome to Pawven</Text>
          <Text style={styles.welcomeSubtitle}>
            Join thousands of cat lovers, NGOs and vets — {"\n"}working together
            for stray animals.
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

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => setSheetVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Get started</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            By continuing you agree to our{" "}
            <Text style={styles.legalLink}>Terms</Text> and{" "}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>

      <GetStartedSheet
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        onPhonePress={goToPhone}
        onEmailPress={goToEmail}
      />
    </SafeAreaView>
  );
}

type GetStartedSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  onPhonePress: () => void;
  onEmailPress: () => void;
};

function GetStartedSheet({
  visible,
  onDismiss,
  onPhonePress,
  onEmailPress,
}: GetStartedSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onDismiss} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetHeader}>
            <View style={styles.sheetPawWrap}>
              <Text style={styles.sheetPaw}>🐾</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close get started sheet"
              style={styles.sheetClose}
              onPress={onDismiss}
            >
              <Text style={styles.sheetCloseText}>×</Text>
            </Pressable>
          </View>

          <View style={{ gap: 16 }}>
            <Text style={styles.sheetTitle}>Get Started</Text>
            <Text style={styles.sheetDescription}>
              Join Pawven to report TNR activities, discover nearby helpers and
              protect animals in your community.
            </Text>

            <TouchableOpacity
              style={styles.sheetPrimaryButton}
              activeOpacity={0.85}
              onPress={onPhonePress}
            >
              <Text style={styles.sheetPrimaryButtonText}>
                Continue with Phone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetSecondaryButton}
              activeOpacity={0.8}
              onPress={onEmailPress}
            >
              <Text style={styles.sheetSecondaryButtonText}>
                Continue with Email
              </Text>
            </TouchableOpacity>

            <Text style={styles.sheetSignInHint}>
              Already have an account? Sign in with your phone or email above.
            </Text>
          </View>

          <Text style={styles.sheetLegal}>
            By continuing, you agree to Pawven's{" "}
            <Text style={styles.sheetLegalLink}>Terms of Use.</Text>
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const DARK = "#1C1C1E";
const DARK_CARD = "#2C2C2E";
const BUBBLE = "#2E2E30";
const WHITE = "#FFFFFF";
const GREY_TEXT = "#8E8E93";
const BODY_BG = "#FFFFFF";

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
  hero: {
    backgroundColor: DARK,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    overflow: "hidden",
  },
  bubble: {
    position: "absolute",
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
    left: "30%",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    zIndex: 1,
  },
  appIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  appIconEmoji: {
    fontSize: 22,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.3,
  },
  heroTagline: {
    fontSize: 15,
    color: "#AEAEB2",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    zIndex: 1,
    paddingHorizontal: 16,
  },
  statCardRow: {
    flexDirection: "row",
    gap: 12,
    zIndex: 1,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: WHITE,
  },
  statCardSubtitle: {
    fontSize: 11,
    color: GREY_TEXT,
    marginTop: 2,
  },
  body: {
    flex: 1,
    backgroundColor: BODY_BG,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: DARK,
    textAlign: "center",
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: GREY_TEXT,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 32,
  },
  featureList: {
    gap: 24,
    marginBottom: 36,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
    color: DARK,
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 13,
    color: GREY_TEXT,
    lineHeight: 19,
  },
  btnPrimary: {
    backgroundColor: DARK,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  legal: {
    fontSize: 11,
    color: GREY_TEXT,
    textAlign: "center",
    lineHeight: 16,
  },
  legalLink: {
    color: DARK,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },
  sheetBackdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "#FAF7F8",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 8,
    paddingBottom: 34,
    maxHeight: "60%",
  },
  sheetHandleWrap: {
    alignItems: "center",
    marginBottom: 28,
  },
  sheetHandle: {
    width: 58,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E6E2E4",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  sheetPawWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0ECEF",
  },
  sheetPaw: {
    fontSize: 25,
    lineHeight: 29,
  },
  sheetClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0ECEF",
  },
  sheetCloseText: {
    color: "#B8B5B7",
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "300",
  },
  sheetTitle: {
    color: DARK,
    fontSize: 30,
    fontWeight: "800",
  },
  sheetDescription: {
    color: "#7D7A7D",
    fontSize: 17,
    lineHeight: 25,
  },
  sheetPrimaryButton: {
    backgroundColor: DARK,
    borderRadius: 16,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetPrimaryButtonText: {
    color: WHITE,
    fontSize: 17,
    fontWeight: "700",
  },
  sheetSecondaryButton: {
    backgroundColor: "#F0EEF1",
    borderRadius: 16,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSecondaryButtonText: {
    color: DARK,
    fontSize: 17,
    fontWeight: "700",
  },
  sheetLegal: {
    color: "#A3A0A3",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 18,
  },
  sheetSignInHint: {
    color: "#7D7A7D",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  sheetLegalLink: {
    color: DARK,
    fontWeight: "500",
  },
});
