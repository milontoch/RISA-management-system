import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from './config';

const api = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});

  // Fetch classes and students
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesRes, studentsRes] = await Promise.all([
          api.get('/classes'),
          api.get('/students'),
        ]);
        setClasses(classesRes.data.data);
        setStudents(studentsRes.data.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered students
  const filteredStudents = students.filter(student => {
    const classMatch = selectedClass ? student.class_id === Number(selectedClass) : true;
    const statusMatch = selectedStatus ? student.status === selectedStatus : true;
    return classMatch && statusMatch;
  });

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle select one
  const handleSelectOne = (id) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  // Handle status toggle
  const handleStatusToggle = async (student) => {
    setStatusLoading(prev => ({ ...prev, [student.id]: true }));
    try {
      const newStatus = student.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/students/${student.id}`, { status: newStatus });
      setStudents(students => students.map(s => s.id === student.id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setStatusLoading(prev => ({ ...prev, [student.id]: false }));
    }
  };

  // Handle bulk promote
  const handleBulkPromote = async () => {
    if (!window.confirm('Promote selected students to the next class?')) return;
    setPromoteLoading(true);
    try {
      await api.post('/students/promote');
      // Refetch students after promotion
      const res = await api.get('/students');
      setStudents(res.data.data);
      setSelectedStudents([]);
      alert('Promotion complete!');
    } catch (err) {
      alert('Failed to promote students');
    } finally {
      setPromoteLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
          <select
            className="rounded border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} - Section {c.section}</option>
            ))}
          </select>
          <select
            className="rounded border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleSelectOne(student.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.user?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                    {student.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.classModel ? `${student.classModel.name} - Section ${student.classModel.section}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleStatusToggle(student)}
                    disabled={statusLoading[student.id]}
                    className="px-3 py-1.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                  >
                    {statusLoading[student.id] ? '...' : student.status === 'active' ? 'Set Inactive' : 'Set Active'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {filteredStudents.length} of {students.length} students
        </div>
        <button
          onClick={handleBulkPromote}
          disabled={promoteLoading || selectedStudents.length === 0}
          className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300"
        >
          {promoteLoading ? 'Promoting...' : 'Promote Selected'}
        </button>
      </div>

      {loading && <div className="mt-4 text-center">Loading...</div>}
      {error && <div className="mt-4 text-center text-red-500">{error}</div>}
    </div>
  );
} 