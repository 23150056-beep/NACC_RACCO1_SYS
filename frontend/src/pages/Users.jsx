import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/client';

const EMPTY = { email: '', username: '', first_name: '', last_name: '', middle_initial: '', contact_details: '', role: '', password: '' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(null); // null = closed, object = open
  const [error, setError] = useState('');

  const load = () => api.get('/users/').then((r) => setUsers(r.data));

  useEffect(() => {
    load();
    api.get('/roles/').then((r) => setRoles(r.data));
  }, []);

  const openCreate = () => { setError(''); setForm({ ...EMPTY }); };
  const openEdit = (u) => { setError(''); setForm({ ...EMPTY, ...u, password: '' }); };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (form.id) await api.put(`/users/${form.id}/`, payload);
      else await api.post('/users/', payload);
      setForm(null);
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Save failed'));
    }
  };

  const archive = async (u) => {
    if (!window.confirm(`Archive ${u.fullname || u.email}?`)) return;
    await api.post(`/users/${u.id}/archive/`);
    load();
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button onClick={openCreate} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition">+ Add User</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Role</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-sm font-medium text-gray-800">{u.fullname || u.username}</td>
                <td className="p-3 text-sm text-gray-600">{u.email}</td>
                <td className="p-3 text-sm text-gray-600">{u.role_name}</td>
                <td className="p-3 text-sm space-x-3">
                  <button onClick={() => openEdit(u)} className="text-brand-600 hover:underline">Edit</button>
                  <button onClick={() => archive(u)} className="text-red-600 hover:underline">Archive</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No users.</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
          <form onSubmit={save} className="w-96 bg-white h-full shadow-2xl border-l flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">{form.id ? 'Edit User' : 'Add User'}</h2>
              <button type="button" onClick={() => setForm(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded break-words">{error}</div>}
              {[['first_name', 'First Name'], ['middle_initial', 'Middle Initial'], ['last_name', 'Last Name'], ['username', 'Username'], ['email', 'Email'], ['contact_details', 'Contact Details']].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="w-full border p-2 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="">-- Select role --</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password {form.id && <span className="text-gray-400">(leave blank to keep)</span>}</label>
                <input type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 transition">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
