import React from 'react';
import { summaryMetrics, caseTrends, mockActivityFeed } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '../components/MetricCard';

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Needing Counseling" value={summaryMetrics.needingCounseling} color="text-red-500" />
        <MetricCard title="Ongoing Cases" value={summaryMetrics.ongoing} color="text-yellow-500" />
        <MetricCard title="Completed" value={summaryMetrics.completed} color="text-green-500" />
        <MetricCard title="Total Children" value={summaryMetrics.total} color="text-brand-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Monthly Session Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caseTrends}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Live Activity Feed</h2>
          <div className="space-y-4">
            {mockActivityFeed.map(feed => (
              <div key={feed.id} className="border-b last:border-0 pb-3">
                <p className="text-sm font-medium text-gray-800">{feed.text}</p>
                <p className="text-xs text-gray-400 mt-1">{feed.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
