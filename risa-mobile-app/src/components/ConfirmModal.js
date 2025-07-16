import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  return (
    <Modal isVisible={visible}>
      <View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 24 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>{title}</Text>
        <Text style={{ marginBottom: 16 }}>{message}</Text>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <TouchableOpacity onPress={onCancel} style={{ marginRight: 12 }}>
            <Text style={{ color: "#888" }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm}>
            <Text style={{ color: "#2563eb", fontWeight: "bold" }}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
} 