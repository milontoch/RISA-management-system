import React, { useEffect, useState } from 'react';

export default function UsersPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null); // student object or null
  const [showView, setShowView] = useState(null); // student object or null
  const [showDelete, setShowDelete] = useState(null); // student object or null
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', class_id: '', section_id: '', roll_number: '' });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success && data.users) {
        setStudents(data.users);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  // Fetch classes
  const fetchClasses = async () => {
    const res = await fetch('/api/classes');
    const data = await res.json();
    if (data.success && data.data) setClasses(data.data);
  };

  // Fetch sections (optionally by class)
  const fetchSections = async (class_id) => {
    let url = '/api/sections';
    if (class_id) url += `?class_id=${class_id}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.data) setSections(data.data);
    else setSections([]);
  };

  useEffect(() => { fetchStudents(); fetchClasses(); }, []);

  // Handle class change in form
  useEffect(() => {
    if (form.class_id) fetchSections(form.class_id);
    else setSections([]);
  }, [form.class_id]);

  // Add Student
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    // 1. Create user
    const userRes = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: 'student' })
    });
    const userData = await userRes.json();
    if (!userData.success || !userData.user_id) {
      setFormError(userData.message || 'Failed to create user');
      setFormLoading(false);
      return;
    }
    // 2. Create student
    const studentRes = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userData.user_id, class_id: form.class_id, section_id: form.section_id, roll_number: form.roll_number })
    });
    const studentData = await studentRes.json();
    if (!studentData.success) {
      setFormError(studentData.message || 'Failed to create student');
      setFormLoading(false);
      return;
    }
    setShowAdd(false);
    setForm({ name: '', email: '', password: '', class_id: '', section_id: '', roll_number: '' });
    fetchStudents();
    setFormLoading(false);
  };

  // Edit Student
  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    const res = await fetch('/api/students', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: showEdit.id, class_id: form.class_id, section_id: form.section_id, roll_number: form.roll_number })
    });
    const data = await res.json();
    if (!data.success) {
      setFormError(data.message || 'Failed to update student');
      setFormLoading(false);
      return;
    }
    setShowEdit(null);
    setForm({ name: '', email: '', password: '', class_id: '', section_id: '', roll_number: '' });
    fetchStudents();
    setFormLoading(false);
  };

  // Delete Student
  const handleDelete = async () => {
    if (!showDelete) return;
    setFormLoading(true);
    const res = await fetch('/api/students', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: showDelete.id })
    });
    const data = await res.json();
    setShowDelete(null);
    fetchStudents();
    setFormLoading(false);
  };

  // Open edit form
  const openEdit = (student) => {
    setShowEdit(student);
    setForm({
      name: student.name,
      email: student.email,
      password: '',
      class_id: student.class_id || '',
      section_id: student.section_id || '',
      roll_number: student.roll_number || ''
    });
  };

  // Open view
  const openView = (student) => setShowView(student);

  // Render
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Student Management</h2>
      {/* Student List Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">All Students</h3>
        <div className="bg-white border rounded shadow p-4">
          {loading ? (
            <div className="text-gray-500">Loading students...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : students.length === 0 ? (
            <div className="text-gray-500">No students found.</div>
          ) : (
            <div className="table-responsive">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Class</th>
                    <th className="py-2 px-3">Section</th>
                    <th className="py-2 px-3">Roll No.</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{s.name}</td>
                      <td className="py-2 px-3">{s.email}</td>
                      <td className="py-2 px-3">{s.class_id || '-'}</td>
                      <td className="py-2 px-3">{s.section_id || '-'}</td>
                      <td className="py-2 px-3">{s.roll_number || '-'}</td>
                      <td className="py-2 px-3">
                        <button className="text-blue-600 hover:underline mr-2" onClick={() => openView(s)}>View</button>
                        <button className="text-green-600 hover:underline mr-2" onClick={() => openEdit(s)}>Edit</button>
                        <button className="text-red-600 hover:underline" onClick={() => setShowDelete(s)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow button-touch" onClick={() => { setShowAdd(true); setForm({ name: '', email: '', password: '', class_id: '', section_id: '', roll_number: '' }); }}>Add Student</button>
      </div>
      {/* Add Student Form */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow-lg p-8 w-full max-w-md relative" onSubmit={handleAdd}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowAdd(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Add New Student</h3>
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
              <label className="block mb-1 font-medium">Class</label>
              <select className="w-full border rounded px-3 py-2" required value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value, section_id: '' }))}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Section</label>
              <select className="w-full border rounded px-3 py-2" required value={form.section_id} onChange={e => setForm(f => ({ ...f, section_id: e.target.value }))}>
                <option value="">Select section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Roll Number</label>
              <input className="w-full border rounded px-3 py-2" required value={form.roll_number} onChange={e => setForm(f => ({ ...f, roll_number: e.target.value }))} />
            </div>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow w-full" disabled={formLoading}>{formLoading ? 'Adding...' : 'Add Student'}</button>
          </form>
        </div>
      )}
      {/* Edit Student Form */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow-lg p-8 w-full max-w-md relative" onSubmit={handleEdit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowEdit(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Edit Student</h3>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Class</label>
              <select className="w-full border rounded px-3 py-2" required value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value, section_id: '' }))}>
                <option value="">Select class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Section</label>
              <select className="w-full border rounded px-3 py-2" required value={form.section_id} onChange={e => setForm(f => ({ ...f, section_id: e.target.value }))}>
                <option value="">Select section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Roll Number</label>
              <input className="w-full border rounded px-3 py-2" required value={form.roll_number} onChange={e => setForm(f => ({ ...f, roll_number: e.target.value }))} />
            </div>
            {formError && <div className="text-red-600 mb-2">{formError}</div>}
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded shadow w-full" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}
      {/* View Student Profile */}
      {showView && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowView(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Student Profile</h3>
            <div className="mb-2"><span className="font-medium">Name:</span> {showView.name}</div>
            <div className="mb-2"><span className="font-medium">Email:</span> {showView.email}</div>
            <div className="mb-2"><span className="font-medium">Class:</span> {showView.class_id || '-'}</div>
            <div className="mb-2"><span className="font-medium">Section:</span> {showView.section_id || '-'}</div>
            <div className="mb-2"><span className="font-medium">Roll Number:</span> {showView.roll_number || '-'}</div>
            <div className="mb-2"><span className="font-medium">Created At:</span> {showView.created_at}</div>
          </div>
        </div>
      )}
      {/* Delete Student Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowDelete(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-red-700">Delete Student</h3>
            <div className="mb-4">Are you sure you want to delete <span className="font-semibold">{showDelete.name}</span>?</div>
            <button className="bg-red-600 text-white px-4 py-2 rounded shadow mr-2" onClick={handleDelete} disabled={formLoading}>{formLoading ? 'Deleting...' : 'Yes, Delete'}</button>
            <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded shadow" onClick={() => setShowDelete(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 