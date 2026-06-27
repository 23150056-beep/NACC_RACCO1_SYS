import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useActivity } from '../context/ActivityContext';
import { Card, Button, Alert, Select, FormField, ProgressSteps, Icon, PAGE } from '../ui';

function caseRef(id) { return `C-${String(id).padStart(4, '0')}`; }

const CLASSIFICATIONS = ['Trauma / Stressor-related', 'Behavioral / Conduct', 'Adjustment Disorder', 'Normal Development'];

export default function Assessment() {
  const { refresh: refreshActivity } = useActivity();
  const [step, setStep] = useState(1);
  const [children, setChildren] = useState([]);
  const [forms, setForms] = useState([]); // active questionnaires
  const [child, setChild] = useState('');
  const [formId, setFormId] = useState('');
  const [stype, setStype] = useState('Intake / Baseline');
  const [answers, setAnswers] = useState({}); // { [questionId]: answerText }
  const [cls, setCls] = useState('Normal Development');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/children/').then((r) => setChildren(r.data)).catch(() => {});
    api.get('/active-questionnaires/').then((r) => setForms(r.data)).catch(() => {});
  }, []);

  const childObj = children.find((c) => String(c.id) === String(child));
  const form = forms.find((f) => String(f.id) === String(formId));
  const questions = form?.questions || [];
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] != null && answers[q.id] !== '');

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    setError('');
    try {
      await api.post('/assessments/', {
        child: Number(child),
        questionnaire: form.id,
        assessment_type: stype,
        classification: cls,
        notes,
        responses: questions.map((q) => ({ question: q.id, answer: String(answers[q.id]) })),
      });
      setSent(true);
      refreshActivity();
      setTimeout(() => {
        setSent(false); setStep(1); setChild(''); setFormId(''); setAnswers({}); setNotes('');
      }, 2600);
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Submit failed'));
    }
  };

  const setAnswer = (qid, val) => setAnswers((a) => ({ ...a, [qid]: val }));

  return (
    <div style={PAGE}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Card padding="28px">
          <div style={{ marginBottom: 26 }}>
            <ProgressSteps steps={['Select Child', 'Questionnaire', 'Responses', 'Review & Sign']} current={step} />
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
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, marginBottom: 18 }}>Choose a questionnaire</h2>
              {forms.length === 0
                ? <Alert tone="warning" icon={<Icon name="alert-triangle" size={18} />}>No published questionnaires yet. Create and publish one under <strong>Assessment Instruments</strong> first.</Alert>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    <FormField label="Instrument">
                      <Select value={formId} onChange={(e) => { setFormId(e.target.value); setAnswers({}); }}>
                        <option value="">— Select —</option>
                        {forms.map((f) => <option key={f.id} value={f.id}>{f.title}{f.age_group ? ` (${f.age_group})` : ''}</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Session Type">
                      <Select value={stype} onChange={(e) => setStype(e.target.value)}>
                        <option>Intake / Baseline</option><option>Regular Check-in</option><option>Incident Follow-up</option>
                      </Select>
                    </FormField>
                  </div>
                )}
              {form && <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>{questions.length} question(s){form.description ? ` · ${form.description}` : ''}</div>}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, marginBottom: 4 }}>{form?.title || 'Questionnaire'}</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 18 }}>Answer each item based on the session.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {questions.map((q, i) => (
                  <div key={q.id} style={{ background: 'var(--ink-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', marginBottom: 11 }}>{i + 1}. {q.question_text}</p>
                    <QuestionInput question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              {sent && (
                <div style={{ position: 'fixed', top: 78, right: 26, zIndex: 50 }}>
                  <Alert tone="success" icon={<Icon name="check-circle-2" size={18} />} style={{ boxShadow: 'var(--shadow-lg)' }}>Assessment saved to NACC.</Alert>
                </div>
              )}
              {error && <Alert tone="danger" icon={<Icon name="alert-triangle" size={18} />} style={{ marginBottom: 14 }}>{error}</Alert>}

              {childObj && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px' }}>For <strong style={{ color: 'var(--text-strong)' }}>{childObj.fullname}</strong> · <span className="racco-mono">{caseRef(childObj.id)}</span> · {form?.title} · {stype}</p>}

              <div style={{ background: 'var(--ink-50)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-xl)', padding: 22, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="sparkles" size={18} style={{ color: 'var(--text-faint)' }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-muted)' }}>Automated analysis arrives in Phase 3</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-faint)', margin: '8px 0 0' }}>Behavioral scoring and AI recommendations will appear here once the analysis engine is built. For now, record your clinical judgment below.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormField label="Practitioner classification">
                  <Select value={cls} onChange={(e) => setCls(e.target.value)}>
                    {CLASSIFICATIONS.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </FormField>
                <FormField label="Detailed psychologist's assessment" required hint="Required before the assessment can be signed.">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} placeholder="Observations, behavioral patterns, recommended interventions…" style={{ width: '100%', resize: 'vertical', padding: '12px 13px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-strong)', outline: 'none', lineHeight: 1.55 }} />
                </FormField>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 26, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <Button variant="ghost" disabled={step === 1} onClick={back} iconLeft={<Icon name="arrow-left" size={17} />}>Back</Button>
            {step < 4
              ? <Button variant="primary" onClick={next} disabled={(step === 1 && !child) || (step === 2 && !formId) || (step === 3 && !allAnswered)} iconRight={<Icon name="arrow-right" size={17} />}>Next Step</Button>
              : <Button variant="primary" disabled={!notes.trim() || sent} onClick={submit} iconLeft={<Icon name="pen-line" size={17} />}>Sign &amp; Submit to NACC</Button>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuestionInput({ question, value, onChange }) {
  const type = question.question_type;
  const pill = (label, on) => ({
    padding: '8px 14px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    fontWeight: 700, fontSize: 13, border: `1.5px solid ${on ? 'var(--blue-600)' : 'var(--border-strong)'}`,
    background: on ? 'var(--blue-600)' : 'var(--surface)', color: on ? '#fff' : 'var(--text-body)', transition: 'var(--transition-base)',
  });
  if (type === 'rating_scale') {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onChange(String(n))} style={{ ...pill(String(n), value === String(n)), width: 40, height: 40, borderRadius: '50%', padding: 0 }}>{n}</button>
        ))}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)', marginLeft: 6 }}><span>Never</span><span>Always</span></div>
      </div>
    );
  }
  const opts = type === 'yes_no' ? ['Yes', 'No'] : (question.options || []);
  if (opts.length === 0) {
    return <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Answer" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: 14 }} />;
  }
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {opts.map((o) => <button key={o} onClick={() => onChange(o)} style={pill(o, value === o)}>{o}</button>)}
    </div>
  );
}
