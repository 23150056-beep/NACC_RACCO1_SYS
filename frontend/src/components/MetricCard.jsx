import React from 'react';

export default function MetricCard({ title, value, color }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
