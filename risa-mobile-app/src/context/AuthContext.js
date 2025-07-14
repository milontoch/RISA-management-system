import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auto logout timer (30 minutes of inactivity)
  const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
  const logoutTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Reset the logout timer
  const resetLogoutTimer = () => {
    lastActivityRef.current = Date.now();
    
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    
    logoutTimerRef.current = setTimeout(() => {
      handleAutoLogout();
    }, AUTO_LOGOUT_TIME);
  };

  // Handle automatic logout
  const handleAutoLogout = async () => {
    console.log('Auto logout triggered due to inactivity');
    await logout();
  };

  // Track user activity
  const trackActivity = () => {
    if (isAuthenticated) {
      resetLogoutTimer();
    }
  };

  // Set up activity tracking
  useEffect(() => {
    if (isAuthenticated) {
      resetLogoutTimer();
      
      return () => {
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }
      };
    }
  }, [isAuthenticated]);

  // Check authentication on app start
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (userData && token) {
        api.setToken(token);
        
        try {
          const user = await api.getUser();
          setUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          await AsyncStorage.multiRemove(['user', 'token']);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      
      if (response.success && response.data && response.data.token) {
        const userData = response.data.user;
        const token = response.data.token;
        
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('token', token);
        api.setToken(token);
        setUser(userData);
        setIsAuthenticated(true);
        resetLogoutTimer();
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear logout timer
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      
      // Call logout API (but don't fail if it doesn't work)
      try {
        await api.logout();
      } catch (apiError) {
        console.error('API logout failed:', apiError);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local storage and state
      try {
        await AsyncStorage.multiRemove(['user', 'token']);
        api.setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    trackActivity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 