import React, { useEffect, useState } from 'react';
import { useAuth } from './auth.jsx';
import apiService from './services/api';

export default function FeePage() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState({ student_id: '', amount: '', due_date: '', description: '' });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch fees
  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getFees();
      if (data.success && data.fees) {
        setFees(data.fees);
      } else {
        setError(data.message || 'Failed to fetch fees');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchFees(); }, []);

  // Add Fee
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const data = await apiService.createFee(form);
      if (!data.success) {
        setFormError(data.message || 'Failed to create fee');
        setFormLoading(false);
        return;
      }
      setShowAdd(false);
      setForm({ student_id: '', amount: '', due_date: '', description: '' });
      fetchFees();
    } catch (err) {
      setFormError('Network error');
    }
    setFormLoading(false);
  };

  // Edit Fee
  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const data = await apiService.updateFee(showEdit.id, form);
      if (!data.success) {
        setFormError(data.message || 'Failed to update fee');
        setFormLoading(false);
        return;
      }
      setShowEdit(null);
      setForm({ student_id: '', amount: '', due_date: '', description: '' });
      fetchFees();
    } catch (err) {
      setFormError('Network error');
    }
    setFormLoading(false);
  };

  // Delete Fee
  const handleDelete = async () => {
    if (!showDelete) return;
    setFormLoading(true);
    try {
      await apiService.deleteFee(showDelete.id);
      setShowDelete(null);
      fetchFees();
    } catch (err) {
      console.error('Failed to delete fee:', err);
    }
    setFormLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Fees Management</h2>
      {/* View Fees Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">View Fees</h3>
        <div className="bg-white border rounded shadow p-4">
          {loading ? (
            <div className="text-gray-500">Loading fees...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Student</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Due Date</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-gray-500 py-4">No fees found.</td></tr>
                  ) : (
                    fees.map(fee => (
                      <tr key={fee.id}>
                        <td className="py-2 px-4">{fee.student || fee.student_name}</td>
                        <td className="py-2 px-4">${fee.amount}</td>
                        <td className="py-2 px-4">{fee.due_date}</td>
                        <td className="py-2 px-4">{fee.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Pay Fees Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Pay Fees</h3>
        <div className="bg-white border rounded shadow p-4">
          {user && user.role === 'parent' ? (
            <form onSubmit={handlePayFee}>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Select Fee</label>
                <select className="border rounded px-2 py-1 w-full" value={payFeeId} onChange={e => setPayFeeId(e.target.value)}>
                  <option value="">Select fee</option>
                  {fees.filter(f => f.status === 'unpaid').map(fee => (
                    <option key={fee.id} value={fee.id}>{(fee.student || fee.student_name)} - ${fee.amount} (Due: {fee.due_date})</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Amount</label>
                <input type="number" className="border rounded px-2 py-1 w-full" value={payAmount} onChange={e => setPayAmount(e.target.value)} min="1" />
              </div>
              <button type="submit" className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 button-touch">Pay Fee</button>
              {payStatus && (
                <div className={`mt-2 ${payStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{payStatus.message}</div>
              )}
            </form>
          ) : (
            <div className="text-gray-500">Only parents can pay fees.</div>
          )}
        </div>
      </div>
      {/* Manage Fees Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Manage Fees</h3>
        <div className="bg-white border rounded shadow p-4">
          {user && (user.role === 'admin' || user.role === 'parent') ? (
            <form onSubmit={handleManageFee}>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Student Name</label>
                <input type="text" className="border rounded px-2 py-1 w-full" value={manageForm.student} onChange={e => setManageForm(f => ({ ...f, student: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Amount</label>
                <input type="number" className="border rounded px-2 py-1 w-full" value={manageForm.amount} onChange={e => setManageForm(f => ({ ...f, amount: e.target.value }))} min="1" />
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">Due Date</label>
                <input type="date" className="border rounded px-2 py-1 w-full" value={manageForm.due_date} onChange={e => setManageForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 button-touch">Add Fee</button>
              {manageStatus && <div className="mt-2 text-green-600">{manageStatus}</div>}
            </form>
          ) : (
            <div className="text-gray-500">Only admins and parents can add fees.</div>
          )}
        </div>
      </div>
    </div>
  );
} 