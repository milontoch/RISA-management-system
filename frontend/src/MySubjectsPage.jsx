import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';

export default function MySubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    setLoading(true);
    setError(null);
    fetch(`/api/students?id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStudent(data.data);
          // Optionally, filter subjects by class if supported
          fetch('/api/subjects')
            .then(res => res.json())
            .then(subjData => {
              if (subjData.success && subjData.data) {
                setSubjects(subjData.data); // TODO: filter by class if needed
              } else {
                setError(subjData.message || 'Failed to fetch subjects');
              }
            });
        } else {
          setError(data.message || 'Failed to fetch student');
        }
      })
      .catch(() => setError('Failed to fetch student'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">My Subjects</h2>
      <div className="bg-white border rounded shadow p-4">
        {user?.role !== 'student' ? (
          <div className="text-gray-500">Only students can view this page.</div>
        ) : loading ? (
          <div className="text-gray-500">Loading subjects...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : subjects.length === 0 ? (
          <div className="text-gray-500">No subjects found.</div>
        ) : (
          <div className="table-responsive">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Subject Name</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr key={subject.id}>
                    <td className="py-2 px-4">{subject.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 