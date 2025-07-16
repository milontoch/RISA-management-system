import React, { useState } from 'react';
import { useAuth } from './auth';
import { useEffect } from 'react';
import apiService from './services/api';
import StudentPortalFeedbackButton from "./StudentPortalFeedbackButton";
import ThemeToggle from "./components/ThemeToggle";
import UpcomingEvents from "./components/UpcomingEvents";
import NotificationsBell from "./components/NotificationsBell";
import ClassMaterialsPage from "./ClassMaterialsPage";

const TABS = [
  { key: 'class', label: 'Class Info' },
  { key: 'timetable', label: 'Timetable' },
  { key: 'grades', label: 'Grades' },
  { key: 'attendance', label: 'Attendance' },
];

export default function StudentPortal() {
  const { user } = useAuth();
  const [tab, setTab] = useState('class');
  // Attendance pagination state
  const [attendance, setAttendance] = useState([]);
  const [attendanceMeta, setAttendanceMeta] = useState({ current_page: 1, last_page: 1 });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  // Results pagination state
  const [results, setResults] = useState([]);
  const [resultsMeta, setResultsMeta] = useState({ current_page: 1, last_page: 1 });
  const [resultsLoading, setResultsLoading] = useState(false);

  // Fetch attendance
  useEffect(() => {
    if (tab === 'attendance') fetchAttendance(attendanceMeta.current_page);
    // eslint-disable-next-line
  }, [tab]);
  const fetchAttendance = async (page = 1) => {
    setAttendanceLoading(true);
    try {
      const res = await apiService.request(`/attendance?page=${page}`);
      setAttendance(res.data || []);
      setAttendanceMeta(res.meta || { current_page: 1, last_page: 1 });
    } catch {
      setAttendance([]);
      setAttendanceMeta({ current_page: 1, last_page: 1 });
    }
    setAttendanceLoading(false);
  };
  // Fetch results
  useEffect(() => {
    if (tab === 'grades') fetchResults(resultsMeta.current_page);
    // eslint-disable-next-line
  }, [tab]);
  const fetchResults = async (page = 1) => {
    setResultsLoading(true);
    try {
      const res = await apiService.request(`/results?page=${page}`);
      setResults(res.data || []);
      setResultsMeta(res.meta || { current_page: 1, last_page: 1 });
    } catch {
      setResults([]);
      setResultsMeta({ current_page: 1, last_page: 1 });
    }
    setResultsLoading(false);
  };
  // Pagination controls
  const renderPagination = (meta, onPage) => (
    <div className="flex gap-2 justify-center mt-4">
      <button
        className="px-3 py-1 rounded bg-oysterglow-surface text-oysterglow-dark disabled:opacity-50"
        onClick={() => onPage(meta.current_page - 1)}
        disabled={meta.current_page <= 1}
      >Previous</button>
      {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          className={`px-3 py-1 rounded ${meta.current_page === page ? 'bg-blue-700 text-white' : 'bg-oysterglow-surface text-oysterglow-dark'}`}
          onClick={() => onPage(page)}
          disabled={meta.current_page === page}
        >{page}</button>
      ))}
      <button
        className="px-3 py-1 rounded bg-oysterglow-surface text-oysterglow-dark disabled:opacity-50"
        onClick={() => onPage(meta.current_page + 1)}
        disabled={meta.current_page >= meta.last_page}
      >Next</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Portal</h1>
        <span className="text-gray-600 font-medium">{user?.name}</span>
      </div>
      <nav className="flex gap-4 border-b mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`py-2 px-4 font-semibold border-b-2 ${tab === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <ThemeToggle />
        <NotificationsBell />
      </nav>
      <div className="mt-4">
        {tab === 'class' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Assigned Class</h2>
            <div className="bg-gray-50 p-4 rounded">Class info placeholder (read-only)</div>
          </div>
        )}
        {tab === 'timetable' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Timetable</h2>
            <div className="bg-gray-50 p-4 rounded">Timetable placeholder (read-only)</div>
          </div>
        )}
        {tab === 'grades' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Grades</h2>
            {resultsLoading ? (
              <div className="text-center py-8 text-oysterglow-dark">Loading...</div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-oysterglow-dark">No results found.</div>
            ) : (
              <div>
                <ul className="divide-y divide-oysterglow-surface">
                  {results.map((r, i) => (
                    <li key={r.id || i} className="py-3 px-2 flex justify-between">
                      <span>{r.subject_name || r.subject || 'Subject'}</span>
                      <span className="font-bold">{r.grade || r.score || '-'}</span>
                    </li>
                  ))}
                </ul>
                {renderPagination(resultsMeta, fetchResults)}
              </div>
            )}
          </div>
        )}
        {tab === 'attendance' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Attendance History</h2>
            {attendanceLoading ? (
              <div className="text-center py-8 text-oysterglow-dark">Loading...</div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-8 text-oysterglow-dark">No attendance records found.</div>
            ) : (
              <div>
                <ul className="divide-y divide-oysterglow-surface">
                  {attendance.map((a, i) => (
                    <li key={a.id || i} className="py-3 px-2 flex justify-between">
                      <span>{a.date || 'Date'}</span>
                      <span className="font-bold">{a.status || '-'}</span>
                    </li>
                  ))}
                </ul>
                {renderPagination(attendanceMeta, fetchAttendance)}
              </div>
            )}
          </div>
        )}
        {tab === 'class-materials' && (
          <ClassMaterialsPage />
        )}
      </div>
      <StudentPortalFeedbackButton student={user} />
      {/* Optional: Upcoming Events section */}
      <UpcomingEvents />
    </div>
  );
} 