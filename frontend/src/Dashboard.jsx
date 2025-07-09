import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import apiService from './services/api';

const roleConfigs = {
  admin: {
    color: 'bg-blue-600',
    header: 'Admin Dashboard',
    nav: [
      { label: 'Manage Users', to: '/users' },
      { label: 'Classes', to: '/classes' },
      { label: 'Subjects', to: '/subjects' },
      { label: 'Teachers', to: '/teachers' },
      { label: 'Students', to: '/students' },
      { label: 'Exams', to: '/exams' },
      { label: 'Reports', to: '/reports' },
      { label: 'Attendance', to: '/attendance' },
      { label: 'Timetable', to: '/timetable' },
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
      { label: 'My Subjects', to: '/my-subjects' },
      { label: 'Attendance', to: '/attendance' },
      { label: 'Exams', to: '/exams' },
      { label: 'Results', to: '/results' },
      { label: 'Messages', to: '/messages' },
    ],
    summary: [
      { label: 'My Classes', value: '...' },
      { label: 'My Subjects', value: '...' },
      { label: 'Total Students', value: '...' },
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
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      if (user) {
        setLoading(true);
        try {
          const data = await apiService.getDashboard();
          if (data.success) {
            setDashboardData(data.data);
          }
        } catch (err) {
          setError('Failed to load dashboard data');
          console.error('Dashboard error:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchDashboardData();
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
      
      <nav className="bg-white shadow flex gap-4 px-4 py-3 border-b overflow-x-auto">
        {config.nav.map(link => (
          <Link key={link.to} to={link.to} className="text-blue-700 hover:underline font-medium whitespace-nowrap">
            {link.label}
          </Link>
        ))}
      </nav>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {dashboardData && dashboardData.summary ? (
                Object.entries(dashboardData.summary).map(([key, value]) => (
                  <div key={key} className="bg-white rounded shadow p-6 text-center">
                    <div className="text-lg font-semibold mb-2">{key.replace(/_/g, ' ').toUpperCase()}</div>
                    <div className="text-2xl font-bold text-blue-600">{value}</div>
                  </div>
                ))
              ) : (
                config.summary.map((item, i) => (
                  <div key={i} className="bg-white rounded shadow p-6 text-center">
                    <div className="text-lg font-semibold mb-2">{item.label}</div>
                    <div className="text-2xl font-bold text-gray-400">{item.value}</div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Activity Section */}
            {dashboardData && dashboardData.recent_activity && (
              <div className="bg-white rounded shadow p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {dashboardData.recent_activity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                      </div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {config.nav.slice(0, 4).map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded text-center transition-colors"
                  >
                    <div className="font-medium">{link.label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
} 