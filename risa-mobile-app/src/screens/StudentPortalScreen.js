import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import theme from '../theme';
import { useAppTheme } from "../components/useAppTheme";

const TABS = [
  { key: 'class', label: 'Class Info' },
  { key: 'timetable', label: 'Timetable' },
  { key: 'grades', label: 'Grades' },
  { key: 'attendance', label: 'Attendance' },
];

export default function StudentPortalScreen({ navigation }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('class');
  // Attendance state
  const [attendance, setAttendance] = useState([]);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceHasMore, setAttendanceHasMore] = useState(true);
  // Grades state
  const [grades, setGrades] = useState([]);
  const [gradesPage, setGradesPage] = useState(1);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesHasMore, setGradesHasMore] = useState(true);
  const { colors, toggleTheme, theme } = useAppTheme();

  // Reset data on tab change
  useEffect(() => {
    if (tab === 'attendance') {
      setAttendance([]); setAttendancePage(1); setAttendanceHasMore(true);
      fetchAttendance(1, true);
    }
    if (tab === 'grades') {
      setGrades([]); setGradesPage(1); setGradesHasMore(true);
      fetchGrades(1, true);
    }
    // eslint-disable-next-line
  }, [tab]);

  // Fetch attendance
  const fetchAttendance = async (page = 1, replace = false) => {
    if (attendanceLoading || !attendanceHasMore) return;
    setAttendanceLoading(true);
    try {
      const res = await api.request(`/attendance?page=${page}`);
      const newData = res.data || [];
      setAttendance(replace ? newData : [...attendance, ...newData]);
      setAttendancePage(page);
      setAttendanceHasMore(res.meta?.current_page < res.meta?.last_page);
    } catch {
      setAttendanceHasMore(false);
    }
    setAttendanceLoading(false);
  };
  // Fetch grades
  const fetchGrades = async (page = 1, replace = false) => {
    if (gradesLoading || !gradesHasMore) return;
    setGradesLoading(true);
    try {
      const res = await api.request(`/results?page=${page}`);
      const newData = res.data || [];
      setGrades(replace ? newData : [...grades, ...newData]);
      setGradesPage(page);
      setGradesHasMore(res.meta?.current_page < res.meta?.last_page);
    } catch {
      setGradesHasMore(false);
    }
    setGradesLoading(false);
  };

  // Renderers
  const renderAttendanceItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.listLabel}>{item.date || 'Date'}</Text>
      <Text style={styles.listValue}>{item.status || '-'}</Text>
    </View>
  );
  const renderGradeItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.listLabel}>{item.subject_name || item.subject || 'Subject'}</Text>
      <Text style={styles.listValue}>{item.grade || item.score || '-'}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Portal</Text>
        <Text style={styles.user}>{user?.name}</Text>
      </View>
      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        {tab === 'class' && (
          <View style={styles.card}><Text>Class info placeholder (read-only)</Text></View>
        )}
        {tab === 'timetable' && (
          <View style={styles.card}><Text>Timetable placeholder (read-only)</Text></View>
        )}
        {tab === 'grades' && (
          <View style={styles.card}>
            <FlatList
              data={grades}
              keyExtractor={(item, i) => item.id?.toString() || i.toString()}
              renderItem={renderGradeItem}
              onEndReached={() => gradesHasMore && fetchGrades(gradesPage + 1)}
              onEndReachedThreshold={0.5}
              ListFooterComponent={gradesLoading ? <ActivityIndicator color={theme.colors.primary} /> : null}
              ListEmptyComponent={!gradesLoading ? <Text style={styles.emptyText}>No results found.</Text> : null}
            />
          </View>
        )}
        {tab === 'attendance' && (
          <View style={styles.card}>
            <FlatList
              data={attendance}
              keyExtractor={(item, i) => item.id?.toString() || i.toString()}
              renderItem={renderAttendanceItem}
              onEndReached={() => attendanceHasMore && fetchAttendance(attendancePage + 1)}
              onEndReachedThreshold={0.5}
              ListFooterComponent={attendanceLoading ? <ActivityIndicator color={theme.colors.primary} /> : null}
              ListEmptyComponent={!attendanceLoading ? <Text style={styles.emptyText}>No attendance records found.</Text> : null}
            />
          </View>
        )}
        <Button
          title="Send Feedback"
          onPress={() => navigation.navigate("FeedbackScreen", { student: user })}
        />
        <Button
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          onPress={toggleTheme}
          color={colors.accent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.primary },
  title: { color: theme.colors.white, fontSize: theme.font.size.xl, fontWeight: theme.font.weight.bold },
  user: { color: theme.colors.white, fontSize: theme.font.size.md },
  tabRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: theme.colors.surface, paddingVertical: theme.spacing.sm },
  tabBtn: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, borderRadius: theme.radius.lg },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabText: { color: theme.colors.text, fontWeight: '600' },
  tabTextActive: { color: theme.colors.white },
  content: { flex: 1, padding: theme.spacing.md },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radius.md, padding: theme.spacing.lg, alignItems: 'stretch', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.surface },
  listLabel: { color: theme.colors.text, fontSize: theme.font.size.md },
  listValue: { color: theme.colors.primary, fontWeight: theme.font.weight.bold, fontSize: theme.font.size.md },
  emptyText: { color: theme.colors.text, textAlign: 'center', marginTop: theme.spacing.lg },
}); 