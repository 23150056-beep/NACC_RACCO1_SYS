import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Card, Button, Alert, Select, FormField, SeverityBadge, ConfidenceMeter, ProgressSteps, Icon, PAGE } from '../ui';
import { questions, scoreToResult } from '../data/seedData';

function caseRef(id) { return `C-${String(id).padStart(4, '0')}`; }

export default function Assessment() {
  const [step, setStep] = useState(1);
  const [children, setChildren] = useState([]);
  const [child, setChild] = useState('');
  const [stype, setStype] = useState('Intake / Baseline');
  const [answers, setAnswers] = useState({});
  const [agree, setAgree] = useState('');
  const [cls, setCls] = useState('');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => { api.get('/children/').then((r) => setChildren(r.data)).catch(() => {}); }, []);

  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const allAnswered = questions.every((_, i) => answers[i] != null);
  const result = scoreToResult(total);
  const childObj = children.find((c) => String(c.id) === String(child));

  const next = () => setStep((s) => {
    const n = Math.min(4, s + 1);
    if (n === 4 && !cls) setCls(result.cls);
    return n;
  });
  const back = () => setStep((s) => Math.max(1, s - 1));
  const sign = () => { setSent(true); setTimeout(() => setSent(false), 3400); };

  return (
    <div style={PAGE}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Card padding="28px">
          <div style={{ marginBottom: 26 }}>
            <ProgressSteps steps={['Select Child', 'Session Details', 'Questionnaire', 'AI Analysis & Notes']} current={step} />
          </div>

          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, marginBottom: 4 }}>Select a child for assessment</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 18 }}>Children with an active record appear here.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {children.length === 0 && <Alert tone="info" icon={<Icon name="info" size={18} />}>No child records available yet. Add children under Children Records first.</Alert>}
                {children.map((c) => (
                  <button key={c.id} onClick={() => setChild(String(c.id))} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px', textAlign: 'left', cursor: 'pointer', borderRadius: 'var(--radius-lg)', background: String(child) === String(c.id) ? 'var(--blue-50)' : 'var(--surface)', border: `1.5px solid ${String(child) === String(c.id) ? 'var(--blue-500)' : 'var(--border)'}`, transition: 'var(--transition-base)' }}>
                    <span style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--ink-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flex: 'none' }}><Icon name="user" size={19} /></span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5, color: 'var(--text-strong)' }}>{c.fullname}</span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)' }}><span className="racco-mono">{caseRef(c.id)}</span>{c.case_type ? ` · ${c.case_type}` : ''}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, marginBottom: 18 }}>Session information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <FormField label="Session Date"><Select defaultValue="today"><option value="today">Today</option><option>Schedule for later…</option></Select></FormField>
                <FormField label="Session Type">
                  <Select value={stype} onChange={(e) => setStype(e.target.value)}>
                    <option>Intake / Baseline</option><option>Regular Check-in</option><option>Incident Follow-up</option>
                  </Select>
                </FormField>
              </div>
              <div style={{ marginTop: 18 }}>
                <Alert tone="info" icon={<Icon name="info" size={18} />}>Responses are confidential and protected under <strong>RA 10173 (Data Privacy Act)</strong>.</Alert>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, marginBottom: 4 }}>Clinical questionnaire</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 18 }}>Rate each item from 1 (Never) to 5 (Always) based on the session.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {questions.map((qn, i) => (
                  <div key={i} style={{ background: 'var(--ink-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', marginBottom: 11 }}>{i + 1}. {qn}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((n) => {
                        const on = answers[i] === n;
                        return (
                          <button key={n} onClick={() => setAnswers((a) => ({ ...a, [i]: n }))} style={{ width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, border: `2px solid ${on ? 'var(--blue-600)' : 'var(--border-strong)'}`, background: on ? 'var(--blue-600)' : 'var(--surface)', color: on ? '#fff' : 'var(--text-muted)', transform: on ? 'scale(1.08)' : 'none', boxShadow: on ? 'var(--shadow-brand)' : 'none', transition: 'var(--transition-base)' }}>{n}</button>
                        );
                      })}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)', paddingBottom: 3, marginLeft: 6 }}><span>Never</span><span>Always</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              {sent && (
                <div style={{ position: 'fixed', top: 78, right: 26, zIndex: 50 }}>
                  <Alert tone="success" icon={<Icon name="check-circle-2" size={18} />} style={{ boxShadow: 'var(--shadow-lg)' }}>Assessment signed &amp; submitted securely to NACC.</Alert>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: 'var(--radius-md)', background: 'var(--blue-600)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="sparkles" size={16} /></span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, margin: 0 }}>AI sentiment analysis</h2>
              </div>
              {childObj && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px' }}>For <strong style={{ color: 'var(--text-strong)' }}>{childObj.fullname}</strong> · <span className="racco-mono">{caseRef(childObj.id)}</span> · {stype}</p>}

              <div style={{ background: result.tone === 'danger' ? 'var(--red-50)' : result.tone === 'warning' ? 'var(--warning-50)' : 'var(--success-50)', border: `1px solid ${result.tone === 'danger' ? 'var(--red-100)' : result.tone === 'warning' ? 'var(--warning-100)' : 'var(--success-100)'}`, borderRadius: 'var(--radius-xl)', padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                  <SeverityBadge level={result.level} size="lg">{result.label}</SeverityBadge>
                  <div style={{ width: 200 }}><ConfidenceMeter value={result.conf} tone={result.tone === 'danger' ? 'danger' : result.tone === 'warning' ? 'warning' : 'success'} threshold={80} /></div>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-strong)', fontWeight: 600, lineHeight: 1.55, margin: '16px 0 14px' }}>{result.text}</p>
                <Alert disclaimer title="Disclaimer:">This output is decision-support only and does not replace the professional clinical diagnosis mandated by NACC guidelines.</Alert>
              </div>

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 'var(--radius-md)', background: 'var(--ink-100)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="file-pen-line" size={16} /></span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, margin: 0 }}>Clinical notes</h2>
                </div>

                <div style={{ background: 'var(--ink-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)', marginBottom: 10 }}>Do you agree with the AI classification?</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Agree', 'Partially', 'Disagree'].map((o) => (
                      <button key={o} onClick={() => setAgree(o)} style={{ flex: 1, padding: '9px 8px', cursor: 'pointer', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, border: `1.5px solid ${agree === o ? 'var(--blue-600)' : 'var(--border-strong)'}`, background: agree === o ? 'var(--blue-600)' : 'var(--surface)', color: agree === o ? '#fff' : 'var(--text-body)', transition: 'var(--transition-base)' }}>{o}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <FormField label="Final practitioner classification">
                    <Select value={cls} onChange={(e) => setCls(e.target.value)}>
                      <option>Trauma / Stressor-related</option><option>Behavioral / Conduct</option><option>Adjustment Disorder</option><option>Normal Development</option>
                    </Select>
                  </FormField>
                  <FormField label="Detailed psychologist's assessment" required hint="Required before the assessment can be signed.">
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} placeholder="Observations, behavioral patterns, recommended interventions…" style={{ width: '100%', resize: 'vertical', padding: '12px 13px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-strong)', outline: 'none', lineHeight: 1.55 }} />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 26, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <Button variant="ghost" disabled={step === 1} onClick={back} iconLeft={<Icon name="arrow-left" size={17} />}>Back</Button>
            {step < 4
              ? <Button variant="primary" onClick={next} disabled={(step === 1 && !child) || (step === 3 && !allAnswered)} iconRight={<Icon name="arrow-right" size={17} />}>{step === 3 ? 'Run AI Analysis' : 'Next Step'}</Button>
              : <Button variant="primary" disabled={!agree || !notes.trim()} onClick={sign} iconLeft={<Icon name="pen-line" size={17} />}>Sign &amp; Submit to NACC</Button>}
          </div>
        </Card>
      </div>
    </div>
  );
}
