import React from "react";
import { Pressable, Text, ViewStyle, TextStyle } from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "default" | "outline";
  className?: string;
}

export function Button({ children, onPress, variant = "default", className }: ButtonProps) {
  const baseClasses = "rounded-full py-4 items-center";
  const variantClasses =
    variant === "outline"
      ? "bg-background border border-border"
      : "bg-text";
  const textClasses =
    variant === "outline"
      ? "text-text font-semibold text-base"
      : "text-white font-semibold text-base";

  return (
    <Pressable
      className={`${baseClasses} ${variantClasses} ${className ?? ""}`}
      onPress={onPress}
    >
      <Text className={textClasses}>{children}</Text>
    </Pressable>
  );
}
