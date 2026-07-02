/**
 * SmartFeederApp.tsx
 * ----------------------------------------------------------------------------
 * React Native (TypeScript) implementation of the Smart Feeder UI/UX flow.
 *
 * Screens / components included:
 *  - P1  FeederHomeScreen        -> live feed, Feed / Report / Details actions,
 *                                    "Dispense Kibbles" sheet with per-gram pricing
 *  - P4  PaymentSheet            -> shown after "Dispense Now", multiple payment
 *                                    methods (Apple Pay, Touch 'n Go eWallet,
 *                                    PayPal, TrueMoney, card via Stripe test mode)
 *  - --  OrderConfirmationCard   -> success state with confetti + thank-you copy
 *  - --  PaymentErrorCard        -> failure state, feeder does NOT dispense
 *  - P2  DetailsSheet (viewer)   -> read-only device details, no manage button
 *  - P2  DetailsSheet (owner)    -> same layout + "Manage Feeder Settings"
 *  - P3  ReportIssueSheet        -> issue type + optional notes
 *
 * Notes on integration:
 *  - Payment methods are wired to call `createPaymentIntent()` which is a thin
 *    wrapper you should point at your backend endpoint that creates a Stripe
 *    PaymentIntent (test mode). This file does not import the Stripe SDK
 *    directly so it can be dropped into a project regardless of navigation
 *    stack; wire `confirmPayment` to `@stripe/stripe-react-native` in your
 *    app's payment layer (see comment inside `PaymentSheet`).
 *  - No external icon libraries are required; simple glyphs are used to stay
 *    dependency-free. Swap the <Icon glyph="…" /> calls for
 *    react-native-vector-icons / lucide-react-native if you already use one.
 *  - Confetti is implemented with Animated (no external lib) so it works out
 *    of the box. Swap for `react-native-confetti-cannon` if preferred.
 * ----------------------------------------------------------------------------
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

/* ============================================================================
 * THEME
 * ==========================================================================*/

const theme = {
  colors: {
    bg: '#FFFFFF',
    surface: '#F7F7F8',
    ink: '#101012',
    inkSoft: '#6B6B70',
    border: '#E7E7EA',
    black: '#0B0B0C',
    white: '#FFFFFF',
    success: '#1FAA59',
    danger: '#E0483E',
    warn: '#F5A623',
  },
  radius: { sm: 10, md: 16, lg: 24, pill: 999 },
  spacing: (n: number) => n * 4,
};

const Icon = ({ glyph, size = 18, color = theme.colors.ink }: { glyph: string; size?: number; color?: string }) => (
  <Text style={{ fontSize: size, color, includeFontPadding: false }}>{glyph}</Text>
);

/* ============================================================================
 * PRICING (per-gram cost) — single source of truth
 * ==========================================================================*/

export type PortionKey = 'small' | 'medium' | 'large';

export const PORTIONS: Record<
  PortionKey,
  { grams: number; label: string; priceUsd: number }
> = {
  small: { grams: 20, label: 'Small', priceUsd: 0.99 },
  medium: { grams: 50, label: 'Medium', priceUsd: 2.59 },
  large: { grams: 100, label: 'Large', priceUsd: 4.89 },
};

const formatUsd = (n: number) => `$${n.toFixed(2)}`;

/* ============================================================================
 * DEVICE DETAILS TYPE (needed by FeederHomeScreen and DetailsSheet)
 * ==========================================================================*/

type DeviceDetails = {
  name: string;
  deviceId: string;
  online: boolean;
  location: string;
  firmware: string;
  lastRefill: string;
  nextSchedule: string;
};
/* ============================================================================
 * GENERIC BOTTOM SHEET
 * ==========================================================================*/

const { height: SCREEN_H } = Dimensions.get('window');

const BottomSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightRatio?: number;
}> = ({ visible, onClose, children, maxHeightRatio = 0.88 }) => {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(SCREEN_H);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_H,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheetContainer,
          { maxHeight: SCREEN_H * maxHeightRatio, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.sheetHandle} />
        {children}
      </Animated.View>
    </Modal>
  );
};

/* ============================================================================
 * P1 — FEEDER HOME SCREEN
 * ==========================================================================*/

