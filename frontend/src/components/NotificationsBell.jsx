// Optional: In-app Notifications (mock)
import React, { useState } from "react";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  // Mock notifications
  const notifications = [
    { id: 1, message: "Result uploaded" },
    { id: 2, message: "Attendance low this month" },
  ];
  return (
    <div className="relative inline-block">
      <button
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-shadowmauve-surface"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <span role="img" aria-label="bell">🔔</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-shadowmauve-surface shadow-lg rounded p-2 z-50">
          <div className="font-bold mb-2">Notifications</div>
          {notifications.length === 0 ? (
            <div className="text-gray-500">No notifications</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="mb-1 text-sm">{n.message}</div>
            ))
          )}
          {/* Replace with real notifications later */}
        </div>
      )}
    </div>
  );
} 