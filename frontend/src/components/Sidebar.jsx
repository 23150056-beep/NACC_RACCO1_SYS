import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, FileText, CheckSquare, Settings, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role_name;

  const links = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: null },
    { to: '/children', icon: <Users size={20} />, label: 'Children Records', roles: ['Administrator', 'Staff', 'Counselor'] },
    { to: '/assessment', icon: <ClipboardList size={20} />, label: 'Assessment', roles: ['Administrator', 'Counselor'] },
    { to: '/report', icon: <FileText size={20} />, label: 'Counselor Report', roles: null },
    { to: '/compliance', icon: <CheckSquare size={20} />, label: 'Compliance', roles: null },
    { to: '/users', icon: <UserCog size={20} />, label: 'User Management', roles: ['Administrator'] },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings', roles: null },
  ].filter((l) => !l.roles || l.roles.includes(role));

  return (
    <div className="w-64 bg-white border-r h-screen overflow-y-auto flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-brand-700">NACC CWMS</h1>
        <p className="text-xs text-gray-500 mt-1">Child Welfare Mgmt</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
            {(user?.first_name?.[0] || 'U')}{(user?.last_name?.[0] || '')}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{user?.fullname || user?.username}</p>
            <p className="text-xs text-gray-500">{role || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
