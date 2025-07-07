import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';

export default function ExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: '', name: '', class_id: '', date: '' });
  const [formMode, setFormMode] = useState('create');
  const [formStatus, setFormStatus] = useState(null);
  const [classes, setClasses] = useState([]);

  // Fetch exams and classes
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => setExams(data.data || []))
      .catch(() => setError('Failed to fetch exams'))
      .finally(() => setLoading(false));
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => setClasses(data.data || []));
  }, []);

  // Handle form submit (create/update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null);
    const method = formMode === 'create' ? 'POST' : 'PUT';
    const url = '/api/exams';
    const body = formMode === 'create'
      ? { name: form.name, class_id: form.class_id, date: form.date }
      : { id: form.id, name: form.name, class_id: form.class_id, date: form.date };
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      setFormStatus({ type: 'success', message: `Exam ${formMode === 'create' ? 'created' : 'updated'}!` });
      setForm({ id: '', name: '', class_id: '', date: '' });
      setFormMode('create');
      // Refetch exams
      fetch('/api/exams')
        .then(res => res.json())
        .then(data => setExams(data.data || []));
    } else {
      setFormStatus({ type: 'error', message: data.message || 'Failed to save exam.' });
    }
  };

  // Handle edit
  const handleEdit = (exam) => {
    setForm({ id: exam.id, name: exam.name, class_id: exam.class_id, date: exam.date });
    setFormMode('edit');
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    const res = await fetch('/api/exams', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      setExams(exams.filter(e => e.id !== id));
    } else {
      alert(data.message || 'Failed to delete exam.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Exams</h2>
      <div className="bg-white border rounded shadow p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2">All Exams</h3>
        {loading ? (
          <div className="text-gray-500">Loading exams...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Class</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  {(user?.role === 'teacher' || user?.role === 'admin') && <th className="py-2 px-4">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-gray-500 py-4">No exams found.</td></tr>
                ) : (
                  exams.map(exam => (
                    <tr key={exam.id}>
                      <td className="py-2 px-4">{exam.name}</td>
                      <td className="py-2 px-4">{exam.class_name}</td>
                      <td className="py-2 px-4">{exam.date}</td>
                      {(user?.role === 'teacher' || user?.role === 'admin') && (
                        <td className="py-2 px-4">
                          <button className="text-blue-600 hover:underline mr-2 button-touch" onClick={() => handleEdit(exam)}>Edit</button>
                          <button className="text-red-600 hover:underline button-touch" onClick={() => handleDelete(exam.id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {(user?.role === 'teacher' || user?.role === 'admin') && (
        <div className="bg-white border rounded shadow p-4">
          <h3 className="text-lg font-semibold mb-2">{formMode === 'create' ? 'Create Exam' : 'Edit Exam'}</h3>
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4">
            <input
              type="text"
              className="border rounded px-2 py-1 flex-1"
              placeholder="Exam Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <select
              className="border rounded px-2 py-1 flex-1"
              value={form.class_id}
              onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
              required
            >
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              type="date"
              className="border rounded px-2 py-1 flex-1"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 button-touch">{formMode === 'create' ? 'Create' : 'Update'}</button>
          </form>
          {formStatus && (
            <div className={`mt-2 ${formStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{formStatus.message}</div>
          )}
        </div>
      )}
    </div>
  );
} 