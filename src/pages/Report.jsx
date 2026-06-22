import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Report() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    agreement: '',
    classification: 'Trauma',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Counselor Report</h1>
      
      {submitted && (
        <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-right">
          <CheckCircle size={20} />
          <span className="font-medium">Report submitted securely to NACC.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">AI Analysis Reference</h2>
          
          <div className="bg-brand-50 p-5 rounded-lg mb-6 border border-brand-100 flex-1">
            <div className="flex items-center justify-between mb-3 border-b border-brand-200 pb-3">
              <h3 className="font-bold text-brand-800 text-lg">High Trauma Indicator</h3>
              <span className="bg-white text-brand-700 px-3 py-1 rounded-full text-xs font-bold border border-brand-200">
                Confidence: 89%
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Based on the questionnaire responses, there are strong indications of unresolved trauma requiring immediate clinical attention. The child showed strong distress signals particularly regarding emotional regulation and sleep disruption.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border mt-auto">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Do you agree with the AI Classification?</label>
            <div className="flex gap-6">
              {['Agree', 'Partially Agree', 'Disagree'].map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-2 rounded flex-1">
                  <input 
                    type="radio" 
                    name="agree" 
                    value={opt}
                    checked={formData.agreement === opt}
                    onChange={e => setFormData({...formData, agreement: e.target.value})}
                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                  /> 
                  <span className="font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Official Clinical Notes</h2>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Final Practitioner Classification</label>
              <select 
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.classification}
                onChange={e => setFormData({...formData, classification: e.target.value})}
              >
                <option>Trauma / Stressor-related</option>
                <option>Behavioral / Conduct</option>
                <option>Adjustment Disorder</option>
                <option>Normal Development</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Detailed Counselor's Assessment</label>
              <textarea 
                rows="8" 
                required
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none" 
                placeholder="Enter clinical observations, behavioral patterns, and recommended interventions... (Required for submission)"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={!formData.agreement || !formData.notes}
              className="w-full bg-brand-600 text-white p-3 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
            >
              Sign and Submit to NACC
            </button>
            {!formData.agreement && <p className="text-xs text-red-500 text-center">Please indicate AI agreement on the left.</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
