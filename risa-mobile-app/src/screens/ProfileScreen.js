import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, trackActivity } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Track activity when screen is focused
  useEffect(() => {
    trackActivity();
  }, [trackActivity]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ]
    );
  };

  const performLogout = async () => {
    try {
      // Show loading indicator
      setIsLoading(true);
      
      // Use the logout function from AuthContext
      await logout();
      
      // Show success message
      Alert.alert('Success', 'Logged out successfully');
      
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ProfileMenuItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
        </View>
        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        <Text style={styles.userRole}>{user?.role || 'User'}</Text>
      </View>

      {/* Profile Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <ProfileMenuItem
          icon="person-outline"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => Alert.alert('Edit Profile', 'This feature will be implemented soon.')}
        />
        
        <ProfileMenuItem
          icon="lock-closed-outline"
          title="Change Password"
          subtitle="Update your password"
          onPress={() => Alert.alert('Change Password', 'This feature will be implemented soon.')}
        />
        
        <ProfileMenuItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage notification preferences"
          onPress={() => Alert.alert('Notifications', 'This feature will be implemented soon.')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <ProfileMenuItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => Alert.alert('Help & Support', 'This feature will be implemented soon.')}
        />
        
        <ProfileMenuItem
          icon="document-text-outline"
          title="Terms of Service"
          subtitle="Read our terms and conditions"
          onPress={() => Alert.alert('Terms of Service', 'This feature will be implemented soon.')}
        />
        
        <ProfileMenuItem
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onPress={() => Alert.alert('Privacy Policy', 'This feature will be implemented soon.')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>App</Text>
        
        <ProfileMenuItem
          icon="information-circle-outline"
          title="About"
          subtitle="App version and information"
          onPress={() => Alert.alert('About', 'RISA Management System v1.0.0\n\nA comprehensive school management solution.')}
        />
        
        <ProfileMenuItem
          icon="refresh-outline"
          title="Check for Updates"
          subtitle="Check for app updates"
          onPress={() => Alert.alert('Updates', 'You are using the latest version.')}
        />
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
}); 