import PageShell from '../components/PageShell';
import { Link } from 'react-router-dom';

// Real, implemented security measures — no fabricated data or overstated claims.
const securityControls = [
  { icon: '🔑', title: 'Authentication', desc: 'Access is protected by JSON Web Tokens (JWT). Passwords are hashed with bcrypt and never stored in plaintext.' },
  { icon: '🧍', title: 'Per-user data isolation', desc: 'Every contract, client, and invoice query is scoped to your account. Users cannot read or modify each other\'s data.' },
  { icon: '🖋️', title: 'Tamper-evident signatures', desc: 'Each signature is stored with a timestamp, IP address, and a SHA-256 hash of the exact contract content, so any later change is detectable.' },
  { icon: '🧼', title: 'Input sanitization', desc: 'All AI- and client-generated HTML is sanitized with DOMPurify before rendering, preventing script injection (XSS).' },
  { icon: '🚦', title: 'Rate limiting', desc: 'Authentication and AI endpoints are rate-limited to guard against brute-force attempts and abuse.' },
  { icon: '⚠️', title: 'AI risk scanning', desc: 'Every generated contract is analyzed for risky or missing clauses and flagged by severity before you send it.' },
];

// Things we're honest about not having yet.
const roadmap = [
  'httpOnly-cookie sessions (currently JWT in browser storage)',
  'Certified e-signatures with a downloadable, independently verifiable certificate',
  'Encryption at rest for stored contract content',
  'An exportable, per-account audit trail',
];

const facts = [
  { label: 'Authentication', value: 'JWT' },
  { label: 'Password storage', value: 'bcrypt' },
  { label: 'Signature integrity', value: 'SHA-256' },
  { label: 'Data isolation', value: 'Per-user' },
];

const Security = () => (
  <PageShell
    title="Security"
    subtitle="How AI ContractKit protects your account and your clients' data."
    actions={
      <Link to="/profile" className="btn btn-secondary">Account settings</Link>
    }
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 32 }}>
      {facts.map((item, i) => (
        <div key={item.label} className={`card card-stat page-enter stagger-${i + 1}`}>
          <div className="card-stat-label">{item.label}</div>
          <div className="card-stat-value">{item.value}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div style={{ fontSize: 16, fontWeight: 600 }}>Security controls</div>
        </div>
        <div style={{ padding: '8px 0' }}>
          {securityControls.map((f, i) => (
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
          <div style={{ fontSize: 16, fontWeight: 600 }}>On the roadmap</div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <p className="text-secondary" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
            Being transparent about what isn't built yet. These hardening steps are planned:
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {roadmap.map((item) => (
              <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--saas-accent)', flexShrink: 0 }} aria-hidden="true">○</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </PageShell>
);

export default Security;
