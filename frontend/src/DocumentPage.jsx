import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from './auth';

export default function DocumentPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [form, setForm] = useState({ file: null, type: '', description: '' });
  const fileInputRef = useRef();

  // Fetch documents for the user
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    fetch(`/api/documents?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setDocuments(data.data);
        } else {
          setError(data.message || 'Failed to fetch documents');
        }
      })
      .catch(() => setError('Failed to fetch documents'))
      .finally(() => setLoading(false));
  }, [user, uploadStatus, deleteStatus]);

  // Handle file input
  const handleFileChange = (e) => {
    setForm(f => ({ ...f, file: e.target.files[0] }));
  };

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadStatus(null);
    if (!form.file || !form.type) {
      setUploadStatus({ type: 'error', message: 'File and type are required.' });
      return;
    }
    const data = new FormData();
    data.append('document', form.file);
    data.append('user_id', user.id);
    data.append('type', form.type);
    data.append('description', form.description);
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: data
    });
    const result = await res.json();
    if (result.success) {
      setUploadStatus({ type: 'success', message: 'Document uploaded!' });
      setForm({ file: null, type: '', description: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setUploadStatus({ type: 'error', message: result.message || 'Failed to upload.' });
    }
  };

  // Handle download
  const handleDownload = (id) => {
    window.open(`/api/documents/download?id=${id}`, '_blank');
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    setDeleteStatus(null);
    const res = await fetch('/api/documents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      setDeleteStatus({ type: 'success', message: 'Document deleted.' });
    } else {
      setDeleteStatus({ type: 'error', message: data.message || 'Failed to delete.' });
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Document Management</h2>
      {/* Upload Form */}
      <div className="bg-white border rounded shadow p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
        <form onSubmit={handleUpload} className="flex flex-wrap gap-4 items-end">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="flex-1" required />
          <select className="border rounded px-2 py-1 flex-1" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required>
            <option value="">Select Type</option>
            <option value="homework">Homework</option>
            <option value="circular">Circular</option>
            <option value="assignment">Assignment</option>
            <option value="other">Other</option>
          </select>
          <input type="text" className="border rounded px-2 py-1 flex-1" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 button-touch">Upload</button>
        </form>
        {uploadStatus && <div className={`mt-2 ${uploadStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{uploadStatus.message}</div>}
      </div>
      {/* Document List */}
      <div className="bg-white border rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-2">My Documents</h3>
        {loading ? (
          <div className="text-gray-500">Loading documents...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : documents.length === 0 ? (
          <div className="text-gray-500">No documents found.</div>
        ) : (
          <div className="table-responsive">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left">Uploaded</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td className="py-2 px-4">{doc.type}</td>
                    <td className="py-2 px-4">{doc.description}</td>
                    <td className="py-2 px-4">{doc.created_at}</td>
                    <td className="py-2 px-4">
                      <button className="text-blue-600 hover:underline mr-2 button-touch" onClick={() => handleDownload(doc.id)}>Download</button>
                      <button className="text-red-600 hover:underline button-touch" onClick={() => handleDelete(doc.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {deleteStatus && <div className={`mt-2 ${deleteStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{deleteStatus.message}</div>}
      </div>
    </div>
  );
} 