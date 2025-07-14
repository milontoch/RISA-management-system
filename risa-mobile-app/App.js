import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ActivityTracker from './src/components/ActivityTracker';
import TouchActivityTracker from './src/components/TouchActivityTracker';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StudentsScreen from './src/screens/StudentsScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import FeesScreen from './src/screens/FeesScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ExamsScreen from './src/screens/ExamsScreen';
import TeachersScreen from './src/screens/TeachersScreen';

// Import API service
import api from './src/services/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading Screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

// Main App Component
function AppContent() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();

  // Profile Screen Wrapper
  function ProfileScreenWrapper(props) {
    return <ProfileScreen {...props} onLogout={logout} />;
  }

  // Main Tab Navigator
  function MainTabNavigator() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Students') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Teachers') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Attendance') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Results') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Fees') {
              iconName = focused ? 'card' : 'card-outline';
            } else if (route.name === 'Messages') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Dashboard' }}
        />
        <Tab.Screen 
          name="Students" 
          component={StudentsScreen}
          options={{ title: 'Students' }}
        />
        <Tab.Screen 
          name="Teachers" 
          component={TeachersScreen}
          options={{ title: 'Teachers' }}
        />
        <Tab.Screen 
          name="Attendance" 
          component={AttendanceScreen}
          options={{ title: 'Attendance' }}
        />
        <Tab.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{ title: 'Results' }}
        />
        <Tab.Screen 
          name="Fees" 
          component={FeesScreen}
          options={{ title: 'Fees' }}
        />
        <Tab.Screen 
          name="Messages" 
          component={MessagesScreen}
          options={{ title: 'Messages' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreenWrapper}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    );
  }



  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <ActivityTracker />
      <TouchActivityTracker>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={MainTabNavigator} />
          ) : (
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen 
                  {...props} 
                  onLogin={login}
                />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </TouchActivityTracker>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

// Wrap the app with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
