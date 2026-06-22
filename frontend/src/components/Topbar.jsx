import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="text-sm text-gray-500">NACC-RACCO I — Behavioral Assessment &amp; Counseling Support</div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user?.fullname || user?.username}</span>
        <button onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </header>
  );
}
