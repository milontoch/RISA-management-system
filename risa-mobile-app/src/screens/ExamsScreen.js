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

export default function ExamsScreen({ navigation }) {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await api.getExams();
      setExams(data.data || data);
    } catch (error) {
      console.error('Error loading exams:', error);
      Alert.alert('Error', 'Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  };

  const renderExam = ({ item }) => (
    <TouchableOpacity style={styles.examCard}>
      <View style={styles.examInfo}>
        <Text style={styles.examTitle}>{item.title}</Text>
        <Text style={styles.examSubject}>{item.subject_name}</Text>
        <Text style={styles.examDate}>{item.exam_date}</Text>
      </View>
      <View style={styles.examStatus}>
        <Text style={[styles.status, { color: item.status === 'completed' ? '#34C759' : '#FF9500' }]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Exams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exams</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={exams}
        renderItem={renderExam}
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
  examCard: {
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
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  examSubject: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  examDate: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  examStatus: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
}); 