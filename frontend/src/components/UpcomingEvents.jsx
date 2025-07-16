// Optional: Upcoming Events section (mock)
import React, { useEffect, useState } from "react";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    // Mock fetch from /events API
    setTimeout(() => {
      setEvents([
        { id: 1, title: "Math Exam", date: "2024-08-01" },
        { id: 2, title: "Science Fair", date: "2024-08-05" },
        { id: 3, title: "Holiday: Independence Day", date: "2024-08-10" },
      ]);
    }, 500);
  }, []);
  return (
    <div className="bg-white dark:bg-shadowmauve-surface rounded shadow p-4 my-4">
      <h3 className="font-bold mb-2">Upcoming Events</h3>
      {events.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {events.map(e => (
            <li key={e.id} className="mb-1">
              <span className="font-medium">{e.title}</span> <span className="text-gray-500">({e.date})</span>
            </li>
          ))}
        </ul>
      )}
      {/* Replace with real API later */}
    </div>
  );
} 