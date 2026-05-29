import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { AuthDivider, GoogleButton, PasswordInput, PasswordStrength } from '../components/auth/AuthExtras';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreed) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        businessName: '',
      });
      loginUser(res.data, res.data.token);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Start for free"
      subtitle="Join thousands of freelancers who run their business on AI ContractKit."
      perks={[
        { title: 'Generate contracts', desc: 'AI-drafted agreements in seconds' },
        { title: 'Track invoices', desc: 'Monitor payment status in real time' },
        { title: 'Business insights', desc: 'Revenue and contract analytics' },
      ]}
    >
      <h1 className="auth-form-title">Create your account</h1>
      <p className="auth-form-subtitle">No credit card required</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field-row">
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-first">First name</label>
            <input
              id="reg-first"
              className="auth-input"
              type="text"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="First name"
              autoComplete="given-name"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-last">Last name</label>
            <input
              id="reg-last"
              className="auth-input"
              type="text"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Last name"
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="reg-email">Work email</label>
          <input
            id="reg-email"
            className="auth-input"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="reg-password">Password</label>
          <PasswordInput
            id="reg-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
          />
          <PasswordStrength password={form.password} />
        </div>
        <label className="auth-checkbox-row">
          <input
            type="checkbox"
            checked={form.agreed}
            onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
            className="auth-checkbox"
          />
          <span>
            I agree to the{' '}
            <a href="/" className="auth-link" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            {' '}and{' '}
            <a href="/" className="auth-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          </span>
        </label>
        <button type="submit" className="auth-btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>

      <AuthDivider />
      <GoogleButton onClick={() => toast('Google sign-in coming soon')} />

      <p className="auth-form-footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
