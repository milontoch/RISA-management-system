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

export default function ResultsScreen({ navigation }) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await api.getResults();
      setResults(data.data || data);
    } catch (error) {
      console.error('Error loading results:', error);
      Alert.alert('Error', 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = ({ item }) => (
    <TouchableOpacity style={styles.resultCard}>
      <View style={styles.resultInfo}>
        <Text style={styles.studentName}>{item.student_name}</Text>
        <Text style={styles.examTitle}>{item.exam_title}</Text>
        <Text style={styles.subjectName}>{item.subject_name}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{item.score}%</Text>
        <Text style={styles.grade}>{item.grade}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Results...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Results</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        renderItem={renderResult}
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
  resultCard: {
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
  resultInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  examTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  subjectName: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grade: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
}); 