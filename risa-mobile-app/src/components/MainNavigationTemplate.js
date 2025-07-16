import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { colors, spacing, radius, font } from "../theme";

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'grades', label: 'Grades' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'profile', label: 'Profile' },
];

export default function MainNavigationTemplate({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.oysterglow.bg }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.oysterglow.surface,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.layout,
        borderBottomLeftRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <Text style={{
          color: colors.oysterglow.text,
          fontSize: font.size.xl,
          fontWeight: font.weight.bold,
          fontFamily: font.family,
        }}>
          RISA Student Portal
        </Text>
      </View>

      {/* Content Area */}
      <View style={{ flex: 1, padding: spacing.layout }}>
        <View style={{
          backgroundColor: colors.oysterglow.surface,
          borderRadius: radius.lg,
          padding: spacing.card,
          flex: 1,
          shadowColor: colors.black,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <Text style={{
            color: colors.oysterglow.text,
            fontSize: font.size.lg,
            fontWeight: font.weight.bold,
            marginBottom: spacing.md,
            fontFamily: font.family,
          }}>
            {TABS.find(t => t.key === activeTab)?.label}
          </Text>
          {/* Replace below with actual tab content */}
          <Text style={{ color: colors.oysterglow.text, fontSize: font.size.md }}>
            This is the {activeTab} screen.
          </Text>
          {children}
        </View>
      </View>

      {/* Tab Bar */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.oysterglow.surface,
        paddingVertical: spacing.sm,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.md,
              backgroundColor: activeTab === tab.key ? colors.primary : 'transparent',
            }}
          >
            <Text style={{
              color: activeTab === tab.key ? colors.white : colors.oysterglow.text,
              fontWeight: font.weight.bold,
              fontSize: font.size.md,
              fontFamily: font.family,
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
} 