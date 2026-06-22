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

export const mockChildren = [
  { id: 'C-1001', name: 'Juan Dela Cruz', age: 8, status: 'Needs Counseling', concern: 'Trauma', counselor: 'Unassigned' },
  { id: 'C-1002', name: 'Maria Santos', age: 12, status: 'Ongoing', concern: 'Behavioral', counselor: 'Dr. Reyes' },
  { id: 'C-1003', name: 'Pedro Penduko', age: 6, status: 'Completed', concern: 'Adjustment', counselor: 'Dr. Lim' },
];

export const mockActivityFeed = [
  { id: 1, text: 'Session 3 completed for Juan Dela Cruz', time: '2 hours ago' },
  { id: 2, text: 'New assessment pending for Maria Santos', time: '5 hours ago' },
  { id: 3, text: 'Compliance deadline approaching for C-1001', time: '1 day ago' },
];
