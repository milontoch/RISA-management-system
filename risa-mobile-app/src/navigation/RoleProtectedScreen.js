// RoleProtectedScreen.js
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RoleProtectedScreen({ allowedRoles, children, navigation }) {
  const { user } = useAuth();
  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      Alert.alert("Unauthorized", "You are not allowed to access this screen.");
      if (navigation && navigation.goBack) navigation.goBack();
    }
  }, [user, allowedRoles, navigation]);
  if (!user || !allowedRoles.includes(user.role)) return null;
  return children;
} 