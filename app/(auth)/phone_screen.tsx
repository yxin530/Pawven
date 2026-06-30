import React, { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const CODE_LENGTH = 6;

export default function PhoneScreen() {
  const router = useRouter();
  const codeInputRef = useRef<TextInput>(null);
  const [step, setStep] = useState<"contact" | "code">("contact");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const trimmedPhone = phone.trim();
  const canContinue = trimmedPhone.length > 0;
  const codeDigits = useMemo(
    () => code.padEnd(CODE_LENGTH, " ").slice(0, CODE_LENGTH).split(""),
    [code],
  );

  const handleNext = () => {
    if (step === "contact") {
      if (!canContinue) return;
      setStep("code");
      requestAnimationFrame(() => codeInputRef.current?.focus());
      return;
    }

    if (code.length === CODE_LENGTH) {
      router.replace("/roleSelect");
    }
  };

  const handleBack = () => {
    if (step === "code") {
      setStep("contact");
      setCode("");
      return;
    }

    router.back();
  };

  if (step === "code") {
    return (
      <AuthFrame>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>#</Text>
          </View>

          <Text style={styles.title}>Enter Code</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to your phone{"\n"}
            <Text style={styles.subtitleStrong}>{trimmedPhone}.</Text>
          </Text>

          <Pressable style={styles.codeBox} onPress={() => codeInputRef.current?.focus()}>
            {codeDigits.map((digit, index) => (
              <Text
                key={`${index}-${digit}`}
                style={[styles.codeDigit, !digit.trim() && styles.codeDigitEmpty]}
              >
                {digit.trim() ? digit : "0"}
              </Text>
            ))}
          </Pressable>

          <TextInput
            ref={codeInputRef}
            value={code}
            onChangeText={(value) =>
              setCode(value.replace(/\D/g, "").slice(0, CODE_LENGTH))
            }
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={CODE_LENGTH}
            style={styles.hiddenInput}
            autoFocus
          />
        </View>

        <BottomNextButton enabled onPress={handleNext} />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.phoneIcon}>☎</Text>
        </View>

        <Text style={styles.title}>Continue with Phone</Text>
        <Text style={styles.subtitle}>Sign in or sign up with your phone number.</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#C9C7CC"
          value={phone}
          onChangeText={setPhone}
          autoCorrect={false}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />
      </View>

      <BottomNextButton enabled={canContinue} onPress={handleNext} />
    </AuthFrame>
  );
}

function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.handle} />
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BottomNextButton({
  enabled,
  onPress,
}: {
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ disabled: !enabled }}
        activeOpacity={enabled ? 0.85 : 1}
        style={[styles.nextButton, !enabled && styles.nextButtonDisabled]}
        onPress={onPress}
        disabled={!enabled}
      >
        <Text style={[styles.nextButtonText, !enabled && styles.nextButtonTextDisabled]}>
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const BG = "#F8F7FA";
const TEXT = "#1C1C1E";
const MUTED = "#7D7A80";
const INPUT_BG = "#EFEDF1";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  keyboardView: {
    flex: 1,
  },
  handle: {
    alignSelf: "center",
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#E7E5EA",
    marginTop: 8,
  },
  backButton: {
    width: 54,
    height: 54,
    justifyContent: "center",
    marginLeft: 20,
    marginTop: 12,
  },
  backIcon: {
    color: "#111113",
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "300",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 78,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F0EEF2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  iconText: {
    color: "#9B99A0",
    fontSize: 31,
    lineHeight: 34,
    fontWeight: "700",
  },
  phoneIcon: {
    color: "#9B99A0",
    fontSize: 30,
    lineHeight: 34,
  },
  title: {
    color: TEXT,
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 8,
  },
  subtitle: {
    color: MUTED,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 36,
  },
  subtitleStrong: {
    color: TEXT,
    fontWeight: "700",
  },
  input: {
    height: 64,
    borderRadius: 16,
    backgroundColor: INPUT_BG,
    paddingHorizontal: 22,
    color: TEXT,
    fontSize: 20,
    fontWeight: "500",
  },
  codeBox: {
    height: 72,
    borderRadius: 16,
    backgroundColor: INPUT_BG,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  codeDigit: {
    width: 32,
    textAlign: "center",
    color: TEXT,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "600",
  },
  codeDigitEmpty: {
    color: "#B8B6BC",
    fontWeight: "500",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  bottomBar: {
    paddingHorizontal: 32,
    paddingBottom: 34,
  },
  nextButton: {
    height: 66,
    borderRadius: 24,
    backgroundColor: "#111113",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: "#B6B5B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
  },
  nextButtonTextDisabled: {
    color: "#ECECEF",
  },
});
