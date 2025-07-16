import React, { useEffect, useRef } from "react";
import { AppState, Alert, TouchableWithoutFeedback } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

export default function AutoLogoutProvider({ children }) {
  const navigation = useNavigation();
  const timer = useRef();
  const appState = useRef(AppState.currentState);

  function showToast(msg) {
    Toast.show({ type: "error", text1: msg });
  }

  async function logout(reason = "Session expired. Please log in again") {
    await AsyncStorage.clear();
    showToast(reason);
    navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
  }

  function resetTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => logout(), INACTIVITY_LIMIT);
  }

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        resetTimer();
      }
      appState.current = nextAppState;
    };
    AppState.addEventListener("change", handleAppStateChange);
    resetTimer();
    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Touch anywhere resets timer
  function handleTouch() {
    resetTimer();
  }

  // Expose for axios interceptor
  global.handleSessionExpiry = () => logout();

  return (
    <TouchableWithoutFeedback onPress={handleTouch} onTouchStart={handleTouch}>
      {children}
    </TouchableWithoutFeedback>
  );
} 