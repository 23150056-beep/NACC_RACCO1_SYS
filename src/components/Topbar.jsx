import React from 'react';
import { Bell, Search } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-96">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search records or assessments..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm placeholder-gray-500 text-gray-800"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </div>
  );
}
