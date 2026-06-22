import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Children from './pages/Children';
import Assessment from './pages/Assessment';
import Report from './pages/Report';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <Topbar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/children" element={<Children />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/report" element={<Report />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
