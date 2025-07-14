import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AutoLogoutIndicator() {
  const { isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    // Show warning 2 minutes before auto-logout
    const WARNING_TIME = 2 * 60 * 1000; // 2 minutes
    const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes

    const checkTimeLeft = () => {
      const now = Date.now();
      const lastActivity = localStorage.getItem('lastActivity') || now;
      const timeSinceActivity = now - parseInt(lastActivity);
      const remainingTime = AUTO_LOGOUT_TIME - timeSinceActivity;

      if (remainingTime <= WARNING_TIME && remainingTime > 0) {
        setTimeLeft(Math.ceil(remainingTime / 1000 / 60)); // Convert to minutes
        setShowWarning(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else if (remainingTime <= 0) {
        setShowWarning(false);
      } else {
        setShowWarning(false);
      }
    };

    const interval = setInterval(checkTimeLeft, 1000);
    checkTimeLeft(); // Check immediately

    return () => clearInterval(interval);
  }, [isAuthenticated, fadeAnim]);

  if (!showWarning || !isAuthenticated) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.warningText}>
        ⚠️ You will be logged out in {timeLeft} minute{timeLeft !== 1 ? 's' : ''} due to inactivity
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 