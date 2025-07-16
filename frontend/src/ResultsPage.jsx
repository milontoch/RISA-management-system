import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';
import ExportButtons from "./components/ExportButtons";

export default function ResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: '', student_id: '', exam_id: '', subject_id: '', marks_obtained: '', total_marks: 100 });
  const [formMode, setFormMode] = useState('create');
  const [formStatus, setFormStatus] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch results, students, exams, subjects
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/results')
      .then(res => res.json())
      .then(data => setResults(data.data || []))
      .catch(() => setError('Failed to fetch results'))
      .finally(() => setLoading(false));
    fetch('/api/students')
      .then(res => res.json())
      .then(data => setStudents(data.users || []));
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => setExams(data.data || []));
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => setSubjects(data.data || []));
  }, []);

  // Handle form submit (create/update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null);
    const method = formMode === 'create' ? 'POST' : 'PUT';
    const url = '/api/results';
    const body = formMode === 'create'
      ? { student_id: form.student_id, exam_id: form.exam_id, subject_id: form.subject_id, marks_obtained: form.marks_obtained, total_marks: form.total_marks }
      : { id: form.id, marks_obtained: form.marks_obtained, total_marks: form.total_marks };
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      setFormStatus({ type: 'success', message: `Result ${formMode === 'create' ? 'created' : 'updated'}!` });
      setForm({ id: '', student_id: '', exam_id: '', subject_id: '', marks_obtained: '', total_marks: 100 });
      setFormMode('create');
      // Refetch results
      fetch('/api/results')
        .then(res => res.json())
        .then(data => setResults(data.data || []));
    } else {
      setFormStatus({ type: 'error', message: data.message || 'Failed to save result.' });
    }
  };

  // Handle edit
  const handleEdit = (result) => {
    setForm({
      id: result.id,
      student_id: result.student_id,
      exam_id: result.exam_id,
      subject_id: result.subject_id,
      marks_obtained: result.marks_obtained,
      total_marks: result.total_marks
    });
    setFormMode('edit');
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    const res = await fetch('/api/results', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      setResults(results.filter(r => r.id !== id));
    } else {
      alert(data.message || 'Failed to delete result.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Results</h2>
      <div className="bg-white border rounded shadow p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2">All Results</h3>
        {loading ? (
          <div className="text-gray-500">Loading results...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="table-responsive">
            <ExportButtons tableId="results-table" filename="results.csv" />
            <table id="results-table" className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Exam</th>
                  <th className="py-2 px-4 text-left">Subject</th>
                  <th className="py-2 px-4 text-left">Marks</th>
                  <th className="py-2 px-4 text-left">Total</th>
                  {(user?.role === 'teacher' || user?.role === 'admin') && <th className="py-2 px-4">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-gray-500 py-4">No results found.</td></tr>
                ) : (
                  results.map(result => (
                    <tr key={result.id}>
                      <td className="py-2 px-4">{result.student_name}</td>
                      <td className="py-2 px-4">{result.exam_name}</td>
                      <td className="py-2 px-4">{result.subject_name}</td>
                      <td className="py-2 px-4">{result.marks_obtained}</td>
                      <td className="py-2 px-4">{result.total_marks}</td>
                      {(user?.role === 'teacher' || user?.role === 'admin') && (
                        <td className="py-2 px-4">
                          <button className="text-blue-600 hover:underline mr-2 button-touch" onClick={() => handleEdit(result)}>Edit</button>
                          <button className="text-red-600 hover:underline button-touch" onClick={() => handleDelete(result.id)}>Delete</button>
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
          <h3 className="text-lg font-semibold mb-2">{formMode === 'create' ? 'Create Result' : 'Edit Result'}</h3>
          <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-4">
            <select
              className="border rounded px-2 py-1 flex-1"
              value={form.student_id}
              onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
              required
            >
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              className="border rounded px-2 py-1 flex-1"
              value={form.exam_id}
              onChange={e => setForm(f => ({ ...f, exam_id: e.target.value }))}
              required
            >
              <option value="">Select Exam</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select
              className="border rounded px-2 py-1 flex-1"
              value={form.subject_id}
              onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input
              type="number"
              className="border rounded px-2 py-1 flex-1"
              placeholder="Marks Obtained"
              value={form.marks_obtained}
              onChange={e => setForm(f => ({ ...f, marks_obtained: e.target.value }))}
              min="0"
              required
            />
            <input
              type="number"
              className="border rounded px-2 py-1 flex-1"
              placeholder="Total Marks"
              value={form.total_marks}
              onChange={e => setForm(f => ({ ...f, total_marks: e.target.value }))}
              min="1"
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