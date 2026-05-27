import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const PaymentSuccess = () => {
  const [searchParams]    = useSearchParams();
  const invoiceNumber     = searchParams.get('invoice');
  const [count, setCount] = useState(5);
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);

    const confettiTimer = setTimeout(() => setConfetti(false), 4000);

    return () => {
      clearInterval(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  const confettiPieces = Array(20).fill(0).map((_, i) => ({
    left:  `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    color: ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899'][i % 5],
    size:  `${Math.random() * 8 + 6}px`,
  }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', fontFamily: 'Inter, -apple-system, sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* Confetti */}
      {confetti && confettiPieces.map((p, i) => (
        <div key={i} style={{
          position: 'fixed', top: '-20px', left: p.left,
          width: p.size, height: p.size,
          background: p.color, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `fall 3s ${p.delay} linear forwards`,
          zIndex: 0,
        }} />
      ))}

      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scaleIn {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%      { box-shadow: 0 0 0 16px rgba(34,197,94,0); }
        }
      `}</style>

      <div style={{ background: 'white', borderRadius: 24, padding: '52px 48px', textAlign: 'center', maxWidth: 500, width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.12)', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease' }}>

        {/* Success Icon */}
        <div style={{
          width: 88, height: 88,
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, margin: '0 auto 28px',
          animation: 'scaleIn 0.5s ease, pulse 2s ease 0.5s infinite',
          boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
        }}>
          ✅
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
          Your payment has been processed successfully. Thank you!
        </p>

        {/* Invoice Badge */}
        {invoiceNumber && (
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 12, padding: '16px 24px', marginBottom: 28, display: 'inline-block' }}>
            <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Invoice Paid</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#15803d' }}>{invoiceNumber}</div>
          </div>
        )}

        {/* Details */}
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 28, textAlign: 'left' }}>
          {[
            { icon: '✅', label: 'Payment Status',  value: 'Completed',               color: '#16a34a' },
            { icon: '🔄', label: 'Invoice Status',   value: 'Automatically updated',   color: '#6366f1' },
            { icon: '📧', label: 'Confirmation',     value: 'Sent to your email',       color: '#f59e0b' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{icon}</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <Link to="/invoices"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
            View Invoices
          </Link>
          <Link to="/dashboard"
            style={{ background: 'white', border: '1px solid #e2e8f0', color: '#374151', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Dashboard
          </Link>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#94a3b8', fontSize: 12 }}>
          <span>⚡</span>
          <span>Powered by AI ContractKit × Stripe</span>
          <span>🔒</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;