import React, { useState } from 'react';
import { mockChildren } from '../data/mockData';
import { X, Calendar, ClipboardList, User } from 'lucide-react';

export default function Children() {
  const [search, setSearch] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  const filtered = mockChildren.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Children Records</h1>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Search children..." 
            className="border p-2 rounded-md w-full max-w-sm focus:outline-brand-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-sm font-semibold text-gray-600">ID</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Age</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Concern</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Counselor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(child => (
              <tr 
                key={child.id} 
                className="border-b hover:bg-brand-50 cursor-pointer transition-colors"
                onClick={() => setSelectedChild(child)}
              >
                <td className="p-3 text-sm text-gray-600">{child.id}</td>
                <td className="p-3 text-sm font-semibold text-brand-600">{child.name}</td>
                <td className="p-3 text-sm text-gray-600">{child.age}</td>
                <td className="p-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    child.status === 'Needs Counseling' ? 'bg-red-100 text-red-700' :
                    child.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {child.status}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">{child.concern}</td>
                <td className="p-3 text-sm text-gray-600">{child.counselor}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Child Profile Modal/Slide-over */}
      {selectedChild && (
        <div className="absolute top-0 right-0 h-full w-full bg-black bg-opacity-20 flex justify-end z-50">
          <div className="w-96 bg-white h-full shadow-2xl border-l flex flex-col animate-in slide-in-from-right">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Child Profile</h2>
              <button onClick={() => setSelectedChild(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-xl">
                  {selectedChild.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedChild.name}</h3>
                  <p className="text-sm text-gray-500">ID: {selectedChild.id} • Age: {selectedChild.age}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                  <User size={18} className="text-brand-500" />
                  <span className="font-medium w-24">Counselor:</span> 
                  {selectedChild.counselor}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                  <ClipboardList size={18} className="text-brand-500" />
                  <span className="font-medium w-24">Status:</span> 
                  {selectedChild.status}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                  <Calendar size={18} className="text-brand-500" />
                  <span className="font-medium w-24">Concern:</span> 
                  {selectedChild.concern}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Session Timeline</h4>
                <div className="space-y-4">
                  {[1, 2].map((session, i) => (
                    <div key={session} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 bg-brand-500 rounded-full mt-1.5"></div>
                        {i === 0 && <div className="w-0.5 h-10 bg-brand-200 mt-1"></div>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Session {2 - i}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{i === 0 ? 'Last Week' : '3 Weeks Ago'}</p>
                        <p className="text-sm text-gray-600 mt-1 mb-2 bg-gray-50 p-2 rounded border border-gray-100">
                          {i === 0 ? 'Discussed school behavioral changes. Showed slight improvement.' : 'Initial assessment completed. Baseline established.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button 
                onClick={() => {
                   window.location.href = '/assessment';
                }}
                className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 transition"
              >
                New Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
