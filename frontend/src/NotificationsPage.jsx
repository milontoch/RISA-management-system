import React, { useEffect, useState } from 'react';
import { useAuth } from './auth.jsx';
import apiService from './services/api';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      if (user) {
        setLoading(true);
        try {
          const data = await apiService.getNotifications({ user_id: user.id });
          if (data.success && data.notifications) {
            setNotifications(data.notifications);
          }
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [user]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Notifications</h2>
      <div className="bg-white border rounded shadow p-4">
        {loading ? (
          <div className="text-gray-500">Loading notifications...</div>
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