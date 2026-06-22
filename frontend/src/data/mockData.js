export const summaryMetrics = {
  needingCounseling: 12,
  ongoing: 34,
  completed: 128,
  total: 174
};

export const caseTrends = [
  { month: 'Jan', count: 20 },
  { month: 'Feb', count: 28 },
  { month: 'Mar', count: 32 },
  { month: 'Apr', count: 25 },
  { month: 'May', count: 38 },
];

// NOTE: dashboard demo data only. Real children come from the API (see pages/Children.jsx).
// Dashboard wiring to live data lands in Phase 4.

export const mockActivityFeed = [
  { id: 1, text: 'Session 3 completed for Juan Dela Cruz', time: '2 hours ago' },
  { id: 2, text: 'New assessment pending for Maria Santos', time: '5 hours ago' },
  { id: 3, text: 'Compliance deadline approaching for C-1001', time: '1 day ago' },
];
