import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function TouchActivityTracker({ children }) {
  const { trackActivity } = useAuth();

  const handleTouch = () => {
    trackActivity();
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      {children}
    </TouchableWithoutFeedback>
  );
} 