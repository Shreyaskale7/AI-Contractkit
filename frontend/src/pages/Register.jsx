import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '', businessName: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data, res.data.token);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f172a' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>AI ContractKit</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
          Start managing your<br />freelance business with AI
        </h1>
        <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.7, marginBottom: 40 }}>
          Join freelancers who use AI ContractKit to generate contracts, track invoices, and grow their business — all in one place.
        </p>
        {[
          '✅ AI-powered contract generation',
          '✅ Canvas e-signature for clients',
          '✅ Professional invoice system',
          '✅ Business analytics dashboard',
          '✅ Contract templates library',
          '✅ Free to use — no credit card',
        ].map(item => (
          <div key={item} style={{ fontSize: 14, color: '#94a3b8', marginBottom: 10 }}>{item}</div>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{ width: 480, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Create your account</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>Get started for free. No credit card required.</p>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name',         label: 'Full Name',      type: 'text',     placeholder: 'Shreyas Kale',      required: true },
              { key: 'businessName', label: 'Business Name',  type: 'text',     placeholder: 'Shreyas Studio',    required: false },
              { key: 'email',        label: 'Email Address',  type: 'email',    placeholder: 'you@example.com',   required: true },
              { key: 'password',     label: 'Password',       type: 'password', placeholder: '••••••••',          required: true },
            ].map(({ key, label, type, placeholder, required }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{label}{required && ' *'}</label>
                <input type={type} required={required} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.border = '1px solid #6366f1'}
                  onBlur={e => e.target.style.border = '1px solid #e2e8f0'}
                />
              </div>
            ))}
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 24, fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;