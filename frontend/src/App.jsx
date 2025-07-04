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

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
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
          {/* Add more protected routes here as needed */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
