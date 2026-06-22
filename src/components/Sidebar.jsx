import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, FileText, CheckSquare, Settings } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/children', icon: <Users size={20} />, label: 'Children Records' },
    { to: '/assessment', icon: <ClipboardList size={20} />, label: 'Assessment' },
    { to: '/report', icon: <FileText size={20} />, label: 'Counselor Report' },
    { to: '/compliance', icon: <CheckSquare size={20} />, label: 'Compliance' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen overflow-y-auto flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-brand-700">NACC CWMS</h1>
        <p className="text-xs text-gray-500 mt-1">Child Welfare Mgmt</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
            DR
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Dr. Reyes</p>
            <p className="text-xs text-gray-500">Head Counselor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
