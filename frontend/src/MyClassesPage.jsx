import React, { useEffect, useState } from 'react';

export default function MyClassesPage() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null); // teacher object or null
  const [showView, setShowView] = useState(null); // teacher object or null
  const [showDelete, setShowDelete] = useState(null); // teacher object or null
  const [form, setForm] = useState({ name: '', email: '', password: '', subject_ids: [] });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch teachers
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (data.success && data.data) {
        setTeachers(data.data);
      } else {
        setError(data.message || 'Failed to fetch teachers');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    const res = await fetch('/api/subjects');
    const data = await res.json();
    if (data.success && data.data) setSubjects(data.data);
  };

  useEffect(() => { fetchTeachers(); fetchSubjects(); }, []);

  // Add Teacher
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    // 1. Create user
    const userRes = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: 'teacher' })
    });
    const userData = await userRes.json();
    if (!userData.success || !userData.user_id) {
      setFormError(userData.message || 'Failed to create user');
      setFormLoading(false);
      return;
    }
    // 2. Create teacher
    const teacherRes = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userData.user_id, subject_ids: form.subject_ids })
    });
    const teacherData = await teacherRes.json();
    if (!teacherData.success) {
      setFormError(teacherData.message || 'Failed to create teacher');
      setFormLoading(false);
      return;
    }
    setShowAdd(false);
    setForm({ name: '', email: '', password: '', subject_ids: [] });
    fetchTeachers();
    setFormLoading(false);
  };

  // Edit Teacher
  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    const res = await fetch('/api/teachers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: showEdit.id, subject_ids: form.subject_ids })
    });
    const data = await res.json();
    if (!data.success) {
      setFormError(data.message || 'Failed to update teacher');
      setFormLoading(false);
      return;
    }
    setShowEdit(null);
    setForm({ name: '', email: '', password: '', subject_ids: [] });
    fetchTeachers();
    setFormLoading(false);
  };

  // Delete Teacher
  const handleDelete = async () => {
    if (!showDelete) return;
    setFormLoading(true);
    const res = await fetch('/api/teachers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: showDelete.id })
    });
    const data = await res.json();
    setShowDelete(null);
    fetchTeachers();
    setFormLoading(false);
  };

  // Open edit form
  const openEdit = (teacher) => {
    setShowEdit(teacher);
    setForm({
      name: teacher.name,
      email: teacher.email,
      password: '',
      subject_ids: teacher.subject_ids || []
    });
  };

  // Open view
  const openView = (teacher) => setShowView(teacher);

  // Handle subject selection
  const handleSubjectChange = (e) => {
    const options = Array.from(e.target.options);
    setForm(f => ({ ...f, subject_ids: options.filter(o => o.selected).map(o => o.value) }));
  };

  // Render
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Teacher Management</h2>
      {/* Teacher List Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">All Teachers</h3>
        <div className="bg-white border rounded shadow p-4">
          {loading ? (
            <div className="text-gray-500">Loading teachers...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : teachers.length === 0 ? (
            <div className="text-gray-500">No teachers found.</div>
          ) : (
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Subjects</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{t.name}</td>
                    <td className="py-2 px-3">{t.email}</td>
                    <td className="py-2 px-3">{Array.isArray(t.subject_ids) && t.subject_ids.length > 0 ? t.subject_ids.join(', ') : '-'}</td>
                    <td className="py-2 px-3">
                      <button className="text-blue-600 hover:underline mr-2" onClick={() => openView(t)}>View</button>
                      <button className="text-green-600 hover:underline mr-2" onClick={() => openEdit(t)}>Edit</button>
                      <button className="text-red-600 hover:underline" onClick={() => setShowDelete(t)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow" onClick={() => { setShowAdd(true); setForm({ name: '', email: '', password: '', subject_ids: [] }); }}>Add Teacher</button>
      </div>
      {/* Add Teacher Form */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow-lg p-8 w-full max-w-md relative" onSubmit={handleAdd}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowAdd(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Add New Teacher</h3>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Name</label>
              <input className="w-full border rounded px-3 py-2" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Email</label>
              <input className="w-full border rounded px-3 py-2" required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Password</label>
              <input className="w-full border rounded px-3 py-2" required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Subjects</label>
              <select className="w-full border rounded px-3 py-2" multiple value={form.subject_ids} onChange={handleSubjectChange}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</div>
            </div>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow w-full" disabled={formLoading}>{formLoading ? 'Adding...' : 'Add Teacher'}</button>
          </form>
        </div>
      )}
      {/* Edit Teacher Form */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow-lg p-8 w-full max-w-md relative" onSubmit={handleEdit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowEdit(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Edit Teacher</h3>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Subjects</label>
              <select className="w-full border rounded px-3 py-2" multiple value={form.subject_ids} onChange={handleSubjectChange}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</div>
            </div>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded shadow w-full" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}
      {/* View Teacher Profile */}
      {showView && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowView(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Teacher Profile</h3>
            <div className="mb-2"><span className="font-medium">Name:</span> {showView.name}</div>
            <div className="mb-2"><span className="font-medium">Email:</span> {showView.email}</div>
            <div className="mb-2"><span className="font-medium">Subjects:</span> {Array.isArray(showView.subject_ids) && showView.subject_ids.length > 0 ? showView.subject_ids.join(', ') : '-'}</div>
            <div className="mb-2"><span className="font-medium">Created At:</span> {showView.created_at}</div>
          </div>
        </div>
      )}
      {/* Delete Teacher Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowDelete(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-red-700">Delete Teacher</h3>
            <div className="mb-4">Are you sure you want to delete <span className="font-semibold">{showDelete.name}</span>?</div>
            <button className="bg-red-600 text-white px-4 py-2 rounded shadow mr-2" onClick={handleDelete} disabled={formLoading}>{formLoading ? 'Deleting...' : 'Yes, Delete'}</button>
            <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded shadow" onClick={() => setShowDelete(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 