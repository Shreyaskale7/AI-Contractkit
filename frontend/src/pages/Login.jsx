import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { AuthDivider, GoogleButton, PasswordInput } from '../components/auth/AuthExtras';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data, res.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your AI ContractKit workspace — contracts, invoices, and analytics in one place."
      perks={[
        { title: 'Generate contracts', desc: 'AI-drafted agreements in seconds' },
        { title: 'Track invoices', desc: 'Monitor payment status in real time' },
        { title: 'Business insights', desc: 'Revenue and contract analytics' },
      ]}
    >
      <h1 className="auth-form-title">Sign in</h1>
      <p className="auth-form-subtitle">Enter your credentials to access your account</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label className="auth-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="auth-input"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="auth-field">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <Link to="/login" className="auth-link-sm" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="auth-btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <AuthDivider />
      <GoogleButton onClick={() => toast('Google sign-in coming soon')} />

      <p className="auth-form-footer">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="auth-link">Create one</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
