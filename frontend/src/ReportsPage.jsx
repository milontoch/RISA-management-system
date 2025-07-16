import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from './config';

// Reusable API service instance
const api = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for date formatting
const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

export default function AttendanceReportPage() {
  const [reportData, setReportData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({
    class_id: '',
    teacher_id: '',
    start_date: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Default to last 30 days
    end_date: formatDate(new Date()),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial data for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [classesRes, teachersRes] = await Promise.all([
          api.get('/classes'),
          api.get('/teachers'),
        ]);
        setClasses(classesRes.data.data);
        setTeachers(teachersRes.data.data);
      } catch (err) {
        setError('Failed to load filter data.');
      }
    };
    fetchFilterData();
  }, []);

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Generate report
  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);
    try {
      const { class_id, start_date, end_date } = filters;
      if (!start_date || !end_date) {
        setError('Please select a valid date range.');
        setLoading(false);
        return;
      }

      // Backend does not support teacher filter, so we filter after fetching
      const params = { class_id, start_date, end_date };
      const res = await api.get('/attendance/report', { params }); // Assuming this maps to generateReport
      let finalData = res.data.data;

      // Client-side filter for teacher if selected
      if (filters.teacher_id && finalData.attendance_records) {
        finalData.attendance_records = finalData.attendance_records.filter(
          rec => rec.student?.classModel?.head_teacher_id === Number(filters.teacher_id)
        );
      }

      setReportData(finalData);
    } catch (err) {
      setError('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV (optional)
  const exportToCSV = () => {
    if (!reportData || !reportData.attendance_records) return;
    const headers = ['Student', 'Date', 'Status', 'Class'];
    const rows = reportData.attendance_records.map(rec => [
      rec.student.user.name,
      rec.date,
      rec.status,
      `${rec.student.classModel.name} - ${rec.student.classModel.section}`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'attendance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Attendance Report</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Class</label>
          <select name="class_id" value={filters.class_id} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Teacher</label>
          <select name="teacher_id" value={filters.teacher_id} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="">All Teachers</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
        <div className="col-span-full flex justify-end">
          <button onClick={generateReport} disabled={loading} className="px-6 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      {/* Report Display */}
      {reportData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Report Results</h2>
            <button onClick={exportToCSV} className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700">Export CSV</button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-800">{reportData.statistics.attendance_percentage}%</div>
              <div className="text-sm text-blue-600">Overall Attendance</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-800">{reportData.statistics.present_days}</div>
              <div className="text-sm text-green-600">Present Days</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-red-800">{reportData.statistics.absent_days}</div>
              <div className="text-sm text-red-600">Absent Days</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <div className="text-3xl font-bold text-yellow-800">{reportData.statistics.late_days}</div>
              <div className="text-sm text-yellow-600">Late Days</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    </tr>
                  </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.attendance_records.map(rec => (
                  <tr key={rec.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{rec.student?.user?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{rec.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rec.status === 'present' ? 'bg-green-100 text-green-800' : 
                        rec.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rec.status}
                      </span>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{rec.student?.classModel?.name || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
    </div>
  );
} 