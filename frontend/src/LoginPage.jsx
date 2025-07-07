import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth';

const BACKEND_URL = 'http://localhost/RISA%20management%20system/backend/public/index.php/login';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input type="email" className="w-full border px-3 py-2 rounded input-mobile" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Password</label>
          <input type="password" className="w-full border px-3 py-2 rounded input-mobile" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 button-touch" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
} 