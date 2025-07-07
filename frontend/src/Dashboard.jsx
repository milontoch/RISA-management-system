import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './auth.jsx';

const roleConfigs = {
  admin: {
    color: 'bg-blue-600',
    header: 'Admin Dashboard',
    nav: [
      { label: 'Manage Users', to: '/users' },
      { label: 'Classes', to: '/classes' },
      { label: 'Subjects', to: '/subjects' },
      { label: 'Reports', to: '/reports' },
      { label: 'Attendance', to: '/attendance' }, // Added attendance link
      { label: 'Timetable', to: '/timetable' }, // Added timetable link
    ],
    summary: [
      { label: 'Total Users', value: '...' },
      { label: 'Active Classes', value: '...' },
      { label: 'Subjects', value: '...' },
    ],
  },
  teacher: {
    color: 'bg-green-600',
    header: 'Teacher Dashboard',
    nav: [
      { label: 'My Classes', to: '/my-classes' },
      { label: 'Attendance', to: '/attendance' },
      { label: 'Exams', to: '/exams' },
      { label: 'Results', to: '/results' },
      { label: 'Messages', to: '/messages' },
    ],
    summary: [
      { label: 'My Classes', value: '...' },
      { label: 'Pending Attendance', value: '...' },
    ],
  },
  student: {
    color: 'bg-purple-600',
    header: 'Student Dashboard',
    nav: [
      { label: 'My Subjects', to: '/my-subjects' },
      { label: 'Results', to: '/results' },
      { label: 'Attendance', to: '/attendance' },
      { label: 'Notifications', to: '/notifications' },
    ],
    summary: [
      { label: 'Subjects', value: '...' },
      { label: 'Attendance %', value: '...' },
    ],
  },
  parent: {
    color: 'bg-yellow-600',
    header: 'Parent Dashboard',
    nav: [
      { label: 'My Children', to: '/my-children' },
      { label: 'Results', to: '/results' },
      { label: 'Attendance', to: '/attendance' },
      { label: 'Messages', to: '/messages' },
    ],
    summary: [
      { label: 'Children', value: '...' },
      { label: 'Unread Messages', value: '...' },
    ],
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAttendanceStatus() {
      if (user && user.is_class_teacher) {
        setLoading(true);
        // 1. Get assigned class
        const res1 = await fetch(`/api/users/class-teacher-class?user_id=${user.id}`);
        const data1 = await res1.json();
        if (data1.success && data1.class_id) {
          setClassInfo(data1.class_id);
          // 2. Check attendance status
          const today = new Date().toISOString().slice(0, 10);
          const res2 = await fetch(`/api/attendance/is-morning-done?class_id=${data1.class_id}&date=${today}`);
          const data2 = await res2.json();
          setAttendanceStatus(data2);
        }
        setLoading(false);
      }
    }
    fetchAttendanceStatus();
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }
  const config = roleConfigs[user.role] || roleConfigs['student'];
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Attendance card for class teacher
  const showAttendanceCard = user.is_class_teacher && classInfo;

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${config.color}/10`}>
      <header className={`${config.color} text-white py-6 shadow-md`}> 
        <div className="container mx-auto flex justify-between items-center px-4">
          <h2 className="text-2xl font-bold">{config.header}</h2>
          <div className="flex items-center gap-4">
            <span className="font-semibold">{user.name}</span>
            <button onClick={handleLogout} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-200">Logout</button>
          </div>
        </div>
      </header>
      <nav className="bg-white shadow flex gap-4 px-4 py-3 border-b">
        {config.nav.map(link => (
          <Link key={link.to} to={link.to} className="text-blue-700 hover:underline font-medium">
            {link.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 container mx-auto px-4 py-8">
        {showAttendanceCard && (
          <div className="mb-8 flex justify-center">
            <div className={`rounded shadow-lg p-6 w-full max-w-xl text-center border-2 ${attendanceStatus && attendanceStatus.done ? 'border-green-400 bg-green-50' : 'border-yellow-400 bg-yellow-50'}`}>
              {loading ? (
                <div className="text-gray-500">Checking attendance status...</div>
              ) : attendanceStatus && attendanceStatus.done ? (
                <>
                  <div className="text-2xl font-bold text-green-700 mb-2">✅ Attendance complete for today!</div>
                  <div className="text-gray-700">You have submitted attendance for your class.</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-yellow-700 mb-2">🗓️ Morning Attendance Required</div>
                  <div className="text-gray-700 mb-4">You have not yet submitted attendance for your class today.</div>
                  <button onClick={() => navigate(`/attendance?class_id=${classInfo}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-semibold shadow button-touch">Take Morning Attendance</button>
                </>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {config.summary.map((item, i) => (
            <div key={i} className="bg-white rounded shadow p-6 text-center">
              <div className="text-lg font-semibold mb-2">{item.label}</div>
              <div className="text-2xl font-bold">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="text-gray-600 text-center">Welcome to your dashboard!</div>
      </main>
    </div>
  );
} 