import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const EMPTY = { fullname: '', birth_date: '', gender: '', address: '', case_type: '', guardian: '' };

export default function Children() {
  const { user } = useAuth();
  const canManage = ['Administrator', 'Staff'].includes(user?.role_name);
  const [children, setChildren] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    api.get('/children/').then((r) => setChildren(r.data));
    api.get('/guardians/').then((r) => setGuardians(r.data));
  };
  useEffect(() => { load(); }, []);

  const filtered = children.filter((c) => c.fullname.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setError(''); setForm({ ...EMPTY }); };
  const openEdit = (c) => { setError(''); setForm({ ...EMPTY, ...c, guardian: c.guardian || '' }); };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    if (!payload.guardian) payload.guardian = null;
    if (!payload.birth_date) delete payload.birth_date;
    try {
      if (form.id) await api.put(`/children/${form.id}/`, payload);
      else await api.post('/children/', payload);
      setForm(null);
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Save failed'));
    }
  };

  const archive = async (c) => {
    if (!window.confirm(`Archive ${c.fullname}?`)) return;
    await api.post(`/children/${c.id}/archive/`);
    load();
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Children Records</h1>
        {canManage && <button onClick={openCreate} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition">+ Add Child</button>}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input type="text" placeholder="Search children..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md w-full max-w-sm mb-4 focus:outline-brand-500" />
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Gender</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Case Type</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Guardian</th>
              {canManage && <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((child) => (
              <tr key={child.id} className="border-b hover:bg-brand-50 transition-colors">
                <td className="p-3 text-sm font-semibold text-brand-600">{child.fullname}</td>
                <td className="p-3 text-sm text-gray-600">{child.gender || '—'}</td>
                <td className="p-3 text-sm text-gray-600">{child.case_type || '—'}</td>
                <td className="p-3 text-sm text-gray-600">{child.guardian_name || '—'}</td>
                {canManage && (
                  <td className="p-3 text-sm space-x-3">
                    <button onClick={() => openEdit(child)} className="text-brand-600 hover:underline">Edit</button>
                    <button onClick={() => archive(child)} className="text-red-600 hover:underline">Archive</button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={canManage ? 5 : 4} className="p-6 text-center text-gray-500">No records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
          <form onSubmit={save} className="w-96 bg-white h-full shadow-2xl border-l flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">{form.id ? 'Edit Child' : 'Add Child'}</h2>
              <button type="button" onClick={() => setForm(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded break-words">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} required
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                <input type="date" value={form.birth_date || ''} onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="">--</option><option>Male</option><option>Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                <input value={form.case_type} onChange={(e) => setForm({ ...form, case_type: e.target.value })}
                  placeholder="e.g. Foster, Adoption, Residential"
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian</label>
                <select value={form.guardian || ''} onChange={(e) => setForm({ ...form, guardian: e.target.value })}
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="">-- None --</option>
                  {guardians.map((g) => <option key={g.id} value={g.id}>{g.fullname}</option>)}
                </select>
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
