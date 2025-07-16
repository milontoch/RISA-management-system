import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import { AuthProvider, useAuth } from './auth.jsx';
import UsersPage from './UsersPage';
import ClassesPage from './ClassesPage';
import SubjectsPage from './SubjectsPage';
import ReportsPage from './ReportsPage';
import MyClassesPage from './MyClassesPage';
import AttendancePage from './AttendancePage';
import ExamsPage from './ExamsPage';
import ResultsPage from './ResultsPage';
import MessagesPage from './MessagesPage';
import MySubjectsPage from './MySubjectsPage';
import NotificationsPage from './NotificationsPage';
import MyChildrenPage from './MyChildrenPage';
import TimetablePage from './TimetablePage';
import React, { useState, useEffect } from 'react';
import TeachersPage from './TeachersPage';
import StudentsPage from './StudentsPage';
import SettingsPage from './SettingsPage';
import Toast from './Toast';
import { subscribeToApiErrors } from './services/api';
import StudentPortal from './StudentPortal';
import AutoLogoutProvider from "./components/AutoLogoutProvider";
import ForbiddenPage from "./ForbiddenPage";

// Deployment trigger - $(date)

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/forbidden" />;
  return children;
}
function TeacherRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'teacher') return <Navigate to="/forbidden" />;
  return children;
}
function HeadTeacherRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!(user.role === 'teacher' && user.is_head_teacher)) return <Navigate to="/forbidden" />;
  return children;
}
function StudentRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'student') return <Navigate to="/forbidden" />;
  return children;
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Subscribe to API errors
    subscribeToApiErrors(err => {
      if (err.code === 'network') {
        setOffline(true);
      } else if (err.message) {
        setToast({ message: err.message, type: err.code === 422 ? 'error' : (err.code === 401 || err.code === 403 ? 'error' : 'error') });
      }
    });
    // Listen for online/offline
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <AutoLogoutProvider>
        <Router>
          {offline && (
            <div className="fixed top-0 left-0 w-full bg-yellow-500 text-white text-center py-2 z-50">You are offline</div>
          )}
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
            <Route path="/students/promote" element={<AdminRoute><StudentsPage promoteOnly={true} /></AdminRoute>} />
            <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
            <Route path="/teachers" element={<AdminRoute><TeachersPage /></AdminRoute>} />
            <Route path="/students" element={<AdminRoute><StudentsPage /></AdminRoute>} />
            <Route path="/attendance" element={<TeacherRoute><AttendancePage /></TeacherRoute>} />
            <Route path="/attendance/history" element={<HeadTeacherRoute><AttendancePage historyOnly={true} /></HeadTeacherRoute>} />
            <Route path="/student-portal" element={<StudentRoute><StudentPortal /></StudentRoute>} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            {/* Add more protected routes here as needed */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
        {/* Mobile Nav */}
        <nav className="bg-blue-700 text-white p-4 flex items-center justify-between md:hidden">
          <span className="font-bold text-lg">RISA</span>
          <button className="button-touch" onClick={() => setNavOpen(o => !o)} aria-label="Open navigation">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </nav>
        {navOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 md:hidden" onClick={() => setNavOpen(false)}>
            <div className="bg-white w-64 h-full shadow-lg p-6" onClick={e => e.stopPropagation()}>
              {/* Add your navigation links here */}
              {/* Example: */}
              <a href="/" className="block py-3 px-2 text-blue-700 font-semibold">Dashboard</a>
              <a href="/reports" className="block py-3 px-2 text-blue-700 font-semibold">Reports</a>
              <a href="/calendar" className="block py-3 px-2 text-blue-700 font-semibold">Calendar</a>
              {/* ...other links... */}
            </div>
          </div>
        )}
        {/* Main content wrapper for responsiveness */}
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {/* ...existing routes/content... */}
        </div>
      </AutoLogoutProvider>
    </AuthProvider>
  );
}
// Deployment trigger - 10/07/2025  6:19:33.49 
