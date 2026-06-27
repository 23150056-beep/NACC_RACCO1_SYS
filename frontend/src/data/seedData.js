// RACCO I Workspace — demo/seed data for screens without a live API endpoint yet
// (dashboard metrics, trend, activity feed, assessment questionnaire, compliance,
// and the shared assessment-results meta). Children & Users come from the Django API.

export const metrics = { needing: 12, ongoing: 34, completed: 128, total: 174 };

export const trend = [
  { m: 'Jan', v: 20 }, { m: 'Feb', v: 28 }, { m: 'Mar', v: 32 },
  { m: 'Apr', v: 25 }, { m: 'May', v: 38 }, { m: 'Jun', v: 31 },
];

export const questions = [
  'The child exhibits sudden emotional outbursts or withdrawal.',
  'The child shows signs of sleep disruption or reports nightmares.',
  'The child has difficulty maintaining focus during structured activities.',
  'The child avoids talking about home, family, or past experiences.',
];

export const compliance = [
  { law: 'RA 10173', name: 'Data Privacy Act', status: 'Compliant', tone: 'success', note: 'Data encryption verified. Parent consent forms digitized and catalogued.' },
  { law: 'RA 11642', name: 'Domestic Administrative Adoption', status: 'Action Needed', tone: 'warning', note: 'Missing CDCLAA for 2 ongoing cases (C-1001, C-1005).' },
  { law: 'RA 12199', name: 'Alternative Child Care Act', status: 'Compliant', tone: 'success', note: 'Foster care matching aligned with updated DSWD/NACC guidelines.' },
];

// Shared assessment-results narrative meta, cycled across children for the read-only browser.
export const resultMeta = [
  { psychologist: 'Marco Villanueva', date: 'Jun 23, 2026', note: 'Persistent hypervigilance and disrupted sleep noted across two sessions. Recommending trauma-focused CBT and weekly check-ins; coordinate with house parent on bedtime routine.' },
  { psychologist: 'Joseph Ramos', date: 'Jun 22, 2026', note: 'Adjustment difficulties tied to recent placement change. Responding well to structure. Continue regular counseling; reassess in 4 weeks.' },
  { psychologist: 'Marco Villanueva', date: 'Jun 20, 2026', note: 'Stable affect and healthy peer relationships. No clinical concerns at this time; standard periodic monitoring.' },
  { psychologist: 'Joseph Ramos', date: 'Jun 18, 2026', note: 'Intermittent withdrawal during group activities. Mild concern; introduce social-skills support and monitor.' },
  { psychologist: 'Marco Villanueva', date: 'Jun 15, 2026', note: 'Reports of nightmares decreasing. Maintain current intervention plan; positive trajectory.' },
  { psychologist: 'Joseph Ramos', date: 'Jun 12, 2026', note: 'Adjusting well to the facility. Engaged and cooperative; routine follow-up sufficient.' },
];

// Map a child's severity status -> an AI-style outcome (decision-support demo).
export function statusToResult(status) {
  if (status === 'high') return { level: 'high', label: 'High Trauma Indicator', conf: 89, tone: 'danger', cls: 'Trauma / Stressor-related', text: 'Strong indications of unresolved trauma requiring immediate clinical attention. Distress signals were most pronounced around emotional regulation and sleep disruption.' };
  if (status === 'moderate') return { level: 'moderate', label: 'Moderate Behavioral Concern', conf: 76, tone: 'warning', cls: 'Adjustment Disorder', text: 'Moderate behavioral adjustments are needed. Regular ongoing counseling is recommended; mild difficulty with peer interaction was observed.' };
  return { level: 'standard', label: 'Standard Adjustment', conf: 92, tone: 'success', cls: 'Normal Development', text: 'The child appears to be adjusting normally. Standard periodic check-ins are recommended.' };
}

export function scoreToResult(total) {
  if (total >= 16) return { level: 'high', label: 'High Trauma Indicator', conf: 89, tone: 'danger', cls: 'Trauma / Stressor-related', text: 'Responses show strong indications of unresolved trauma requiring immediate clinical attention, particularly around emotional regulation and sleep.' };
  if (total >= 10) return { level: 'moderate', label: 'Moderate Behavioral Concern', conf: 76, tone: 'warning', cls: 'Adjustment Disorder', text: 'Responses indicate moderate behavioral adjustments are needed. Regular ongoing counseling is recommended.' };
  return { level: 'standard', label: 'Standard Adjustment', conf: 92, tone: 'success', cls: 'Normal Development', text: 'The child appears to be adjusting normally. Standard periodic check-ins are recommended.' };
}
