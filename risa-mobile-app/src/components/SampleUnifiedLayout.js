import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors, spacing, radius, font } from "../theme";

export default function SampleUnifiedLayout({ children }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.oysterglow.bg, padding: spacing.layout }}>
      <View style={{
        backgroundColor: colors.oysterglow.surface,
        borderRadius: radius.lg,
        padding: spacing.card,
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <Text style={{ color: colors.oysterglow.text, fontSize: font.size.xl, fontWeight: font.weight.bold, marginBottom: spacing.md, fontFamily: font.family }}>
          Dashboard
        </Text>
        <TouchableOpacity style={{
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          alignItems: 'center',
          marginTop: spacing.md,
        }}>
          <Text style={{ color: colors.white, fontWeight: font.weight.bold, fontSize: font.size.md, fontFamily: font.family }}>
            Primary Action
          </Text>
        </TouchableOpacity>
        {children}
      </View>
    </View>
  );
} 