export const FeederHomeScreen: React.FC<{
  isOwner?: boolean;
}> = ({ isOwner = false }) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string; kibbleLevel?: string; status?: string; address?: string }>();

  const feederName = params.name || "Buddy's Feeder";
  const feederId = params.id || 'FS2-00342';
  const feederStatus = params.status || 'online';
  const feederAddress = params.address || 'Kampung Baru, Kuala Lumpur, Malaysia';
  const kibbleLevel = params.kibbleLevel ? parseInt(params.kibbleLevel, 10) : 72;

  const [dispenseOpen, setDispenseOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [selected, setSelected] = useState<PortionKey>('small');
  const [tankRemaining] = useState(Math.round(kibbleLevel * 10));
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selectedPortion = PORTIONS[selected];

  // Build device details from route params
  const deviceDetails: DeviceDetails = {
    name: feederName,
    deviceId: feederId,
    online: feederStatus === 'online',
    location: feederAddress,
    firmware: 'v3.2.1',
    lastRefill: '12 Jan 2026',
    nextSchedule: 'Today · 12:00',
  };

  const handleDispenseNow = () => {
    // Close the portion-selection sheet, open the payment sheet (P4 content).
    setDispenseOpen(false);
    setPaymentOpen(true);
  };

  const handlePaymentResult = (success: boolean) => {
    setPaymentOpen(false);
    if (success) {
      // Only on confirmed payment do we "release" kibbles.
      setConfirmOpen(true);
    } else {
      setErrorOpen(true);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Back navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{feederName}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing(10) }}>
        {/* Live camera feed */}
        <View style={styles.cameraCard}>
          <View style={styles.cameraTopRow}>
            <View style={styles.pillDark}>
              <Icon glyph="📶" size={12} color={theme.colors.white} />
              <Text style={styles.pillDarkText}>HD 1080P</Text>
            </View>
            <View style={styles.pillDark}>
              <Icon glyph="🕒" size={12} color={theme.colors.white} />
              <Text style={styles.pillDarkText}>08:42:15</Text>
            </View>
          </View>

          <View style={styles.cameraCenter}>
            <Icon glyph="🎥" size={40} color="#8C8C90" />
            <Text style={styles.cameraTitle}>Live Camera Feed</Text>
            <Text style={styles.cameraSubtitle}>Feeder Cam · {feederName}</Text>
          </View>

          <View style={styles.cameraBottomRow}>
            <View style={{ width: 10 }} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.roundIconBtn} onPress={() => setIsFullscreen(true)}>
                <Icon glyph="⛶" size={16} color={theme.colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roundIconBtn, !isMuted && styles.roundIconBtnActive]} onPress={() => setIsMuted(!isMuted)}>
                <Icon glyph={isMuted ? '🔇' : '🔊'} size={16} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDark]} onPress={() => setDispenseOpen(true)}>
            <Icon glyph="🥣" size={20} color={theme.colors.white} />
            <Text style={styles.actionBtnDarkText}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setReportOpen(true)}>
            <Icon glyph="⚠️" size={20} />
            <Text style={styles.actionBtnText}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setDetailsOpen(true)}>
            <Icon glyph="ⓘ" size={20} />
            <Text style={styles.actionBtnText}>Details</Text>
          </TouchableOpacity>
        </View>

        {/* Inline dispense panel preview (also reachable via Feed button) */}
        <View style={styles.dispensePreviewCard}>
          <View style={styles.dispensePreviewHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon glyph="🥣" size={16} color={theme.colors.white} />
              <Text style={styles.dispensePreviewTitle}>Dispense Kibbles</Text>
            </View>
            <Text style={styles.dispensePreviewSub}>Tap amount to select</Text>
          </View>
          <View style={{ padding: theme.spacing(4) }}>
            <PortionPicker selected={selected} onSelect={setSelected} />
            <SelectedSummary portion={selectedPortion} remaining={tankRemaining} />
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setDispenseOpen(true)}>
              <Icon glyph="▶" size={16} color={theme.colors.white} />
              <Text style={styles.primaryBtnText}>Dispense Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen video modal */}
      <Modal visible={isFullscreen} animationType="fade" onRequestClose={() => setIsFullscreen(false)}>
        <View style={styles.fullscreenContainer}>
          <View style={styles.fullscreenPlaceholder}>
            <Icon glyph="🎥" size={60} color="#8C8C90" />
            <Text style={styles.fullscreenText}>Live Stream</Text>
            <Text style={styles.fullscreenSubtext}>No hardware connected — video feed will appear here when a camera is paired.</Text>
          </View>
          <TouchableOpacity style={styles.fullscreenCloseBtn} onPress={() => setIsFullscreen(false)}>
            <Text style={styles.fullscreenCloseBtnText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fullscreenSoundBtn, !isMuted && styles.roundIconBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Icon glyph={isMuted ? '🔇' : '🔊'} size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* --- Sheets --- */}
      <BottomSheet visible={dispenseOpen} onClose={() => setDispenseOpen(false)}>
        <DispenseSheetContent
          selected={selected}
          onSelect={setSelected}
          remaining={tankRemaining}
          onDispenseNow={handleDispenseNow}
        />
      </BottomSheet>

      <BottomSheet visible={paymentOpen} onClose={() => setPaymentOpen(false)}>
        <PaymentSheet
          amountUsd={selectedPortion.priceUsd}
          portionLabel={`${selectedPortion.grams}g · ${selectedPortion.label} Portion`}
          onResult={handlePaymentResult}
        />
      </BottomSheet>

      <ConfirmationModal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        portion={selectedPortion}
      />

      <ErrorModal visible={errorOpen} onClose={() => setErrorOpen(false)} />

      <BottomSheet visible={reportOpen} onClose={() => setReportOpen(false)}>
        <ReportIssueSheet onClose={() => setReportOpen(false)} />
      </BottomSheet>

      <BottomSheet visible={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <DetailsSheet isOwner={isOwner} device={deviceDetails} onClose={() => setDetailsOpen(false)} />
      </BottomSheet>
    </SafeAreaView>
  );
};

