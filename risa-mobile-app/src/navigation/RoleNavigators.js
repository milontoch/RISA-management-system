import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import HeadTeacherDashboardScreen from '../screens/HeadTeacherDashboardScreen';
import StudentPortalScreen from '../screens/StudentPortalScreen';
import UnauthorizedScreen from '../screens/UnauthorizedScreen';
import { useAuth } from '../context/AuthContext';

const AdminStack = createStackNavigator();
const TeacherStack = createStackNavigator();
const HeadTeacherStack = createStackNavigator();
const StudentStack = createStackNavigator();

function AdminNavigator() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      {/* Add other admin screens here */}
    </AdminStack.Navigator>
  );
}

function TeacherNavigator() {
  return (
    <TeacherStack.Navigator>
      <TeacherStack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
      {/* Add other teacher screens here */}
    </TeacherStack.Navigator>
  );
}

function HeadTeacherNavigator() {
  return (
    <HeadTeacherStack.Navigator>
      <HeadTeacherStack.Screen name="HeadTeacherDashboard" component={HeadTeacherDashboardScreen} />
      {/* Add other head teacher screens here */}
    </HeadTeacherStack.Navigator>
  );
}

function StudentNavigator() {
  return (
    <StudentStack.Navigator>
      <StudentStack.Screen name="StudentPortal" component={StudentPortalScreen} />
      {/* Add other student screens here */}
    </StudentStack.Navigator>
  );
}

export default function RoleBasedNavigator() {
  const { user } = useAuth();
  if (!user) return <UnauthorizedScreen />;
  if (user.role === 'admin') return <AdminNavigator />;
  if (user.role === 'teacher' && user.is_head_teacher) return <HeadTeacherNavigator />;
  if (user.role === 'teacher') return <TeacherNavigator />;
  if (user.role === 'student') return <StudentNavigator />;
  return <UnauthorizedScreen />;
} 