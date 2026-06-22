import React, { useState } from 'react';
import { DownloadCloud, CheckCircle } from 'lucide-react';

export default function Compliance() {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      // Simulate file download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Sample Audit Export\nConfidential NACC Data');
      link.download = 'NACC_Audit_Report.csv';
      link.click();
    }, 1500);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Compliance & Audit</h1>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 flex items-center gap-2 text-sm bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-75 transition shadow-sm"
        >
          {exporting ? (
            <span className="flex items-center gap-2 animate-pulse"><DownloadCloud size={16} /> Generating PDF...</span>
          ) : (
            <><DownloadCloud size={16} /> Export Audit Report</>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-200">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Overall Compliance</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-brand-600">94%</p>
            <span className="text-green-500 text-sm font-bold mb-1">+2% from last month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Overdue Cases</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-red-500">3</p>
            <span className="text-red-500 text-sm font-bold mb-1">Needs attention</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Auditable Records</p>
          <p className="text-4xl font-black text-green-500">1,204</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Regulatory Checklist Status</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-green-500 shadow-sm">
            <div>
              <p className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                RA 10173 (Data Privacy Act)
              </p>
              <p className="text-sm text-gray-600 mt-1">Data encryption verified. Parent consent forms digitized and catalogued.</p>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs uppercase">Compliant</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-500 shadow-sm">
            <div>
              <p className="font-bold text-gray-800 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-white text-[10px] font-bold">!</div>
                RA 11642 (Domestic Administrative Adoption)
              </p>
              <p className="text-sm text-gray-600 mt-1">Missing CDCLAA (Certification Declaring a Child Legally Available for Adoption) for 2 ongoing cases.</p>
              <button className="text-brand-600 text-xs font-bold mt-2 hover:underline">View Affected Cases →</button>
            </div>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold text-xs uppercase">Action Needed</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-green-500 shadow-sm">
            <div>
              <p className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                RA 12199 (Alternative Child Care)
              </p>
              <p className="text-sm text-gray-600 mt-1">Foster care matching workflows aligned with updated DSWD/NACC guidelines.</p>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs uppercase">Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
