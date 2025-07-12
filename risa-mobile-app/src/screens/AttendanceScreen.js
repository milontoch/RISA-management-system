import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function AttendanceScreen({ navigation }) {
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await api.getAttendance();
      setAttendance(data.data || data);
    } catch (error) {
      console.error('Error loading attendance:', error);
      Alert.alert('Error', 'Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.attendanceCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.student_name}</Text>
        <Text style={styles.studentClass}>{item.class_name}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={[styles.status, { color: item.status === 'present' ? '#34C759' : '#FF3B30' }]}>
          {item.status}
        </Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={attendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  attendanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  studentClass: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
}); 