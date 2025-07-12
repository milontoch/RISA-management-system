import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ title, subtitle, icon, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Welcome to RISA Management System
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Students"
            value={dashboardData?.totalStudents || 0}
            icon="people"
            color="#007AFF"
            onPress={() => navigation.navigate('Students')}
          />
          <StatCard
            title="Total Teachers"
            value={dashboardData?.totalTeachers || 0}
            icon="person"
            color="#34C759"
            onPress={() => navigation.navigate('Teachers')}
          />
          <StatCard
            title="Active Classes"
            value={dashboardData?.activeClasses || 0}
            icon="school"
            color="#FF9500"
            onPress={() => navigation.navigate('Classes')}
          />
          <StatCard
            title="Today's Attendance"
            value={`${dashboardData?.todayAttendance || 0}%`}
            icon="calendar"
            color="#FF3B30"
            onPress={() => navigation.navigate('Attendance')}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsList}>
          <QuickActionCard
            title="Mark Attendance"
            subtitle="Record today's attendance"
            icon="calendar"
            onPress={() => navigation.navigate('Attendance')}
          />
          <QuickActionCard
            title="Add Exam Result"
            subtitle="Enter exam scores"
            icon="document-text"
            onPress={() => navigation.navigate('Results')}
          />
          <QuickActionCard
            title="Send Message"
            subtitle="Communicate with parents"
            icon="chatbubbles"
            onPress={() => navigation.navigate('Messages')}
          />
          <QuickActionCard
            title="View Reports"
            subtitle="Generate reports"
            icon="stats-chart"
            onPress={() => navigation.navigate('Reports')}
          />
        </View>
      </View>

      {/* Recent Activity */}
      {dashboardData?.recentActivity && (
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {dashboardData.recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="time-outline" size={16} color="#666" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Upcoming Events */}
      {dashboardData?.upcomingEvents && (
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {dashboardData.upcomingEvents.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>{event.day}</Text>
                <Text style={styles.eventMonth}>{event.month}</Text>
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activitySection: {
    padding: 20,
    paddingTop: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventsSection: {
    padding: 20,
    paddingTop: 0,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 50,
  },
  eventDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  eventMonth: {
    fontSize: 12,
    color: '#666',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
}); 