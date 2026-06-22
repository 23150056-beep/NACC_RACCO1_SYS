import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm">
        <h1 className="text-xl font-bold text-brand-700 mb-1">NACC CWMS</h1>
        <p className="text-xs text-gray-500 mb-6">RACCO I — Sign in to your account</p>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">{error}</div>}
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full border p-2.5 rounded-md mb-4 focus:ring-2 focus:ring-brand-500 outline-none" />
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full border p-2.5 rounded-md mb-6 focus:ring-2 focus:ring-brand-500 outline-none" />
        <button type="submit" disabled={busy}
          className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50 transition">
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
