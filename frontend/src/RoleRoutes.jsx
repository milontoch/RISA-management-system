import { Navigate } from 'react-router-dom';
import { useAuth } from './auth';

export function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/forbidden" />;
  return children;
}

export function TeacherRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'teacher') return <Navigate to="/forbidden" />;
  return children;
}

export function HeadTeacherRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!(user.role === 'teacher' && user.is_head_teacher)) return <Navigate to="/forbidden" />;
  return children;
}

export function StudentRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'student') return <Navigate to="/forbidden" />;
  return children;
} 