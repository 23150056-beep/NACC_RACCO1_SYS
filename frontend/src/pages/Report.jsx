import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Alert, Input, SeverityBadge, EmptyState, Icon, iconBtn, PAGE } from '../ui';

function caseRef(id) { return `C-${String(id).padStart(4, '0')}`; }

const TRIAGE = {
  'Normal': { level: 'standard', tone: 'success' },
  'Needs Monitoring': { level: 'moderate', tone: 'warning' },
  'Needs Counseling Attention': { level: 'high', tone: 'danger' },
};

export default function Report() {
  const { user } = useAuth();
  const role = user?.role_name || 'Staff';
  const staff = role === 'Staff';
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);

  useEffect(() => { api.get('/assessments/').then((r) => setItems(r.data)).catch(() => {}); }, []);

  const rows = useMemo(() => items.map((a) => ({
    id: a.id,
    name: a.child_name,
    ref: caseRef(a.child),
    caseType: a.child_case_type || '—',
    psychologist: a.psychologist_name || '—',
    date: a.assessment_date,
    cls: a.classification || '—',
    notes: a.notes || '',
    result: a.result,
  })), [items]);

  const visible = rows.filter((r) => (r.name || '').toLowerCase().includes(q.toLowerCase()) || r.ref.toLowerCase().includes(q.toLowerCase()));
  const td = { padding: '12px 16px', fontSize: 13, color: 'var(--text-body)', whiteSpace: 'nowrap' };

  return (
    <div style={{ ...PAGE, position: 'relative' }}>
      {staff ? (
        <Alert tone="info" icon={<Icon name="eye" size={18} />} style={{ marginBottom: 18 }} title="Read-only view">
          As Staff, you can view assessment outcomes for case coordination, but the assessment tools and raw questionnaire responses are restricted to psychologists.
        </Alert>
      ) : (
        <Alert tone="info" icon={<Icon name="users" size={18} />} style={{ marginBottom: 16 }} title="Saved results">
          Completed assessments and their automated analysis appear here. Run or update an assessment from <strong>Assessment Tools</strong>.
        </Alert>
      )}

      {!staff && (
        <div style={{ width: 340, maxWidth: '100%', marginBottom: 14 }}>
          <Input placeholder="Search results by child name or case ID…" value={q} onChange={(e) => setQ(e.target.value)} leading={<Icon name="search" size={16} />} />
        </div>
      )}

      <Card padding="0">
        {visible.length === 0 ? (
          <EmptyState icon={<Icon name="folder-search" size={24} />} title="No assessments yet" description="Completed assessments will appear here once they are signed." />
        ) : (
          <div className="racco-scroll" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
              <thead>
                <tr style={{ background: 'var(--ink-50)', borderBottom: '1px solid var(--border)' }}>
                  {['Child', 'Case Type', 'Outcome', 'Score', 'Psychologist', 'Last Session', staff ? null : ''].filter((h) => h !== null).map((h, i) => (
                    <th key={i} scope="col" style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const clickable = !staff;
                  const triage = r.result ? TRIAGE[r.result.classification] : null;
                  return (
                    <tr key={r.id} tabIndex={clickable ? 0 : undefined} role={clickable ? 'button' : undefined} aria-label={clickable ? `View ${r.name}'s assessment result` : undefined}
                      onClick={clickable ? () => setSel(r) : undefined}
                      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(r); } } : undefined}
                      style={{ borderBottom: '1px solid var(--ink-100)', cursor: clickable ? 'pointer' : 'default', transition: 'background var(--dur-fast) var(--ease-out)' }}
                      onMouseEnter={clickable ? (e) => (e.currentTarget.style.background = 'var(--blue-50)') : undefined}
                      onMouseLeave={clickable ? (e) => (e.currentTarget.style.background = 'transparent') : undefined}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: staff ? 'var(--text-strong)' : 'var(--blue-700)', whiteSpace: 'nowrap' }}>{r.name}</div>
                        <div className="racco-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.ref}</div>
                      </td>
                      <td style={td}>{r.caseType}</td>
                      <td style={{ padding: '12px 16px' }}>{triage ? <SeverityBadge level={triage.level} size="sm" /> : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                      <td style={{ padding: '12px 16px' }}><span className="racco-mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{r.result && r.result.behavioral_score != null ? `${r.result.behavioral_score}` : '—'}</span></td>
                      <td style={td}>{r.psychologist}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.date}</td>
                      {!staff && <td style={{ padding: '12px 16px', textAlign: 'right' }}><Icon name="chevron-right" size={16} style={{ color: 'var(--text-faint)' }} /></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {sel && <ResultDrawer row={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function ResultDrawer({ row, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const res = row.result;
  const triage = res ? TRIAGE[res.classification] : null;
  const soft = triage?.tone === 'danger' ? 'var(--red-50)' : triage?.tone === 'warning' ? 'var(--warning-50)' : 'var(--success-50)';
  const line = triage?.tone === 'danger' ? 'var(--red-100)' : triage?.tone === 'warning' ? 'var(--warning-100)' : 'var(--success-100)';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,19,29,0.32)', display: 'flex', justifyContent: 'flex-end', zIndex: 60, animation: 'racco-fade-in var(--dur-base) var(--ease-out)' }}>
      <div role="dialog" aria-modal="true" aria-label={`Assessment result for ${row.name}`} onClick={(e) => e.stopPropagation()} style={{ width: 440, maxWidth: '92%', height: '100%', background: 'var(--surface)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', animation: 'racco-slide-left var(--dur-slow) var(--ease-out)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ink-50)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text-strong)' }}>{row.name}</div>
            <div className="racco-mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.ref} · {row.caseType}</div>
          </div>
          <button onClick={onClose} aria-label="Close panel" title="Close" style={iconBtn('var(--text-muted)', 32)}><Icon name="x" size={17} /></button>
        </div>

        <div className="racco-scroll" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div className="racco-eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>Automated analysis</div>
            {res ? (
              <div style={{ background: soft, border: `1px solid ${line}`, borderRadius: 'var(--radius-lg)', padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <SeverityBadge level={triage.level}>{res.classification}</SeverityBadge>
                  {res.behavioral_score != null && <Badge tone="brand" solid>Score {res.behavioral_score} / 100</Badge>}
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--text-body)', lineHeight: 1.6, margin: '0 0 8px' }}>{res.recommendation_text}</p>
                {res.priority_level && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Priority: {res.priority_level}</span>}
              </div>
            ) : (
              <div style={{ background: 'var(--ink-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, fontSize: 13, color: 'var(--text-muted)' }}>No automated analysis for this assessment.</div>
            )}
          </div>

          <div>
            <div className="racco-eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>Psychologist's clinical notes</div>
            <div style={{ background: 'var(--ink-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div><div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Final classification</div><div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)' }}>{row.cls}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Signed by</div><div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)' }}>{row.psychologist}</div></div>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>{row.notes || '—'}</p>
            </div>
          </div>

          <Alert disclaimer title="Read-only record:">This is the signed assessment on file with NACC. To revise it, run a new session from Assessment Tools.</Alert>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-faint)' }}>
            <Icon name="calendar" size={14} /> Last session {row.date}
          </div>
        </div>
      </div>
    </div>
  );
}
