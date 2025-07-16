import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from './config';

// API Service (can be moved to a separate file)
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


// Components
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        {children}
      </div>
    </div>
  );
};

const TeacherForm = ({ onTeacherAdded, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', status: 'active' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/teachers', formData);
      onTeacherAdded(response.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Add New Teacher</h2>
      {error && <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" name="name" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input type="text" name="phone" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" name="password" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select name="status" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300">
          {loading ? 'Adding...' : 'Add Teacher'}
        </button>
      </div>
    </form>
  );
};

const AssignHeadTeacher = ({ teacher, classes, onAssigned }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      await api.post(`/classes/${selectedClass}/assign-head-teacher`, { teacher_id: teacher.id });
      onAssigned();
    } catch (error) {
      console.error('Failed to assign head teacher', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select 
        value={selectedClass} 
        onChange={e => setSelectedClass(e.target.value)} 
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
      >
        <option value="">Assign to Class...</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name} - Section {c.section}</option>)}
      </select>
      <button onClick={handleAssign} disabled={loading || !selectedClass} className="px-3 py-1.5 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300">
        {loading ? '...' : 'Assign'}
      </button>
    </div>
  );
};


export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, classesRes] = await Promise.all([
          api.get('/teachers'),
          api.get('/classes')
        ]);
        setTeachers(teachersRes.data.data);
        setClasses(classesRes.data.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTeacherAdded = (teacher) => {
    setTeachers([teacher, ...teachers]);
  };
  
  const handleHeadTeacherAssigned = () => {
    // Re-fetch classes to update head teacher info
    api.get('/classes').then(res => setClasses(res.data.data));
  };

  if (loading) return <div className="p-8"><p>Loading...</p></div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Teachers</h1>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Add New Teacher
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TeacherForm onTeacherAdded={handleTeacherAdded} onClose={() => setIsModalOpen(false)} />
      </Modal>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head Teacher Of</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign as Head</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map(teacher => {
              const headTeacherOfClass = classes.find(c => c.head_teacher_id === teacher.id);
              return (
                <tr key={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {headTeacherOfClass ? `${headTeacherOfClass.name} - Section ${headTeacherOfClass.section}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AssignHeadTeacher teacher={teacher} classes={classes} onAssigned={handleHeadTeacherAssigned} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 