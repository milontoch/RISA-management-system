import React, { useEffect, useState } from 'react';
import { useAuth } from './auth.jsx';

export default function AttendancePage() {
  const { user } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPendingAttendance() {
      if (user && user.role === 'admin') {
        setLoading(true);
        // 1. Get all class teachers
        const res1 = await fetch('/api/users/class-teachers');
        const data1 = await res1.json();
        if (data1.success && data1.class_teachers) {
          const today = new Date().toISOString().slice(0, 10);
          // 2. For each, check attendance
          const pending = [];
          for (const teacher of data1.class_teachers) {
            if (!teacher.class_teacher_of) continue;
            const res2 = await fetch(`/api/attendance/is-morning-done?class_id=${teacher.class_teacher_of}&date=${today}`);
            const data2 = await res2.json();
            if (!data2.done) {
              pending.push({ name: teacher.name, email: teacher.email });
            }
          }
          setPendingTeachers(pending);
        }
        setLoading(false);
      }
    }
    fetchPendingAttendance();
  }, [user]);

  if (!user) return null;

  if (user.role === 'admin') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Attendance Overview</h2>
        {loading ? (
          <div className="text-gray-500">Checking class teacher attendance status...</div>
        ) : pendingTeachers.length === 0 ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-4 rounded shadow text-center">
            All class teachers have completed attendance for today.
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-4 rounded shadow mb-8">
            <div className="font-semibold mb-2">Class teachers who have <span className='text-red-600'>not</span> completed attendance for today:</div>
            <ul className="list-disc pl-6">
              {pendingTeachers.map((t, i) => (
                <li key={i}>{t.name} <span className="text-sm text-gray-500">({t.email})</span></li>
              ))}
            </ul>
          </div>
        )}
        {/* Attendance Report Placeholder */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Attendance Report</h3>
          <div className="bg-white border rounded shadow p-4 text-gray-500">[Attendance report will go here]</div>
        </div>
      </div>
    );
  }

  // For teachers/class teachers/students/parents
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Attendance</h2>
      {/* Mark Attendance Placeholder */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Mark Attendance</h3>
        <div className="bg-white border rounded shadow p-4 text-gray-500">[Mark attendance form/table will go here]</div>
      </div>
      {/* View Attendance Placeholder */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">View Attendance</h3>
        <div className="bg-white border rounded shadow p-4 text-gray-500">[Attendance records will go here]</div>
      </div>
      {/* Attendance Report Placeholder */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Attendance Report</h3>
        <div className="bg-white border rounded shadow p-4 text-gray-500">[Attendance report will go here]</div>
      </div>
    </div>
  );
} 