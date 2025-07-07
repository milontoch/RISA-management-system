import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';

export default function MyChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'parent') return;
    setLoading(true);
    setError(null);
    fetch(`/api/dashboard/parent?parent_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.students) {
          setChildren(data.data.students);
        } else {
          setError(data.message || 'Failed to fetch children');
        }
      })
      .catch(() => setError('Failed to fetch children'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">My Children</h2>
      <div className="bg-white border rounded shadow p-4">
        {user?.role !== 'parent' ? (
          <div className="text-gray-500">Only parents can view this page.</div>
        ) : loading ? (
          <div className="text-gray-500">Loading children...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : children.length === 0 ? (
          <div className="text-gray-500">No children found.</div>
        ) : (
          <div className="table-responsive">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Class</th>
                  <th className="py-2 px-4 text-left">Section</th>
                  <th className="py-2 px-4 text-left">Roll No.</th>
                </tr>
              </thead>
              <tbody>
                {children.map(child => (
                  <tr key={child.id}>
                    <td className="py-2 px-4">{child.student_name}</td>
                    <td className="py-2 px-4">{child.class_name}</td>
                    <td className="py-2 px-4">{child.section_name}</td>
                    <td className="py-2 px-4">{child.roll_number}</td>
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