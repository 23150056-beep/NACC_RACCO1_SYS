import React, { useState } from 'react';
import { mockChildren } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function Assessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedChild, setSelectedChild] = useState('');
  const [sessionDetails, setSessionDetails] = useState({ date: '', type: 'Intake' });
  const [answers, setAnswers] = useState({ q1: null, q2: null, q3: null });
  const [aiResult, setAiResult] = useState(null);

  const calculateAIResult = () => {
    const score = (answers.q1 || 0) + (answers.q2 || 0) + (answers.q3 || 0);
    // Simple logic: higher score = higher distress
    if (score >= 12) {
      return { class: 'High Trauma Indicator', conf: 89, text: 'Based on the questionnaire responses, there are strong indications of unresolved trauma requiring immediate clinical attention.', color: 'red' };
    } else if (score >= 8) {
      return { class: 'Moderate Behavioral Concern', conf: 76, text: 'Responses indicate moderate behavioral adjustments needed. Recommend regular ongoing counseling.', color: 'yellow' };
    } else {
      return { class: 'Standard Adjustment', conf: 92, text: 'Child appears to be adjusting normally. Recommend standard periodic check-ins.', color: 'green' };
    }
  };

  const handleNext = () => {
    if (step === 3) {
      setAiResult(calculateAIResult());
    }
    if (step === 4) {
      // Redirect to report or dashboard
      navigate('/report');
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Assessment Process</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
        
        {/* Progress Bar */}
        <div className="flex items-center mb-8 relative">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
          <div className="absolute top-4 left-0 h-0.5 bg-brand-500 transition-all duration-300 -z-10" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex-1 text-center relative bg-white">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                step === s ? 'border-brand-500 bg-brand-500 text-white' : 
                step > s ? 'border-brand-500 bg-brand-100 text-brand-600' : 'border-gray-200 bg-white text-gray-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <p className={`text-xs mt-2 font-medium ${step >= s ? 'text-gray-800' : 'text-gray-400'}`}>
                {s === 1 ? 'Select Child' : s === 2 ? 'Session Details' : s === 3 ? 'Questionnaire' : 'AI Result'}
              </p>
            </div>
          ))}
        </div>

        {/* Step 1: Select Child */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold mb-4">Step 1: Select Child for Assessment</h2>
            <select 
              className="w-full border p-3 rounded-md mb-4 focus:ring-2 focus:ring-brand-500 outline-none"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              <option value="">-- Select a child profile --</option>
              {mockChildren.map(c => (
                <option key={c.id} value={c.id}>{c.id}: {c.name} ({c.status})</option>
              ))}
            </select>
          </div>
        )}

        {/* Step 2: Session Details */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold mb-4">Step 2: Session Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                <input 
                  type="date" 
                  className="w-full border p-3 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                  value={sessionDetails.date}
                  onChange={e => setSessionDetails({...sessionDetails, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <select 
                  className="w-full border p-3 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                  value={sessionDetails.type}
                  onChange={e => setSessionDetails({...sessionDetails, type: e.target.value})}
                >
                  <option>Intake / Baseline</option>
                  <option>Regular Check-in</option>
                  <option>Incident Follow-up</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Questionnaire */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold mb-4">Step 3: Clinical Questionnaire (Likert Scale)</h2>
            <p className="text-sm text-gray-500 mb-6">Rate the child's response/behavior during the session from 1 (Strongly Disagree/Never) to 5 (Strongly Agree/Always).</p>
            
            <div className="space-y-6">
              {[
                { id: 'q1', text: "1. The child exhibits sudden emotional outbursts or withdrawal." },
                { id: 'q2', text: "2. The child shows signs of sleep disruption or reports nightmares." },
                { id: 'q3', text: "3. The child has difficulty maintaining focus during structured activities." }
              ].map(q => (
                <div key={q.id} className="bg-gray-50 p-4 rounded-lg border">
                  <p className="font-medium text-gray-800 mb-3">{q.text}</p>
                  <div className="flex gap-2 justify-between max-w-md">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => setAnswers({...answers, [q.id]: score})}
                        className={`w-10 h-10 rounded-full border-2 font-bold transition-all ${
                          answers[q.id] === score 
                            ? 'bg-brand-500 border-brand-500 text-white shadow-md scale-110' 
                            : 'bg-white border-gray-300 text-gray-600 hover:border-brand-300'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between max-w-md mt-2 text-xs text-gray-400 px-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: AI Result */}
        {step === 4 && aiResult && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold mb-4">Step 4: AI Sentiment Analysis Result</h2>
            
            <div className={`p-6 rounded-xl border ${
              aiResult.color === 'red' ? 'bg-red-50 border-red-200' :
              aiResult.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 font-bold rounded-full text-sm ${
                  aiResult.color === 'red' ? 'bg-red-100 text-red-800' :
                  aiResult.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {aiResult.class}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 font-bold rounded-full text-sm flex items-center gap-1">
                  Confidence: {aiResult.conf}%
                </span>
              </div>
              
              <p className="text-gray-800 font-medium mb-6 text-lg">
                {aiResult.text}
              </p>
              
              <div className="bg-white/60 p-4 border rounded-md text-sm text-gray-700 italic border-l-4 border-l-gray-400">
                <strong>Disclaimer:</strong> This output is provided for assessment decision-support only and does not replace professional clinical diagnosis mandated by NACC guidelines.
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-4 border-t">
          <button 
            disabled={step === 1} 
            onClick={() => setStep(step - 1)}
            className="px-6 py-2.5 font-medium bg-gray-100 text-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition"
          >
            ← Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedChild) || 
              (step === 3 && (!answers.q1 || !answers.q2 || !answers.q3))
            }
            className="px-6 py-2.5 font-bold bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            {step === 4 ? 'Proceed to Report →' : 'Next Step →'}
          </button>
        </div>

      </div>
    </div>
  );
}
