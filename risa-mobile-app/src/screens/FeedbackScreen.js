import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, Alert } from "react-native";
import axios from "../services/api";
import { useConfirm } from "../components/useConfirm";
import Toast from "react-native-toast-message";

export default function FeedbackScreen({ navigation, route }) {
  const student = route.params?.student || {};
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(student.email || "");
  const [name, setName] = useState(student.name || "");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirm, ConfirmModal] = useConfirm();

  const handleSubmit = async () => {
    setErrors({});
    Alert.alert(
      'Submit Feedback?',
      'Are you sure you want to send this feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: async () => {
            setLoading(true);
            try {
              await axios.post("/api/feedback", {
                subject,
                message,
                email: email || undefined,
                student_name: name || undefined,
              });
              Toast.show({ type: "success", text1: "Feedback sent successfully!" });
              setSubject(""); setMessage("");
            } catch (err) {
              if (err.response?.status === 422) setErrors(err.response.data.errors || {});
              else Alert.alert("Error", "An error occurred. Please try again.");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>Send Feedback</Text>
      <View style={{ marginBottom: 12 }}>
        <Text>Subject</Text>
        <TextInput
          style={{ borderWidth: 1, borderRadius: 6, padding: 8, marginTop: 4 }}
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject"
        />
        {errors.subject && <Text style={{ color: "red" }}>{errors.subject[0]}</Text>}
      </View>
      <View style={{ marginBottom: 12 }}>
        <Text>Message</Text>
        <TextInput
          style={{ borderWidth: 1, borderRadius: 6, padding: 8, marginTop: 4, minHeight: 80, textAlignVertical: "top" }}
          value={message}
          onChangeText={setMessage}
          placeholder="Message"
          multiline
        />
        {errors.message && <Text style={{ color: "red" }}>{errors.message[0]}</Text>}
      </View>
      <View style={{ marginBottom: 12 }}>
        <Text>Email (optional)</Text>
        <TextInput
          style={{ borderWidth: 1, borderRadius: 6, padding: 8, marginTop: 4 }}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
        />
        {errors.email && <Text style={{ color: "red" }}>{errors.email[0]}</Text>}
      </View>
      <View style={{ marginBottom: 12 }}>
        <Text>Name (optional)</Text>
        <TextInput
          style={{ borderWidth: 1, borderRadius: 6, padding: 8, marginTop: 4 }}
          value={name}
          onChangeText={setName}
          placeholder="Name"
        />
        {errors.student_name && <Text style={{ color: "red" }}>{errors.student_name[0]}</Text>}
      </View>
      <Button title={loading ? "Sending..." : "Send Feedback"} onPress={handleSubmit} disabled={loading} />
      {ConfirmModal}
      <Toast />
    </ScrollView>
  );
} 