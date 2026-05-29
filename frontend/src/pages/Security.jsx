import PageShell from '../components/PageShell';
import { Link } from 'react-router-dom';

const securityFeatures = [
  { icon: '🔐', title: 'End-to-end encryption', desc: 'All contract data encrypted at rest and in transit using AES-256.' },
  { icon: '✓', title: 'Audit logging', desc: 'Every view, edit, and signature event is logged with timestamp and actor.' },
  { icon: '◈', title: 'Access controls', desc: 'Role-based permissions for operators and authenticated users.' },
  { icon: '▦', title: 'Compliance scanning', desc: 'AI flags risky clauses, missing terms, and jurisdiction conflicts.' },
];

const auditLog = [
  { action: 'Contract signed', user: 'Sarah M.', time: '2 min ago', status: 'success' },
  { action: 'Login from new device', user: 'Marcus C.', time: '18 min ago', status: 'info' },
  { action: 'Invoice payment received', user: 'System', time: '1 hr ago', status: 'success' },
  { action: 'Failed login attempt', user: 'Unknown IP', time: '3 hr ago', status: 'warning' },
];

const Security = () => (
  <PageShell
    title="Security"
    subtitle="Monitor compliance, access controls, and audit activity for your AI ContractKit workspace."
    actions={
      <Link to="/profile" className="btn btn-secondary">Security settings</Link>
    }
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 32 }}>
      {[
        { label: 'Security score', value: '98%', meta: 'Last scan: today' },
        { label: 'Active sessions', value: '2', meta: 'This account' },
        { label: 'Audit events', value: '847', meta: 'Last 30 days' },
        { label: 'Open alerts', value: '0', meta: 'All clear' },
      ].map((item, i) => (
        <div key={item.label} className={`card card-stat page-enter stagger-${i + 1}`}>
          <div className="card-stat-label">{item.label}</div>
          <div className="card-stat-value">{item.value}</div>
          <div className="text-secondary" style={{ fontSize: 13 }}>{item.meta}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div style={{ fontSize: 16, fontWeight: 600 }}>Security controls</div>
        </div>
        <div style={{ padding: '8px 0' }}>
          {securityFeatures.map((f, i) => (
            <div key={f.title} className={`row-divider${i % 2 === 0 ? ' row-alt' : ''}`} style={{ padding: '18px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">{f.icon}</span>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{f.title}</div>
                <div className="text-secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div style={{ fontSize: 16, fontWeight: 600 }}>Recent audit log</div>
          <span className="badge badge-signed">Live</span>
        </div>
        <div>
          {auditLog.map((entry, i) => (
            <div key={i} className={`row-divider${i % 2 === 0 ? ' row-alt' : ''}`} style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{entry.action}</div>
                <div className="text-secondary" style={{ fontSize: 12, marginTop: 4 }}>{entry.user}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className={`badge badge-${entry.status === 'success' ? 'signed' : entry.status === 'warning' ? 'sent' : 'draft'}`}>
                  {entry.status}
                </span>
                <div className="text-secondary" style={{ fontSize: 11, marginTop: 6 }}>{entry.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </PageShell>
);

export default Security;
