import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';

const features = [
  { icon: '✦', title: 'AI Contract Generation', desc: 'Describe your project in one sentence and get a complete, legally-sound contract in seconds.' },
  { icon: '✎', title: 'E-Signature Workflow', desc: 'Send secure signing links to clients. Track approvals and manage signatures from anywhere.' },
  { icon: '▦', title: 'Payment Tracking', desc: 'Manage invoices, track payments, and monitor revenue all in one dashboard.' },
  { icon: '◈', title: 'Risk Detection', desc: 'AI scans your contracts and flags missing clauses, risky language, and compliance issues.' },
  { icon: '▨', title: 'Smart Templates', desc: 'Build your own template library. Reuse and customize for faster contract generation.' },
  { icon: '▩', title: 'Business Analytics', desc: 'Real-time insights into contracts signed, revenue earned, and client performance.' },
];

const testimonials = [
  { name: 'Sarah Anderson', role: 'Freelance Designer', text: 'AI Contract saved me countless hours. What used to take days now takes minutes.' },
  { name: 'Marcus Chen', role: 'Web Developer', text: 'The AI contract generation is incredible. It\'s like having a lawyer on my team.' },
  { name: 'Emma Wilson', role: 'Content Creator', text: 'Finally, a platform built specifically for freelancers. Worth every penny.' },
];

const marqueeItems = [
  'SOC 2 ready infrastructure',
  'AES-256 encryption',
  'E-signatures compliant',
  'AI risk detection',
  'Real-time audit logs',
  'GDPR-friendly workflows',
  'Instant contract generation',
  'Payment tracking built-in',
];

const clauses = ['Scope & deliverables', 'Payment terms & conditions', 'Liability & dispute resolution'];

const Landing = () => {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className={`landing-nav page-enter${navScrolled ? ' scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sidebar-brand-icon" style={{ width: 36, height: 36 }} aria-hidden="true">⚡</div>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>AI Contract</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/login" className="link">Sign in</Link>
          <Link to="/register" className="btn btn-primary landing-cta-btn">Get started</Link>
        </div>
      </nav>

      <section className="landing-hero landing-hero-wrap">
        <div className="landing-hero-orbs" aria-hidden="true">
          <div className="landing-orb landing-orb-1" />
          <div className="landing-orb landing-orb-2" />
        </div>
        <div className="landing-hero-content" style={{ maxWidth: 1400, margin: '0 auto', padding: 'var(--space-5) var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div className="landing-badge hero-slide-in">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-surface-strong)' }} aria-hidden="true" />
                AI-powered contract platform for professionals
              </div>
              <h1 className="landing-display hero-slide-in hero-slide-in-delay-1">
                Contracts in <span className="landing-shimmer">seconds</span>, not weeks
              </h1>
              <p className="text-secondary hero-slide-in hero-slide-in-delay-2" style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 32, maxWidth: 500 }}>
                Generate professional contracts, collect signatures, and track payments — all powered by AI. The secure workspace for modern businesses.
              </p>
              <div className="hero-slide-in hero-slide-in-delay-3" style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary landing-cta-btn" style={{ padding: '14px 32px' }}>
                  Get started free
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px' }}>
                  Watch demo
                </Link>
              </div>
              <p className="text-secondary hero-slide-in hero-slide-in-delay-3" style={{ fontSize: 13 }}>No credit card required. Start free, upgrade anytime.</p>
            </div>

            <div className="page-enter stagger-2" style={{ position: 'relative', height: 480 }}>
              <div className="landing-preview" style={{ position: 'absolute', inset: 0, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>Service Agreement</span>
                  <span className="badge badge-signed">Signed</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                  {clauses.map((item) => (
                    <div key={item} className="landing-clause-item" style={{ background: 'var(--color-surface-raised)', padding: 14, borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-status-success)', flexShrink: 0 }} aria-hidden="true" />
                      <span style={{ fontSize: 13 }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="landing-preview-bar" />
                  <div className="landing-preview-bar" />
                  <div className="landing-preview-bar pending" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-marquee-wrap" aria-hidden="true">
        <div className="landing-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="landing-marquee-item">
              <span className="landing-marquee-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <section style={{ padding: 'var(--space-5) var(--space-4)', background: 'var(--color-surface-muted)', borderTop: '1px solid var(--color-border-default)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 16 }}>Everything you need to run your business</h2>
              <p className="text-secondary" style={{ fontSize: 16, maxWidth: 600, margin: '0 auto' }}>Designed for modern freelancers and small teams</p>
            </div>
          </ScrollReveal>
          <div className="landing-feature-grid">
            {features.map((feature, idx) => (
              <ScrollReveal key={feature.title} delay={idx * 80}>
                <div className="landing-feature-card">
                  <div className="landing-feature-icon" aria-hidden="true">{feature.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{feature.title}</h3>
                  <p className="text-secondary" style={{ lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-5) var(--space-4)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 16 }}>Trusted by professionals worldwide</h2>
              <p className="text-secondary" style={{ fontSize: 16 }}>Join thousands who've simplified their contract operations</p>
            </div>
          </ScrollReveal>
          <div className="landing-feature-grid">
            {testimonials.map((t, idx) => (
              <ScrollReveal key={t.name} delay={idx * 100}>
                <div className="card" style={{ padding: 28, height: '100%' }}>
                  <div style={{ marginBottom: 16, color: 'var(--color-surface-strong)', letterSpacing: 2 }} aria-label="5 stars">★★★★★</div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</p>
                    <p className="text-secondary" style={{ fontSize: 13 }}>{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <ScrollReveal as="section" className="landing-cta-section">
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 20 }}>Ready to transform your business?</h2>
          <p style={{ fontSize: 18, opacity: 0.85, marginBottom: 32, lineHeight: 1.7 }}>
            Join thousands of professionals who trust AI Contract to manage contracts, proposals, and payments securely.
          </p>
          <Link to="/register" className="btn btn-secondary landing-cta-btn" style={{ background: 'var(--color-surface-raised)', color: 'var(--color-surface-strong)', padding: '14px 32px' }}>
            Get started free
          </Link>
        </div>
      </ScrollReveal>

      <footer style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface-muted)', borderTop: '1px solid var(--color-border-default)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="sidebar-brand-icon" style={{ width: 32, height: 32, fontSize: 14 }} aria-hidden="true">⚡</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>AI Contract</span>
          </div>
          <div style={{ display: 'flex', gap: 32, fontSize: 14 }}>
            <Link to="/security" className="link">Security</Link>
            <span className="text-secondary" style={{ cursor: 'pointer' }}>Privacy</span>
            <span className="text-secondary" style={{ cursor: 'pointer' }}>Terms</span>
            <span className="text-secondary" style={{ cursor: 'pointer' }}>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
