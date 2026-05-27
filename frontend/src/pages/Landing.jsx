import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    { icon: '🤖', title: 'AI Contract Generation',    desc: 'Type one sentence. Get a complete, legally-sound contract with all clauses in under 3 seconds.' },
    { icon: '✍️', title: 'Canvas E-Signature',        desc: 'Clients sign directly from their phone. Full audit trail with timestamp and IP address.' },
    { icon: '📊', title: 'Business Analytics',        desc: 'Track revenue, contracts, and client performance with beautiful charts.' },
    { icon: '🧾', title: 'Invoice System',            desc: 'Professional invoices with auto-numbering, line items, and payment tracking.' },
    { icon: '🧠', title: 'Smart RAG Learning',        desc: 'AI learns from your contract library to generate contracts that match your exact style.' },
    { icon: '📋', title: 'Templates Library',         desc: 'Save your best contracts as reusable templates organized by category.' },
    { icon: '⚠️', title: 'AI Risk Detector',          desc: 'Automatically scans every contract and flags missing or risky clauses.' },
    { icon: '🤝', title: 'AI Proposal Generator',     desc: 'Generate professional project proposals with timeline, pricing, and approach sections.' },
    { icon: '✏️', title: 'Contract Refinement Chat',  desc: 'Tell the AI what to change — it updates only that part of the contract instantly.' },
  ];

  const steps = [
    { num: '01', title: 'Describe your project',    desc: 'Type a one-line description of your project, timeline, and budget in plain English.' },
    { num: '02', title: 'AI generates contract',    desc: 'Get a complete, professional contract with all legal clauses in under 3 seconds.' },
    { num: '03', title: 'Client signs digitally',   desc: 'Share a public link. Client reviews and signs from any device, anywhere.' },
    { num: '04', title: 'Track and get paid',       desc: 'Send invoices, track payment status, and monitor your business growth.' },
  ];

  const stats = [
    { num: '3s',    label: 'to generate a contract' },
    { num: '25+',   label: 'API endpoints'           },
    { num: '100%',  label: 'free to start'           },
    { num: '24/7',  label: 'available online'        },
  ];

  const testimonials = [
    { name: 'Rahul M.',    role: 'React Developer',       text: 'Saved me hours every week. My clients love the professional contracts.' },
    { name: 'Priya S.',    role: 'UI/UX Designer',        text: 'The AI proposal generator alone is worth it. Wins me more clients.' },
    { name: 'Arjun K.',    role: 'Full Stack Freelancer',  text: 'Finally a tool built for Indian freelancers. The ₹ support is perfect.' },
  ];

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 80px', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>AI ContractKit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login"    style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, padding: '8px 16px', borderRadius: 8, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'white'}
            onMouseLeave={e => e.target.style.color = '#94a3b8'}>
            Sign In
          </Link>
          <Link to="/register"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', fontSize: 14, padding: '8px 20px', borderRadius: 8, fontWeight: 600, boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '100px 40px 80px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: '#a5b4fc', marginBottom: 28, fontWeight: 500 }}>
          <span>🚀</span> AI-Powered Freelancer Business OS
        </div>

        <h1 style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Generate Professional<br />Contracts with AI
        </h1>

        <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.7, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
          Stop spending hours writing contracts. Describe your project in one sentence and let AI generate a complete, legally-sound contract in seconds.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
          <Link to="/register"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', padding: '14px 36px', borderRadius: 10, fontSize: 16, fontWeight: 700, boxShadow: '0 8px 24px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            Start Free — No Credit Card ✨
          </Link>
          <Link to="/login"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 600 }}>
            Sign In →
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap' }}>
          {stats.map(({ num, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{num}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ padding: '80px', background: '#020817' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, marginBottom: 12 }}>Everything to run your freelance business</h2>
          <p style={{ color: '#64748b', fontSize: 16 }}>One platform. All features. Zero monthly fees.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title}
              style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 24, transition: 'all 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'white' }}>{title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '80px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, marginBottom: 12 }}>How it works</h2>
          <p style={{ color: '#64748b', fontSize: 16 }}>From idea to signed contract in under a minute</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {steps.map(({ num, title, desc }, i) => (
            <div key={num} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 28, display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#334155', flexShrink: 0, lineHeight: 1 }}>{num}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'white' }}>{title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', bottom: -10, right: 20, fontSize: 24, color: '#334155' }}>↓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: '80px', background: '#020817' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Loved by freelancers</h2>
          <p style={{ color: '#64748b', fontSize: 16 }}>Join hundreds of freelancers saving hours every week</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 960, margin: '0 auto' }}>
          {testimonials.map(({ name, role, text }) => (
            <div key={name} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 24, marginBottom: 16, color: '#6366f1' }}>❝</div>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 20 }}>{text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                  {name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ textAlign: 'center', padding: '100px 40px', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <h2 style={{ fontSize: 44, fontWeight: 800, marginBottom: 16, position: 'relative' }}>Ready to work smarter?</h2>
        <p style={{ color: '#94a3b8', fontSize: 17, marginBottom: 36, position: 'relative' }}>
          Join freelancers who save 5+ hours every week with AI ContractKit.
        </p>
        <Link to="/register"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', padding: '16px 44px', borderRadius: 10, fontSize: 17, fontWeight: 700, boxShadow: '0 8px 28px rgba(99,102,241,0.5)', display: 'inline-block', position: 'relative' }}>
          Get Started Free →
        </Link>
        <p style={{ color: '#475569', fontSize: 13, marginTop: 16, position: 'relative' }}>No credit card required. Free forever.</p>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '32px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>AI ContractKit</span>
        </div>
        <div style={{ fontSize: 13, color: '#475569' }}>
          Built by{' '}
          <a href="https://github.com/Shreyaskale7" target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>
            Shreyas Kale
          </a>
          {' '}·{' '}
          <a href="https://github.com/Shreyaskale7/AI-Contractkit" target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>
            GitHub
          </a>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/login"    style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}>Sign In</Link>
          <Link to="/register" style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;