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

export default function TeachersScreen({ navigation }) {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await api.getTeachers();
      const teachersData = Array.isArray(response) ? response : (response.data || []);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
      Alert.alert('Error', 'Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTeacher = ({ item }) => (
    <TouchableOpacity style={styles.teacherCard}>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.user?.name || 'Unknown'}</Text>
        <Text style={styles.teacherSubject}>{item.subject?.name || 'No Subject'}</Text>
        <Text style={styles.teacherQualification}>{item.qualification || 'No Qualification'}</Text>
        <Text style={styles.teacherExperience}>{item.experience_years || 0} years experience</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Teachers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teachers</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teachers}
        renderItem={renderTeacher}
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
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  teacherSubject: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  teacherQualification: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  teacherExperience: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
}); 