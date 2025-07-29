import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ActivityTracker from './src/components/ActivityTracker';
import TouchActivityTracker from './src/components/TouchActivityTracker';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { subscribeToApiErrors } from './src/services/api';

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
import StudentPortalScreen from './src/screens/StudentPortalScreen';

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
  function MainTabNavigator({ user }) {
    // Admin tabs
    if (user.role === 'admin') {
      return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Users') {
                iconName = focused ? 'person' : 'person-outline';
              } else if (route.name === 'Students') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'Attendance') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
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
            name="Users" 
            component={TeachersScreen}
            options={{ title: 'Manage Users' }}
          />
          <Tab.Screen 
            name="Students" 
            component={StudentsScreen}
            options={{ title: 'Students' }}
          />
          <Tab.Screen 
            name="Attendance" 
            component={AttendanceScreen}
            options={{ title: 'Attendance' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={ProfileScreenWrapper}
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      );
    }
    // Head Teacher tabs
    if (user.role === 'teacher' && user.is_head_teacher) {
      return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Attendance') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'AttendanceHistory') {
                iconName = focused ? 'time' : 'time-outline';
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
            name="Attendance" 
            component={AttendanceScreen}
            options={{ title: 'Take Attendance' }}
          />
          <Tab.Screen 
            name="AttendanceHistory" 
            component={AttendanceScreen}
            options={{ title: 'Attendance History' }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreenWrapper}
            options={{ title: 'Profile' }}
          />
        </Tab.Navigator>
      );
    }
    // Teacher tabs
    if (user.role === 'teacher') {
      return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Attendance') {
                iconName = focused ? 'calendar' : 'calendar-outline';
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
            name="Attendance" 
            component={AttendanceScreen}
            options={{ title: 'Take Attendance' }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreenWrapper}
            options={{ title: 'Profile' }}
          />
        </Tab.Navigator>
      );
    }
    // Fallback (should not happen)
    return null;
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
            user && user.role === 'student' ? (
              <Stack.Screen name="StudentPortal" component={StudentPortalScreen} />
            ) : (
              <Stack.Screen name="Main">
                {() => <MainTabNavigator user={user} />}
              </Stack.Screen>
            )
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
  const [offline, setOffline] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    // Subscribe to API errors
    subscribeToApiErrors(err => {
      if (err.code === 'network') {
        setOffline(true);
      } else if (err.message) {
        setToast({ message: err.message, type: err.code === 422 ? 'error' : (err.code === 401 || err.code === 403 ? 'error' : 'error') });
      }
    });
    // Listen for NetInfo
    const unsubscribe = NetInfo.addEventListener(state => {
      setOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {offline && (
        <>
          <Toast ref={(ref) => Toast.setRef(ref)} />
          <OfflineBanner />
        </>
      )}
      {!offline && <Toast ref={(ref) => Toast.setRef(ref)} />}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );
}

function OfflineBanner() {
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#f59e42',
      padding: 10,
      zIndex: 9999,
    }}>
      <Text style={{
        color: 'white',
        textAlign: 'center',
        width: '100%',
      }}>
        You are offline
      </Text>
    </View>
  );
}
