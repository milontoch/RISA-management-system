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
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isHeadTeacher, setIsHeadTeacher] = useState(false);

  // Get user and role from context or AsyncStorage
  useEffect(() => {
    const getRole = async () => {
      try {
        let role = null;
        let userObj = null;
        if (typeof useAuth === 'function') {
          const auth = useAuth();
          userObj = auth.user;
          role = userObj?.role;
        }
        if (!role) {
          const userData = await AsyncStorage.getItem('user');
          userObj = userData ? JSON.parse(userData) : null;
          role = userObj?.role;
        }
        setUser(userObj);
        setUserRole(role);
        setIsHeadTeacher(!!userObj?.is_head_teacher);
      } catch (e) {
        setUser(null);
        setUserRole(null);
        setIsHeadTeacher(false);
      }
    };
    getRole();
  }, []);

  // Compute dashboard title
  const getDashboardTitle = () => {
    if (userRole === 'admin') return 'School Control Center';
    if (userRole === 'teacher' && isHeadTeacher) return 'Attendance & Leadership';
    if (userRole === 'teacher') return 'Teaching Hub';
    return 'Dashboard';
  };

  // Role-based navigation section
  const renderRoleNav = () => {
    if (!userRole) return null;
    if (userRole === 'admin') {
      return (
        <View className="mb-4">
          <Text style={styles.roleNavTitle}>Admin Quick Links</Text>
          <View style={styles.roleNavRow}>
            <TouchableOpacity style={styles.roleNavBtn} onPress={() => navigation.navigate('TeachersScreen')}>
              <Ionicons name="people" size={24} color="#007AFF" />
              <Text style={styles.roleNavBtnText}>Manage Teachers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roleNavBtn} onPress={() => navigation.navigate('StudentsScreen')}>
              <Ionicons name="school" size={24} color="#007AFF" />
              <Text style={styles.roleNavBtnText}>Manage Students</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roleNavBtn} onPress={() => navigation.navigate('AttendanceScreen')}>
              <Ionicons name="calendar" size={24} color="#007AFF" />
              <Text style={styles.roleNavBtnText}>Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (userRole === 'teacher') {
      return (
        <View className="mb-4">
          <Text style={styles.roleNavTitle}>Teacher Quick Links</Text>
          <View style={styles.roleNavRow}>
            <TouchableOpacity style={styles.roleNavBtn} onPress={() => navigation.navigate('AttendanceScreen')}>
              <Ionicons name="calendar" size={24} color="#007AFF" />
              <Text style={styles.roleNavBtnText}>Take Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roleNavBtn} onPress={() => navigation.navigate('StudentsScreen')}>
              <Ionicons name="school" size={24} color="#007AFF" />
              <Text style={styles.roleNavBtnText}>My Students</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (userRole === 'student') {
      return (
        <View className="mb-4">
          <Text style={styles.roleNavTitle}>Student Quick Links</Text>
          <View style={styles.roleNavRow}>
            <TouchableOpacity style={styles.roleNavBtn} onPress={() => navigation.navigate('AttendanceScreen')}>
              <Ionicons name="calendar" size={24} color="#007AFF" />
              <Text style={styles.roleNavBtnText}>My Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roleNavBtn} onPress={() => navigation.navigate('TeachersScreen')}>
              <Ionicons name="people" size={24} color="#007AFF" />
              <Text style={styles.roleNavBtnText}>My Teachers</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get user data from AsyncStorage to determine role
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const userRole = user?.role || 'admin'; // Default to admin if no role found
      
      const data = await api.getDashboard(userRole);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set default data if API fails
      setDashboardData({
        totalStudents: 2,
        totalTeachers: 2,
        activeClasses: 2,
        todayAttendance: 85,
        recentActivity: [
          { description: 'New student registered', time: '2 hours ago' },
          { description: 'Attendance marked for Class 1', time: '4 hours ago' },
          { description: 'Exam results uploaded', time: '6 hours ago' },
          { description: 'Parent meeting scheduled', time: '1 day ago' },
        ],
        upcomingEvents: [
          { title: 'Parent Meeting', day: '15', month: 'Jul', time: '10:00 AM' },
          { title: 'Exam Week', day: '20', month: 'Jul', time: '9:00 AM' },
          { title: 'Sports Day', day: '25', month: 'Jul', time: '8:00 AM' },
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.getNotifications();
      // Handle both array and object with data property
      const notifications = Array.isArray(response) ? response : (response.data || []);
      const unreadNotifications = notifications.filter(notification => !notification.read_at);
      setNotifications(notifications);
      setNotificationCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Set sample notifications for demo when API fails
      const sampleNotifications = [
        {
          id: 1,
          title: 'New Message',
          message: 'You have received a new message from the administrator.',
          type: 'message',
          created_at: new Date().toISOString(),
          read_at: null,
        },
        {
          id: 2,
          title: 'Attendance Reminder',
          message: 'Please mark attendance for Class 10A by 9:00 AM.',
          type: 'reminder',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read_at: null,
        },
        {
          id: 3,
          title: 'Exam Schedule',
          message: 'Mid-term exams will begin next week. Check the schedule.',
          type: 'announcement',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          read_at: new Date().toISOString(),
        },
        {
          id: 4,
          title: 'System Update',
          message: 'The system will be updated tonight at 2:00 AM.',
          type: 'announcement',
          created_at: new Date(Date.now() - 10800000).toISOString(),
          read_at: null,
        },
      ];
      setNotifications(sampleNotifications);
      setNotificationCount(sampleNotifications.filter(n => !n.read_at).length);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboardData(), loadNotifications()]);
    setRefreshing(false);
  };

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
  };

  const handleClearNotification = async (notificationId) => {
    try {
      await api.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setNotificationCount(prev => Math.max(0, prev - 1));
      setShowNotificationModal(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error clearing notification:', error);
      // For demo purposes, just remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setNotificationCount(prev => Math.max(0, prev - 1));
      setShowNotificationModal(false);
      setSelectedNotification(null);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // For demo purposes, just update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setNotificationCount(prev => Math.max(0, prev - 1));
    }
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

  // Optional: Upcoming Events section (mock)
  function UpcomingEvents() {
    const [events, setEvents] = useState([]);
    useEffect(() => {
      setTimeout(() => {
        setEvents([
          { id: 1, title: "Math Exam", date: "2024-08-01" },
          { id: 2, title: "Science Fair", date: "2024-08-05" },
          { id: 3, title: "Holiday: Independence Day", date: "2024-08-10" },
        ]);
      }, 500);
    }, []);
    return (
      <View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 16, marginVertical: 12 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Upcoming Events</Text>
        {events.length === 0 ? (
          <Text>Loading...</Text>
        ) : (
          events.map(e => (
            <Text key={e.id} style={{ marginBottom: 2 }}>
              <Text style={{ fontWeight: "500" }}>{e.title}</Text> <Text style={{ color: "#888" }}>({e.date})</Text>
            </Text>
          ))
        )}
        {/* Replace with real API later */}
      </View>
    );
  }

  // Optional: In-app Notifications (mock)
  function NotificationsBanner() {
    const [show, setShow] = useState(true);
    // Mock notifications
    const notifications = [
      { id: 1, message: "Result uploaded" },
      { id: 2, message: "Attendance low this month" },
    ];
    if (!show || notifications.length === 0) return null;
    return (
      <TouchableOpacity onPress={() => setShow(false)}>
        <View style={{ backgroundColor: "#5C4F6E", padding: 10, borderRadius: 6, marginBottom: 10 }}>
          {notifications.map(n => (
            <Text key={n.id} style={{ color: "#fff", fontSize: 14 }}>{n.message}</Text>
          ))}
          {/* Replace with real notifications later */}
        </View>
      </TouchableOpacity>
    );
  }

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
      {renderRoleNav()}
      <NotificationsBanner />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{getDashboardTitle()}</Text>
            <Text style={styles.headerSubtitle}>
              Welcome to RISA Management System
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationIcon}
            onPress={() => {
              if (notifications.length > 0) {
                setShowNotificationModal(true);
              } else {
                Alert.alert('Notifications', 'No notifications available');
              }
            }}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
            onPress={() => navigation.navigate('Students')}
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
            title="View Fees"
            subtitle="Check fee status"
            icon="card"
            onPress={() => navigation.navigate('Fees')}
          />
        </View>
      </View>

      {/* Recent Notifications Preview */}
      {notifications.filter(n => !n.read_at).length > 0 && (
        <View style={styles.notificationsPreviewSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotificationModal(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.notificationsPreviewList}>
            {notifications
              .filter(notification => !notification.read_at)
              .slice(0, 2)
              .map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.notificationPreviewItem}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={styles.notificationPreviewIcon}>
                    <Ionicons 
                      name={
                        notification.type === 'message' ? 'chatbubble-outline' :
                        notification.type === 'reminder' ? 'time-outline' :
                        notification.type === 'announcement' ? 'megaphone-outline' :
                        'notifications-outline'
                      } 
                      size={16} 
                      color={
                        notification.type === 'message' ? '#007AFF' :
                        notification.type === 'reminder' ? '#FF9500' :
                        notification.type === 'announcement' ? '#34C759' :
                        '#666'
                      } 
                    />
                  </View>
                  <View style={styles.notificationPreviewContent}>
                    <Text style={styles.notificationPreviewTitle} numberOfLines={1}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationPreviewMessage} numberOfLines={1}>
                      {notification.message}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.notificationPreviewClear}
                    onPress={() => handleClearNotification(notification.id)}
                  >
                    <Ionicons name="close" size={16} color="#999" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}

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

      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowNotificationModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationList}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotifications}>
                  <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No notifications</Text>
                </View>
              ) : (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read_at && styles.unreadNotification
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={styles.notificationIcon}>
                      <Ionicons 
                        name={
                          notification.type === 'message' ? 'chatbubble-outline' :
                          notification.type === 'reminder' ? 'time-outline' :
                          notification.type === 'announcement' ? 'megaphone-outline' :
                          'notifications-outline'
                        } 
                        size={20} 
                        color={
                          notification.type === 'message' ? '#007AFF' :
                          notification.type === 'reminder' ? '#FF9500' :
                          notification.type === 'announcement' ? '#34C759' :
                          '#666'
                        } 
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage} numberOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString()}
                      </Text>
                    </View>
                    <View style={styles.notificationActions}>
                      {!notification.read_at && (
                        <TouchableOpacity
                          style={styles.markReadButton}
                          onPress={() => handleMarkAsRead(notification.id)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => handleClearNotification(notification.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    fontSize: 20,
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
  },
  actionsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
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
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
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
    paddingBottom: 40,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  eventDate: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  eventDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  eventMonth: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.8,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notificationModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  notificationList: {
    flex: 1,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  markReadButton: {
    padding: 8,
    marginRight: 4,
  },
  clearButton: {
    padding: 8,
  },
  // Notification preview styles
  notificationsPreviewSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  notificationsPreviewList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  notificationPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationPreviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationPreviewContent: {
    flex: 1,
  },
  notificationPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationPreviewMessage: {
    fontSize: 12,
    color: '#666',
  },
  notificationPreviewClear: {
    padding: 4,
  },
  // Role-based navigation styles
  roleNavTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  roleNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  roleNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    width: '45%', // Adjust as needed
    alignItems: 'center',
  },
  roleNavBtnText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
}); 