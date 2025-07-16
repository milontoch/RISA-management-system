import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Switch, Share, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_BASE = require('../config').default.api.baseURL;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(config => {
  AsyncStorage.getItem('token').then(token => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
  });
  return config;
});

// Optional: Share attendance as CSV/text
function shareAttendance(attendance) {
  if (!attendance || !attendance.length) return;
  const header = "Date,Status,Time,Remark";
  const rows = attendance.map(a => [a.date, a.status, a.time || "", a.remark || ""].join(","));
  const csv = [header, ...rows].join("\n");
  Share.share({ message: csv });
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [assignedClass, setAssignedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  // Check network status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await axios.get('https://www.google.com');
        setOffline(false);
      } catch {
        setOffline(true);
      }
    };
    checkConnection();
  }, []);

  // Load assigned class
  useEffect(() => {
    const fetchClass = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await api.get('/classes');
        const classes = res.data.data;
        const myClass = classes.find(c => c.head_teacher_id === user.id);
        if (!myClass) throw new Error('No assigned class found.');
        setAssignedClass(myClass);
      } catch (err) {
        setError('Failed to load assigned class.');
      } finally {
        setLoading(false);
      }
    };
    if (user && user.id) fetchClass();
  }, [user]);

  // Load students for class and today's attendance
  useEffect(() => {
    const fetchStudents = async () => {
      if (!assignedClass) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/classes/${assignedClass.id}/students`);
        setStudents(res.data.data);
        // Load today's attendance if exists
        const today = date.toISOString().slice(0, 10);
        const attRes = await api.get(`/attendance?class_id=${assignedClass.id}&date=${today}`);
        const attData = attRes.data.data || [];
        const attMap = {};
        attData.forEach(a => {
          attMap[a.student_id] = a.status;
        });
        setAttendance(attMap);
      } catch (err) {
        setError('Failed to load students or attendance.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [assignedClass, date]);

  // Load attendance history for selected date
  const fetchHistory = async (selectedDate) => {
    if (!assignedClass) return;
    setLoading(true);
    setError('');
    try {
      const d = selectedDate || date;
      const res = await api.get(`/attendance?class_id=${assignedClass.id}&date=${d.toISOString().slice(0, 10)}`);
      setHistory(res.data.data || []);
    } catch (err) {
      setError('Failed to load attendance history.');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle present/absent
  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  // Submit attendance
  const handleSubmit = async () => {
    if (offline) {
      Alert.alert('Offline', 'You are offline. Attendance will be saved locally and submitted when online.');
      await AsyncStorage.setItem('pendingAttendance', JSON.stringify({ class_id: assignedClass.id, date: date.toISOString().slice(0, 10), attendance_data: Object.entries(attendance).map(([student_id, status]) => ({ student_id: Number(student_id), status })) }));
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        class_id: assignedClass.id,
        date: date.toISOString().slice(0, 10),
        attendance_data: students.map(s => ({ student_id: s.id, status: attendance[s.id] || 'absent' })),
      };
      await api.post('/attendance/bulk', payload);
      Alert.alert('Success', 'Attendance submitted successfully!');
      fetchHistory();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  // Date picker
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  // Render student row
  const renderStudent = ({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 16 }}>{item.user?.name}</Text>
      <Switch
        value={attendance[item.id] === 'present'}
        onValueChange={() => toggleAttendance(item.id)}
      />
      <Text style={{ color: attendance[item.id] === 'present' ? 'green' : 'red', marginLeft: 10 }}>
        {attendance[item.id] === 'present' ? 'Present' : 'Absent'}
          </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f9f9f9' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Daily Attendance</Text>
      {assignedClass && (
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Class: {assignedClass.name} - Section {assignedClass.section}</Text>
      )}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#007AFF' }}>Select Date: {date.toISOString().slice(0, 10)}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ color: 'red', marginTop: 20 }}>{error}</Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={item => item.id.toString()}
          renderItem={renderStudent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No students found.</Text>}
        />
      )}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting || offline}
        style={{ backgroundColor: submitting || offline ? '#ccc' : '#007AFF', padding: 16, borderRadius: 8, marginTop: 20 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{submitting ? 'Submitting...' : offline ? 'Offline - Save Locally' : 'Submit Attendance'}</Text>
        </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 32 }}>Attendance History</Text>
      <TouchableOpacity onPress={() => fetchHistory()} style={{ marginBottom: 8 }}>
        <Text style={{ color: '#007AFF' }}>Refresh History</Text>
        </TouchableOpacity>
      {history.length === 0 ? (
        <Text style={{ color: '#888', marginTop: 8 }}>No attendance records for this date.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text>{item.student?.user?.name}</Text>
              <Text style={{ color: item.status === 'present' ? 'green' : 'red' }}>{item.status}</Text>
      </View>
          )}
        />
      )}
      <Button title="Share Attendance" onPress={() => shareAttendance(history)} />
    </View>
  );
}