/* ---- Portion picker (shared by preview card + sheet) --------------------- */

const PortionPicker: React.FC<{
  selected: PortionKey;
  onSelect: (k: PortionKey) => void;
}> = ({ selected, onSelect }) => (
  <View>
    <Text style={styles.sectionLabel}>SELECT PORTION</Text>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {(Object.keys(PORTIONS) as PortionKey[]).map((key) => {
        const p = PORTIONS[key];
        const active = key === selected;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.portionCard, active && styles.portionCardActive]}
            onPress={() => onSelect(key)}
          >
            <View style={[styles.portionDot, active && styles.portionDotActive]} />
            <Text style={[styles.portionGrams, active && styles.portionTextActive]}>{p.grams}g</Text>
            <Text style={[styles.portionLabel, active && styles.portionTextActiveSoft]}>{p.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
    {/* Requested pricing line */}
    <Text style={styles.priceLine}>
      {Object.values(PORTIONS)
        .map((p) => `${p.grams}g = ${formatUsd(p.priceUsd)}`)
        .join('  ·  ')}
    </Text>
  </View>
);

const SelectedSummary: React.FC<{ portion: typeof PORTIONS[PortionKey]; remaining: number }> = ({
  portion,
  remaining,
}) => (
  <View style={styles.summaryBox}>
    <View>
      <Text style={styles.summaryLabel}>Selected</Text>
      <Text style={styles.summaryValue}>
        {portion.grams}g · {portion.label} Portion
      </Text>
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={styles.summaryLabel}>Remaining</Text>
      <Text style={styles.summaryValue}>{remaining}g in tank</Text>
    </View>
  </View>
);

const DispenseSheetContent: React.FC<{
  selected: PortionKey;
  onSelect: (k: PortionKey) => void;
  remaining: number;
  onDispenseNow: () => void;
}> = ({ selected, onSelect, remaining, onDispenseNow }) => {
  const portion = PORTIONS[selected];
  return (
    <View>
      <View style={styles.sheetHeaderDark}>
        <Icon glyph="🥣" size={16} color={theme.colors.ink} />
        <Text style={styles.sheetHeaderDarkTitle}>Dispense Kibbles</Text>
        <Text style={styles.sheetHeaderDarkSub}>Tap amount to select</Text>
      </View>
      <View style={{ padding: theme.spacing(4) }}>
        <PortionPicker selected={selected} onSelect={onSelect} />
        <SelectedSummary portion={portion} remaining={remaining} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatUsd(portion.priceUsd)}</Text>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={onDispenseNow}>
          <Icon glyph="▶" size={16} color={theme.colors.white} />
          <Text style={styles.primaryBtnText}>Dispense Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ============================================================================
 * P4 — PAYMENT SHEET (multiple methods, Stripe test-mode ready)
 * ==========================================================================*/

type PaymentMethodKey = 'apple_pay' | 'tng' | 'paypal' | 'truemoney' | 'card';

const PAYMENT_METHODS: { key: PaymentMethodKey; label: string; glyph: string; icon?: any }[] = [
  { key: 'apple_pay', label: 'Apple Pay', glyph: '' },
  { key: 'tng', label: "Touch 'n Go eWallet", glyph: '', icon: require('@/assets/icons/tng.png') },
  { key: 'paypal', label: 'PayPal', glyph: '', icon: require('@/assets/icons/paypal.png') },
  { key: 'truemoney', label: 'TrueMoney Wallet', glyph: '', icon: require('@/assets/icons/truemoney.png') },
];

/**
 * Stub for creating a Stripe PaymentIntent in TEST MODE.
 * Replace the body with a fetch() call to your backend, e.g.:
 *
 *   const res = await fetch(`${API_BASE}/create-payment-intent`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ amount: Math.round(amountUsd * 100), currency: 'usd' }),
 *   });
 *   const { clientSecret } = await res.json();
 *   return clientSecret;
 *
 * Then use `@stripe/stripe-react-native`'s `useStripe().confirmPayment(clientSecret, ...)`
 * for card payments, or the respective wallet SDK for Apple Pay / TNG / PayPal / TrueMoney.
 */
async function createPaymentIntent(amountUsd: number): Promise<{ clientSecret: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { clientSecret: 'pi_test_client_secret_stub' };
}

/** Stub that simulates confirming payment against Stripe test mode. */
async function confirmPayment(
  method: PaymentMethodKey,
  clientSecret: string,
  cardDetails?: { number: string; expiry: string; cvc: string }
): Promise<{ success: boolean; message?: string }> {
  await new Promise((r) => setTimeout(r, 900));
  // TEST CARD RULES (Stripe test mode conventions):
  //   4242 4242 4242 4242 -> success
  //   4000 0000 0000 0002 -> card declined
  if (method === 'card' && cardDetails) {
    const digits = cardDetails.number.replace(/\s/g, '');
    if (digits === '4000000000000002') {
      return { success: false, message: 'Your card was declined.' };
    }
    if (digits && digits !== '4242424242424242') {
      return { success: false, message: 'Payment could not be verified.' };
    }
  }
  return { success: true };
}

export const PaymentSheet: React.FC<{
  amountUsd: number;
  portionLabel: string;
  onResult: (success: boolean, message?: string) => void;
}> = ({ amountUsd, portionLabel, onResult }) => {
  const [processing, setProcessing] = useState<PaymentMethodKey | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const pay = async (method: PaymentMethodKey) => {
    setProcessing(method);
    try {
      const { clientSecret } = await createPaymentIntent(amountUsd);
      const result = await confirmPayment(
        method,
        clientSecret,
        method === 'card' ? { number: cardNumber, expiry, cvc } : undefined
      );
      onResult(result.success, result.message);
    } catch (e) {
      onResult(false, 'Something went wrong. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing(5) }} keyboardShouldPersistTaps="handled">
      <View style={styles.dealBanner}>
        <Text style={styles.dealBannerText}>🐾 Confirm & pay to dispense</Text>
      </View>

      <Text style={styles.paymentTitle}>Add card details</Text>
      <Text style={styles.paymentSubtitle}>
        {portionLabel} · Total {formatUsd(amountUsd)}
      </Text>

      <TouchableOpacity
        style={[styles.methodBtn, styles.applePayBtn]}
        onPress={() => pay('apple_pay')}
        disabled={processing !== null}
      >
        {processing === 'apple_pay' ? (
          <Text style={styles.applePayText}>Processing…</Text>
        ) : (
          <Text style={styles.applePayText}> Apple Pay</Text>
        )}
      </TouchableOpacity>

      <View style={styles.orDivider}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.orLine} />
      </View>

      {/* Additional wallet options */}
      {PAYMENT_METHODS.filter((m) => m.key !== 'apple_pay').map((m) => (
        <TouchableOpacity
          key={m.key}
          style={styles.methodBtn}
          onPress={() => pay(m.key)}
          disabled={processing !== null}
        >
          {m.icon ? (
            <Image source={m.icon} style={{ width: 20, height: 20 }} resizeMode="contain" />
          ) : (
            <Icon glyph={m.glyph} size={18} />
          )}
          <Text style={styles.methodBtnText}>
            {processing === m.key ? 'Processing…' : m.label}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.orDivider}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>or pay by card</Text>
        <View style={styles.orLine} />
      </View>

      {/* Card entry (Stripe test mode) */}
      <View style={styles.cardFieldBox}>
        <View style={styles.cardFieldRow}>
          <Image source={require('@/assets/icons/creditCard.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
          <TextInput
            style={styles.cardInput}
            placeholder="Card number (test: 4242 4242 4242 4242)"
            placeholderTextColor="#B4B4B8"
            keyboardType="number-pad"
            value={cardNumber}
            onChangeText={setCardNumber}
          />
        </View>
        <View style={styles.cardFieldDivider} />
        <View style={{ flexDirection: 'row' }}>
          <View style={[styles.cardFieldRow, { flex: 1 }]}>
            <Icon glyph="📅" size={16} color={theme.colors.inkSoft} />
            <TextInput
              style={styles.cardInput}
              placeholder="MM/YY"
              placeholderTextColor="#B4B4B8"
              value={expiry}
              onChangeText={setExpiry}
            />
          </View>
          <View style={styles.cardFieldVDivider} />
          <View style={[styles.cardFieldRow, { flex: 1 }]}>
            <Image source={require('@/assets/icons/cvc.png')} style={{ width: 18, height: 18 }} resizeMode="contain" />
            <TextInput
              style={styles.cardInput}
              placeholder="CVC"
              placeholderTextColor="#B4B4B8"
              keyboardType="number-pad"
              secureTextEntry
              value={cvc}
              onChangeText={setCvc}
            />
          </View>
        </View>
      </View>

      <Text style={styles.stripeNote}>
        Payments are processed securely via Stripe (test mode). We store your card details for
        smooth and secure future purchases.
      </Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => pay('card')}
        disabled={processing !== null}
      >
        <Text style={styles.primaryBtnText}>
          {processing === 'card' ? 'Processing…' : `Pay ${formatUsd(amountUsd)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

/* ============================================================================
 * ORDER CONFIRMATION CARD (with confetti) + PAYMENT ERROR CARD
 * ==========================================================================*/

const ConfettiPiece: React.FC<{ index: number }> = ({ index }) => {
  const translateY = useRef(new Animated.Value(-40)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const left = useMemo(() => Math.random() * Dimensions.get('window').width, []);
  const color = useMemo(() => {
    const palette = ['#0B0B0C', '#E0483E', '#F5A623', '#1FAA59', '#6B6B70'];
    return palette[index % palette.length];
  }, [index]);
  const size = useMemo(() => 6 + Math.random() * 6, []);
  const duration = useMemo(() => 2200 + Math.random() * 900, []);
  const drift = useMemo(() => (Math.random() - 0.5) * 120, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 420,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: drift,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 4,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration,
        delay: duration * 0.6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 4], outputRange: ['0deg', '1440deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -20,
        left,
        width: size,
        height: size * 1.6,
        backgroundColor: color,
        borderRadius: 2,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: spin }],
      }}
    />
  );
};

const Confetti: React.FC<{ active: boolean; pieces?: number }> = ({ active, pieces = 60 }) => {
  if (!active) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: pieces }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
};

export const ConfirmationModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  portion: typeof PORTIONS[PortionKey];
}> = ({ visible, onClose, portion }) => {
  const [confettiActive, setConfettiActive] = useState(false);
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setConfettiActive(true);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      const t = setTimeout(() => setConfettiActive(false), 3000);
      return () => clearTimeout(t);
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.centerBackdrop}>
        <Confetti active={confettiActive} />
        <Animated.View style={[styles.confirmCard, { opacity, transform: [{ scale }] }]}>
          {/* Success image */}
          <Image
            source={require('@/assets/images/tqCat.png')}
            style={styles.confirmImage}
          />
          <Text style={styles.confirmTitle}>Order confirmed!</Text>
          <Text style={styles.confirmBody}>
            {portion.grams}g of kibbles ({portion.label} Portion) is on its way to the bowl.
          </Text>
          <Text style={styles.confirmThanks}>
            Thank you for feeding with us — the kitties say meow! 🐱
          </Text>

          <View style={styles.confirmDivider} />

          <View style={styles.confirmRow}>
            <Text style={styles.confirmRowLabel}>Amount paid</Text>
            <Text style={styles.confirmRowValue}>{formatUsd(portion.priceUsd)}</Text>
          </View>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmRowLabel}>Portion</Text>
            <Text style={styles.confirmRowValue}>{portion.grams}g · {portion.label}</Text>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, { paddingVertical: 18, marginTop: theme.spacing(5) }]} onPress={onClose}>
            <Text style={[styles.primaryBtnText, { fontSize: 17 }]}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const ErrorModal: React.FC<{ visible: boolean; onClose: () => void; message?: string }> = ({
  visible,
  onClose,
  message,
}) => {
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.centerBackdrop}>
        <View style={styles.errorCard}>
          <View style={styles.errorIconCircle}>
            <Icon glyph="✕" size={28} color={theme.colors.white} />
          </View>
          <Text style={styles.confirmTitle}>Payment failed</Text>
          <Text style={styles.confirmBody}>
            {message || "We couldn't process your payment."} The feeder has not dispensed any kibbles
            and you have not been charged.
          </Text>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.danger }]} onPress={onClose}>
            <Text style={styles.primaryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/* ============================================================================
 * P2 — DETAILS SHEET (viewer + owner variants)
 * ==========================================================================*/

const DEMO_DEVICE: DeviceDetails = {
  name: "Buddy's Feeder",
  deviceId: 'FS2-00342',
  online: true,
  location: 'Kampung Baru, Kuala Lumpur, Malaysia',
  firmware: 'v3.2.1',
  lastRefill: '12 Jan 2026',
  nextSchedule: 'Today · 12:00',
};

const DetailRow: React.FC<{ glyph: string; label: string; value: string; valueColor?: string }> = ({
  glyph,
  label,
  value,
  valueColor,
}) => (
  <View style={styles.detailRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon glyph={glyph} size={16} color={theme.colors.inkSoft} />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={[styles.detailValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

/**
 * Viewer variant: read-only, no "Manage Feeder Settings" (non-owners can't
 * manage a feeder they don't own).
 * Owner variant: identical layout + management action wired to onManage.
 */
export const DetailsSheet: React.FC<{
  isOwner?: boolean;
  device?: DeviceDetails;
  onClose: () => void;
  onManage?: () => void;
}> = ({ isOwner = false, device = DEMO_DEVICE, onClose, onManage }) => {
  return (
    <View>
      <View style={styles.sheetHeaderDark}>
        <Icon glyph="ⓘ" size={16} color={theme.colors.ink} />
        <Text style={styles.sheetHeaderDarkTitle}>Smart Feeder Details</Text>
      </View>
      <View style={{ paddingHorizontal: theme.spacing(4) }}>
        <DetailRow glyph="🏷️" label="Device Name" value={device.name} />
        <DetailRow glyph="|||" label="Device ID" value={device.deviceId} />
        <DetailRow
          glyph="📶"
          label="Connection"
          value={device.online ? '● Online' : '● Offline'}
          valueColor={device.online ? theme.colors.success : theme.colors.inkSoft}
        />
        <DetailRow glyph="📍" label="Location" value={device.location} />
        <DetailRow glyph="🧩" label="Firmware" value={device.firmware} />
        <DetailRow glyph="🗓️" label="Last Refill" value={device.lastRefill} />
        <DetailRow glyph="📋" label="Next Schedule" value={device.nextSchedule} />

        {isOwner && (
          <TouchableOpacity style={styles.outlineBtn} onPress={onManage}>
            <Icon glyph="⚙️" size={16} />
            <Text style={styles.outlineBtnText}>Manage Feeder Settings</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: theme.spacing(6) }} />
      </View>
    </View>
  );
};

/**
 * Convenience wrapper screens if you want two distinct routes instead of a
 * single `isOwner` prop.
 */
export const DetailsScreenViewer: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <DetailsSheet isOwner={false} onClose={onClose} />
);

export const DetailsScreenOwner: React.FC<{ onClose: () => void; onManage: () => void }> = ({
  onClose,
  onManage,
}) => <DetailsSheet isOwner={true} onClose={onClose} onManage={onManage} />;

/* ============================================================================
 * P3 — REPORT ISSUE SHEET
 * ==========================================================================*/

type IssueKey = 'camera' | 'jam' | 'connectivity' | 'other';

const ISSUES: { key: IssueKey; label: string; glyph: string }[] = [
  { key: 'camera', label: 'Camera Issue', glyph: '🚫🎥' },
  { key: 'jam', label: 'Feeder Jam', glyph: '🥣' },
  { key: 'connectivity', label: 'Connectivity', glyph: '📶' },
  { key: 'other', label: 'Other Issue', glyph: '❗' },
];

export const ReportIssueSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selected, setSelected] = useState<IssueKey>('other');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    onClose();
  };

  return (
    <View>
      <View style={styles.sheetHeaderDark}>
        <Icon glyph="⚠️" size={16} color={theme.colors.ink} />
        <Text style={styles.sheetHeaderDarkTitle}>Report an Issue</Text>
      </View>
      <View style={{ padding: theme.spacing(4) }}>
        <Text style={styles.reportPrompt}>
          Select the issue type you observed from the live stream or feeder:
        </Text>
        <View style={styles.issueGrid}>
          {ISSUES.map((issue) => {
            const active = issue.key === selected;
            return (
              <TouchableOpacity
                key={issue.key}
                style={[styles.issueCard, active && styles.issueCardActive]}
                onPress={() => setSelected(issue.key)}
              >
                <Icon glyph={issue.glyph} size={16} color={active ? theme.colors.white : theme.colors.ink} />
                <Text style={[styles.issueLabel, active && { color: theme.colors.white }]}>
                  {issue.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>
          ADDITIONAL NOTES <Text style={{ color: theme.colors.inkSoft, fontWeight: '400' }}>(optional)</Text>
        </Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Describe the issue you're seeing…"
          placeholderTextColor="#B4B4B8"
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={submit} disabled={submitting}>
          <Icon glyph="➤" size={16} color={theme.colors.white} />
          <Text style={styles.primaryBtnText}>{submitting ? 'Submitting…' : 'Submit Report'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ============================================================================
 * STYLES
 * ==========================================================================*/

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },

  /* Navigation */
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 18, color: theme.colors.ink },
  navTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.ink },

  /* Camera card */
  cameraCard: {
    margin: theme.spacing(4),
    backgroundColor: '#1B1B1D',
    borderRadius: theme.radius.lg,
    padding: theme.spacing(4),
    height: 300,
    justifyContent: 'space-between',
  },
  cameraTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cameraCenter: { alignItems: 'center', gap: 6 },
  cameraTitle: { color: theme.colors.white, fontSize: 18, fontWeight: '600' },
  cameraSubtitle: { color: '#9A9A9E', fontSize: 13 },
  cameraBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pillDark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  pillDarkText: { color: theme.colors.white, fontSize: 12, fontWeight: '600' },
  roundIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundIconBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  /* Fullscreen video */
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenPlaceholder: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  fullscreenText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  fullscreenSubtext: {
    color: '#9A9A9E',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fullscreenCloseBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenCloseBtnText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  fullscreenSoundBtn: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Action row */
  actionRow: { flexDirection: 'row', gap: 10, paddingHorizontal: theme.spacing(4) },
  actionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(4),
    alignItems: 'center',
    gap: 8,
  },
  actionBtnDark: { backgroundColor: theme.colors.black, borderColor: theme.colors.black },
  actionBtnText: { fontWeight: '600', color: theme.colors.ink },
  actionBtnDarkText: { fontWeight: '600', color: theme.colors.white },

  /* Dispense preview card */
  dispensePreviewCard: {
    margin: theme.spacing(4),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  dispensePreviewHeader: {
    backgroundColor: theme.colors.black,
    padding: theme.spacing(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dispensePreviewTitle: { color: theme.colors.white, fontWeight: '700', fontSize: 15 },
  dispensePreviewSub: { color: '#B4B4B8', fontSize: 12 },

  /* Sheets shared */
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingBottom: theme.spacing(6),
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeaderDark: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sheetHeaderDarkTitle: { color: theme.colors.ink, fontWeight: '700', fontSize: 16, flex: 1 },
  sheetHeaderDarkSub: { color: theme.colors.inkSoft, fontSize: 12 },

  /* Portion picker */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.inkSoft,
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 6,
  },
  portionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(4),
    alignItems: 'center',
    gap: 4,
  },
  portionCardActive: { backgroundColor: theme.colors.black, borderColor: theme.colors.black },
  portionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.ink,
    marginBottom: 4,
  },
  portionDotActive: { borderColor: theme.colors.white, backgroundColor: theme.colors.white },
  portionGrams: { fontSize: 18, fontWeight: '700', color: theme.colors.ink },
  portionLabel: { fontSize: 12, color: theme.colors.inkSoft },
  portionTextActive: { color: theme.colors.white },
  portionTextActiveSoft: { color: '#C9C9CC' },
  priceLine: {
    marginTop: 10,
    fontSize: 12,
    color: theme.colors.inkSoft,
    textAlign: 'center',
  },

  summaryBox: {
    marginTop: theme.spacing(4),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: { fontSize: 12, color: theme.colors.inkSoft },
  summaryValue: { fontSize: 14, fontWeight: '700', color: theme.colors.ink, marginTop: 2 },

  totalRow: {
    marginTop: theme.spacing(3),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  totalLabel: { fontSize: 14, color: theme.colors.inkSoft },
  totalValue: { fontSize: 18, fontWeight: '800', color: theme.colors.ink },

  primaryBtn: {
    marginTop: theme.spacing(4),
    backgroundColor: theme.colors.black,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: theme.colors.white, fontWeight: '700', fontSize: 15 },

  outlineBtn: {
    marginTop: theme.spacing(4),
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineBtnText: { fontWeight: '700', color: theme.colors.ink },

  /* Details rows */
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(3.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: { fontSize: 14, color: theme.colors.ink },
  detailValue: { fontSize: 14, fontWeight: '600', color: theme.colors.ink },

  /* Report sheet */
  reportPrompt: { fontSize: 14, color: theme.colors.ink, marginBottom: theme.spacing(4) },
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: theme.spacing(4) },
  issueCard: {
    width: '47%',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(4),
    paddingHorizontal: theme.spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  issueCardActive: { backgroundColor: theme.colors.black, borderColor: theme.colors.black },
  issueLabel: { fontWeight: '600', color: theme.colors.ink },
  notesInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(4),
    minHeight: 90,
    fontSize: 14,
    color: theme.colors.ink,
    textAlignVertical: 'top',
  },

  /* Payment sheet */
  dealBanner: {
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: theme.spacing(3),
  },
  dealBannerText: { fontSize: 12, fontWeight: '600', color: theme.colors.ink },
  paymentTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', color: theme.colors.ink },
  paymentSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: theme.colors.inkSoft,
    marginTop: 4,
    marginBottom: theme.spacing(4),
  },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(4),
    marginBottom: 10,
  },
  applePayBtn: { backgroundColor: theme.colors.black, borderColor: theme.colors.black },
  applePayText: { color: theme.colors.white, fontWeight: '700', fontSize: 15 },
  methodBtnText: { fontWeight: '600', color: theme.colors.ink, fontSize: 14 },
  orDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: theme.spacing(3) },
  orLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  orText: { color: theme.colors.inkSoft, fontSize: 12 },

  cardFieldBox: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  cardFieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: theme.spacing(3.5) },
  cardFieldDivider: { height: 1, backgroundColor: theme.colors.border },
  cardFieldVDivider: { width: 1, backgroundColor: theme.colors.border },
  cardInput: { flex: 1, fontSize: 14, color: theme.colors.ink, padding: 0 },
  stripeNote: { fontSize: 11, color: theme.colors.inkSoft, textAlign: 'center', marginTop: theme.spacing(3) },

  /* Confirmation / error cards */
  centerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
  },
  confirmCard: {
    width: '100%',
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(6),
    alignItems: 'center',
  },
  confirmImage: { width: 96, height: 96, borderRadius: 48, marginBottom: theme.spacing(4) },
  confirmTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.ink, marginBottom: 6 },
  confirmBody: { fontSize: 14, color: theme.colors.inkSoft, textAlign: 'center', marginBottom: 6 },
  confirmThanks: {
    fontSize: 13,
    color: theme.colors.ink,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  confirmDivider: { height: 1, backgroundColor: theme.colors.border, alignSelf: 'stretch', marginVertical: theme.spacing(4) },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginBottom: 6 },
  confirmRowLabel: { color: theme.colors.inkSoft, fontSize: 13 },
  confirmRowValue: { color: theme.colors.ink, fontSize: 13, fontWeight: '700' },

  errorCard: {
    width: '100%',
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(6),
    alignItems: 'center',
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(4),
  },
});

export default FeederHomeScreen;