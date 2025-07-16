// Optional: Class Materials screen (placeholder)
import React from "react";
import { View, Text } from "react-native";

export default function ClassMaterialsScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>Class Materials</Text>
      <View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 16 }}>
        <Text>No materials yet. This section will show downloadable resources when available.</Text>
        {/* Replace with real materials when backend is ready */}
      </View>
    </View>
  );
} 