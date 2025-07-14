import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function AttendanceScreen({ navigation }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    try {
      const data = await api.getAttendance(selectedDate);
      setAttendanceData(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
      // Set default data if API fails
      setAttendanceData([
        {
          id: 1,
          student_id: 1,
          student_name: 'John Doe',
          class: 'Class 1',
          roll_number: '001',
          date: selectedDate,
          status: 'present',
          time_in: '08:30',
          time_out: '15:30',
        },
        {
          id: 2,
          student_id: 2,
          student_name: 'Jane Smith',
          class: 'Class 2',
          roll_number: '002',
          date: selectedDate,
          status: 'absent',
          time_in: null,
          time_out: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendance();
    setRefreshing(false);
  };

  const filteredAttendance = attendanceData.filter(item =>
    item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAttendance = async (studentId, status) => {
    try {
      await api.markAttendance({
        student_id: studentId,
        date: selectedDate,
        status: status,
      });
      
      // Update local state
      setAttendanceData(prevData =>
        prevData.map(item =>
          item.student_id === studentId
            ? { ...item, status: status }
            : item
        )
      );
      
      Alert.alert('Success', 'Attendance marked successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const handleBulkMarkAttendance = () => {
    Alert.alert('Bulk Mark Attendance', 'This feature will be implemented soon.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#34C759';
      case 'absent':
        return '#FF3B30';
      case 'late':
        return '#FF9500';
      default:
        return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      default:
        return 'Not Marked';
    }
  };

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.attendanceCard}>
      <View style={styles.studentInfo}>
        <View style={styles.studentHeader}>
          <Text style={styles.studentName}>{item.student_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.studentDetails}>
          Class: {item.class} | Roll: {item.roll_number}
        </Text>
        {item.time_in && (
          <Text style={styles.timeInfo}>
            Time: {item.time_in} - {item.time_out || 'Not checked out'}
          </Text>
        )}
      </View>
      
      <View style={styles.attendanceActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.presentButton]}
          onPress={() => handleMarkAttendance(item.student_id, 'present')}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.absentButton]}
          onPress={() => handleMarkAttendance(item.student_id, 'absent')}
        >
          <Ionicons name="close" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.lateButton]}
          onPress={() => handleMarkAttendance(item.student_id, 'late')}
        >
          <Ionicons name="time" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Attendance...</Text>
      </View>
    );
  }

  const presentCount = attendanceData.filter(item => item.status === 'present').length;
  const absentCount = attendanceData.filter(item => item.status === 'absent').length;
  const lateCount = attendanceData.filter(item => item.status === 'late').length;
  const totalCount = attendanceData.length;

  return (
    <View style={styles.container}>
      {/* Date Selector */}
      <View style={styles.dateContainer}>
        <TouchableOpacity style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          <Text style={styles.dateText}>{selectedDate}</Text>
          <Ionicons name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bulkButton} onPress={handleBulkMarkAttendance}>
          <Ionicons name="checkmark-done" size={20} color="#fff" />
          <Text style={styles.bulkButtonText}>Bulk Mark</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{absentCount}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{lateCount}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Attendance List */}
      <FlatList
        data={filteredAttendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No attendance records found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'No students for this date'}
            </Text>
          </View>
        }
      />
    </View>
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
  dateContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
    marginRight: 8,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bulkButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  studentInfo: {
    marginBottom: 12,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  studentDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeInfo: {
    fontSize: 12,
    color: '#999',
  },
  attendanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presentButton: {
    backgroundColor: '#34C759',
  },
  absentButton: {
    backgroundColor: '#FF3B30',
  },
  lateButton: {
    backgroundColor: '#FF9500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
}); 