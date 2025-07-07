import React, { useState, useEffect } from 'react';
import { useAuth } from './auth';

export default function FeePage() {
  const { user } = useAuth();
  // State for fees
  const [fees, setFees] = useState([]);
  const [loadingFees, setLoadingFees] = useState(true);
  const [feesError, setFeesError] = useState(null);
  const [payFeeId, setPayFeeId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [manageForm, setManageForm] = useState({ student: '', amount: '', due_date: '' });
  const [manageStatus, setManageStatus] = useState(null);
  // Handler for paying a fee
  const [payStatus, setPayStatus] = useState(null);
  const handlePayFee = async (e) => {
    e.preventDefault();
    setPayStatus(null);
    if (!payFeeId || !payAmount) {
      setPayStatus({ type: 'error', message: 'Select a fee and enter amount.' });
      return;
    }
    // Update fee status to 'paid' (mock: PUT /api/fees)
    const res = await fetch('/api/fees', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: payFeeId, status: 'paid', amount: payAmount })
    });
    const data = await res.json();
    if (data.success) {
      setPayStatus({ type: 'success', message: 'Fee paid successfully!' });
      setPayFeeId('');
      setPayAmount('');
      // Optionally, refetch fees
      if (user) {
        let url = '/api/fees';
        if (user.role === 'student') url += `?student_id=${user.id}`;
        fetch(url)
          .then(res => res.json())
          .then(data => setFees(data.data || []));
      }
    } else {
      setPayStatus({ type: 'error', message: data.message || 'Failed to pay fee.' });
    }
  };

  // Handler for managing (creating) a fee
  const handleManageFee = async (e) => {
    e.preventDefault();
    setManageStatus(null);
    if (!manageForm.student || !manageForm.amount || !manageForm.due_date) {
      setManageStatus('Fill all fields.');
      return;
    }
    // Create fee (POST /api/fees)
    const res = await fetch('/api/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: manageForm.student,
        amount: manageForm.amount,
        due_date: manageForm.due_date,
        status: 'unpaid',
        created_by: user?.id
      })
    });
    const data = await res.json();
    if (data.success) {
      setManageStatus('Fee added successfully!');
      setManageForm({ student: '', amount: '', due_date: '' });
      // Optionally, refetch fees
      if (user) {
        let url = '/api/fees';
        if (user.role === 'student') url += `?student_id=${user.id}`;
        fetch(url)
          .then(res => res.json())
          .then(data => setFees(data.data || []));
      }
    } else {
      setManageStatus(data.message || 'Failed to add fee.');
    }
  };

  // Fetch fees for current user (student/parent) on mount
  useEffect(() => {
    if (!user) return;
    setLoadingFees(true);
    setFeesError(null);
    let url = '/api/fees';
    if (user.role === 'student') {
      url += `?student_id=${user.id}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFees(data.data);
        } else {
          setFeesError(data.message || 'Failed to fetch fees');
        }
      })
      .catch(() => setFeesError('Failed to fetch fees'))
      .finally(() => setLoadingFees(false));
  }, [user]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Fees Management</h2>
      {/* View Fees Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">View Fees</h3>
        <div className="bg-white border rounded shadow p-4">
          {loadingFees ? (
            <div className="text-gray-500">Loading fees...</div>
          ) : feesError ? (
            <div className="text-red-600">{feesError}</div>
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