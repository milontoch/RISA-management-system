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
      // Handle paginated or array response
      const resultsArray = Array.isArray(data) ? data : (data.data || []);
      setResults(resultsArray);
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
        <Text style={styles.studentName}>{item.student?.user?.name || ''}</Text>
        <Text style={styles.examTitle}>{item.exam?.name || ''}</Text>
        <Text style={styles.subjectName}>{item.subject?.name || ''}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{item.marks_obtained} / {item.total_marks}</Text>
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
  listContainer: {
    padding: 20,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    color: '#007AFF',
    marginTop: 2,
  },
  subjectName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
}); 