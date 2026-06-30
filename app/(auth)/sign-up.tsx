import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

export default function SignUpScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError(null);
    await signIn(email, password);
    router.push("/roleSelect");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-10">
            <Text className="text-4xl font-bold text-primary">Pawven</Text>
            <Text className="text-base text-text-secondary mt-2">Create your account</Text>
          </View>

          <View>
            <Text className="text-sm font-medium text-text mb-1">Email</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-text"
              placeholder="Enter your email"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-text mb-1">Password</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-text"
              placeholder="Minimum 8 characters"
              placeholderTextColor="#B0B0B0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error && (
            <View className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}

          <TouchableOpacity className="mt-6 bg-primary rounded-lg py-4 items-center" onPress={handleSignUp}>
            <Text className="text-white font-semibold text-base">Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity className="mt-4 items-center" onPress={() => router.push("/(auth)/sign-in")}>
            <Text className="text-text-secondary text-sm">
              Already have an account? <Text className="text-primary font-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
