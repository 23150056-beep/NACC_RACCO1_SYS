import React, { useState } from 'react';
import { Card, Button, Badge, StatCard, Icon, PAGE } from '../ui';
import { compliance } from '../data/seedData';

export default function Compliance() {
  const [exporting, setExporting] = useState(false);
  return (
    <div style={PAGE}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button variant="secondary" onClick={() => { setExporting(true); setTimeout(() => setExporting(false), 1400); }} iconLeft={<Icon name={exporting ? 'loader' : 'download'} size={17} />}>
          {exporting ? 'Generating…' : 'Export Audit Report'}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label="Overall Compliance" value="94%" tone="success" trend="2%" trendDir="up" icon={<Icon name="shield-check" size={18} />} />
        <StatCard label="Overdue Cases" value={3} tone="red" hint="Needs attention" icon={<Icon name="alarm-clock" size={18} />} />
        <StatCard label="Auditable Records" value="1,204" tone="brand" icon={<Icon name="files" size={18} />} />
      </div>

      <Card eyebrow="Republic Acts" title="Regulatory Checklist" padding="22px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {compliance.map((c) => (
            <div key={c.law} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--ink-50)', borderLeft: `3px solid ${c.tone === 'success' ? 'var(--success-500)' : 'var(--warning-500)'}` }}>
              <span style={{ color: c.tone === 'success' ? 'var(--success-500)' : 'var(--warning-500)', marginTop: 1 }}><Icon name={c.tone === 'success' ? 'check-circle-2' : 'alert-triangle'} size={19} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}><span className="racco-mono" style={{ color: 'var(--blue-700)' }}>{c.law}</span> — {c.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>{c.note}</div>
              </div>
              <Badge tone={c.tone} solid={c.tone === 'warning'}>{c.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
