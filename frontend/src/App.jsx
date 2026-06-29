import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ActivityProvider } from './context/ActivityContext';
import { ToastProvider } from './context/ToastContext';
import { INSTRUMENT_MANAGER_ROLES } from './config/roles';
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
import Users from './pages/Users';
import Questionnaires from './pages/Questionnaires';

function Shell({ children }) {
  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-app)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <main className="racco-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>{children}</main>
      </div>
    </div>
  );
}

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
const Router = DEMO ? HashRouter : BrowserRouter;

function DemoBadge() {
  if (!DEMO) return null;
  return (
    <div style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 200, background: 'var(--blue-600)', color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 11, letterSpacing: '0.06em', padding: '5px 11px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-md)', pointerEvents: 'none' }}>DEMO · SAMPLE DATA</div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <ActivityProvider>
        <DemoBadge />
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Shell><Dashboard /></Shell></ProtectedRoute>} />
          <Route path="/children" element={<ProtectedRoute roles={['Administrator', 'Staff', 'Psychologist']}><Shell><Children /></Shell></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute roles={['Psychologist']}><Shell><Assessment /></Shell></ProtectedRoute>} />
          <Route path="/questionnaires" element={<ProtectedRoute roles={INSTRUMENT_MANAGER_ROLES}><Shell><Questionnaires /></Shell></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><Shell><Report /></Shell></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><Shell><Compliance /></Shell></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={['Administrator']}><Shell><Users /></Shell></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute roles={['Administrator']}><Shell><Settings /></Shell></ProtectedRoute>} />
          </Routes>
        </Router>
      </ActivityProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
