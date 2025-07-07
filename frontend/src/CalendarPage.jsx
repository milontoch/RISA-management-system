import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';

function getGoogleCalendarUrl(event) {
  const start = encodeURIComponent(event.date + 'T09:00:00');
  const end = encodeURIComponent(event.date + 'T10:00:00');
  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description || '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([
    // Mock events
    { id: 1, title: 'School Holiday', date: '2024-06-10', description: 'Public holiday', created_by_role: 'admin', created_by: 2 },
    { id: 2, title: 'Math Test', date: '2024-06-12', description: 'Unit test for class 10A', created_by_role: 'teacher', created_by: 3 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', date: '', description: '' });
  const [formStatus, setFormStatus] = useState(null);

  // Filter events based on user role
  const visibleEvents = events.filter(e =>
    e.created_by_role === 'admin' ||
    (user?.role === 'teacher' && e.created_by_role === 'teacher' && e.created_by === user.id)
  );

  // Placeholder for backend integration
  useEffect(() => {
    // setLoading(true);
    // fetch('/api/events')
    //   .then(res => res.json())
    //   .then(data => setEvents(data.data || []))
    //   .catch(() => setError('Failed to fetch events'))
    //   .finally(() => setLoading(false));
  }, []);

  // Handle form submit (add event)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormStatus(null);
    if (!form.title || !form.date) {
      setFormStatus({ type: 'error', message: 'Title and date are required.' });
      return;
    }
    // Placeholder for backend POST
    setEvents(evts => [
      ...evts,
      {
        id: Date.now(),
        title: form.title,
        date: form.date,
        description: form.description,
        created_by_role: user.role,
        created_by: user.id
      }
    ]);
    setForm({ title: '', date: '', description: '' });
    setFormStatus({ type: 'success', message: 'Event added!' });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Calendar / Events / Holidays</h2>
      {/* Add Event Form */}
      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <div className="bg-white border rounded shadow p-4 mb-8">
          <h3 className="text-lg font-semibold mb-2">Add Event</h3>
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4 items-end">
            <input type="text" className="border rounded px-2 py-1 flex-1" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <input type="date" className="border rounded px-2 py-1 flex-1" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <input type="text" className="border rounded px-2 py-1 flex-1" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 button-touch">Add Event</button>
          </form>
          {formStatus && <div className={`mt-2 ${formStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{formStatus.message}</div>}
        </div>
      )}
      {/* Events List */}
      <div className="bg-white border rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Events & Holidays</h3>
        {loading ? (
          <div className="text-gray-500">Loading events...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : visibleEvents.length === 0 ? (
          <div className="text-gray-500">No events found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Description</th>
                <th className="py-2 px-4">Add to Calendar</th>
              </tr>
            </thead>
            <tbody>
              {visibleEvents.map(event => (
                <tr key={event.id}>
                  <td className="py-2 px-4">{event.title}</td>
                  <td className="py-2 px-4">{event.date}</td>
                  <td className="py-2 px-4">{event.description}</td>
                  <td className="py-2 px-4">
                    <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Add to Google Calendar</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 