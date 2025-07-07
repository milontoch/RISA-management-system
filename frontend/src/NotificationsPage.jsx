import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([
    // Mock data for initial UI
    { id: 1, message: 'Your fee payment is due soon.', date: '2024-06-01', read: false },
    { id: 2, message: 'Exam schedule has been updated.', date: '2024-05-28', read: true },
    { id: 3, message: 'New homework uploaded.', date: '2024-05-25', read: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch real notifications for the logged-in user
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    fetch(`/api/notifications?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setNotifications(data.data);
        } else {
          setError(data.message || 'Failed to fetch notifications');
        }
      })
      .catch(() => setError('Failed to fetch notifications'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Notifications</h2>
      <div className="bg-white border rounded shadow p-4">
        {loading ? (
          <div className="text-gray-500">Loading notifications...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500">No notifications found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Message</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(n => (
                <tr key={n.id} className={n.read ? '' : 'font-semibold bg-blue-50'}>
                  <td className="py-2 px-4">{n.message}</td>
                  <td className="py-2 px-4">{n.date || n.created_at}</td>
                  <td className="py-2 px-4">{n.read ? 'Read' : 'Unread'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 