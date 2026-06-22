import React, { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    agency: 'St. Joseph Orphanage',
    threshold: 80
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h1>
      
      {saved && (
        <div className="absolute top-6 right-6 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-right">
          <CheckCircle size={20} className="text-green-400" />
          <span className="font-medium">Settings saved successfully.</span>
        </div>
      )}

      <div className="max-w-3xl space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Agency Configuration</h2>
          <div className="space-y-5 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Agency Name</label>
              <input 
                type="text" 
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                value={config.agency}
                onChange={e => setConfig({...config, agency: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">NACC API Endpoint</label>
              <div className="flex bg-gray-50 border rounded-lg">
                <span className="p-3 text-gray-400 bg-gray-100 rounded-l-lg border-r border-gray-200 text-sm">PROD Environment</span>
                <input 
                  type="text" 
                  className="w-full p-3 bg-transparent text-gray-600 outline-none cursor-not-allowed" 
                  defaultValue="https://api.nacc.gov.ph/v1/sync" 
                  disabled 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">AI Assessment Engine</h2>
          <div className="space-y-4 mt-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Minimum Confidence Threshold</label>
                <span className="font-bold text-brand-600">{config.threshold}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="99" 
                value={config.threshold}
                onChange={e => setConfig({...config, threshold: e.target.value})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600" 
              />
              <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded border">
                If the AI model's confidence falls below <strong>{config.threshold}%</strong>, the system will flag the assessment for mandatory manual practitioner override before saving.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <button 
            onClick={handleSave}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 transition flex items-center gap-2 shadow-sm"
          >
            <Save size={18} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
