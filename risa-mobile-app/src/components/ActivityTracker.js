import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ActivityTracker() {
  const { trackActivity } = useAuth();

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App became active, track activity
        trackActivity();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [trackActivity]);

  // This component doesn't render anything
  return null;
} 