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
import React, { useState } from 'react';

// Deployment trigger - $(date)

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
          <Route path="/classes" element={<PrivateRoute><ClassesPage /></PrivateRoute>} />
          <Route path="/subjects" element={<PrivateRoute><SubjectsPage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
          <Route path="/my-classes" element={<PrivateRoute><MyClassesPage /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
          <Route path="/exams" element={<PrivateRoute><ExamsPage /></PrivateRoute>} />
          <Route path="/results" element={<PrivateRoute><ResultsPage /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
          <Route path="/my-subjects" element={<PrivateRoute><MySubjectsPage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
          <Route path="/my-children" element={<PrivateRoute><MyChildrenPage /></PrivateRoute>} />
          <Route path="/timetable" element={<PrivateRoute><TimetablePage /></PrivateRoute>} />
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
    </AuthProvider>
  );
}
// Deployment trigger - 10/07/2025  6:19:33.49 
