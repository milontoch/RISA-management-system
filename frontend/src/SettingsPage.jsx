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

export default function SettingsPage() {
  const [years, setYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [newYear, setNewYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchYears = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/academic-years');
      setYears(res.data.data);
      const active = res.data.data.find(y => y.is_active);
      setActiveYear(active);
    } catch (e) {
      setError('Failed to load academic years');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newYear.trim()) return setError('Year name required');
    setLoading(true);
    try {
      const res = await api.post('/academic-years', { name: newYear, is_active: true });
      setSuccess('Academic year created and set active');
      setNewYear('');
      fetchYears();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create year');
    }
    setLoading(false);
  };

  const handleSetActive = async id => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post(`/academic-years/${id}/toggle-active`);
      setSuccess('Academic year set as active');
      fetchYears();
    } catch (e) {
      setError('Failed to set active year');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Academic Year Settings</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 mb-2 rounded">{success}</div>}
      <div className="mb-6">
        <div className="font-semibold">Current Academic Year:</div>
        <div className="text-lg text-blue-700 font-bold">
          {activeYear ? activeYear.name : 'None'}
        </div>
      </div>
      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          className="border rounded px-3 py-2 flex-1"
          placeholder="e.g. 2024/2025"
          value={newYear}
          onChange={e => setNewYear(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Create & Set Active
        </button>
      </form>
      <div>
        <div className="font-semibold mb-2">All Academic Years</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Year</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {years.map(year => (
                <tr key={year.id} className={year.is_active ? 'bg-blue-50 font-bold' : ''}>
                  <td className="py-2 px-4">{year.name}</td>
                  <td className="py-2 px-4">
                    {year.is_active ? (
                      <span className="text-green-700">Active</span>
                    ) : (
                      <span className="text-gray-500">Archived</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {!year.is_active && (
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() => handleSetActive(year.id)}
                        disabled={loading}
                      >
                        Set Active
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {years.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-400">No academic years found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 