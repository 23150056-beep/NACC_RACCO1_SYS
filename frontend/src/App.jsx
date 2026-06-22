import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Children from './pages/Children';
import Assessment from './pages/Assessment';
import Report from './pages/Report';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';

function Shell({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Shell><Dashboard /></Shell></ProtectedRoute>} />
          <Route path="/children" element={<ProtectedRoute roles={['Administrator', 'Staff', 'Counselor']}><Shell><Children /></Shell></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute roles={['Administrator', 'Counselor']}><Shell><Assessment /></Shell></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><Shell><Report /></Shell></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><Shell><Compliance /></Shell></ProtectedRoute>} />
          {/* /users route is added in Task 11 together with the Users page */}
          <Route path="/settings" element={<ProtectedRoute><Shell><Settings /></Shell></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
