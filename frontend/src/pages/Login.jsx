import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

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
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
      <div style={{ background:'white', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.1)', padding:40, width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:32 }}>⚡</div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#4f46e5', marginTop:8 }}>AI ContractKit</h1>
          <p style={{ color:'#94a3b8', marginTop:4 }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="you@example.com"
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:14, outline:'none', boxSizing:'border-box' }}
            />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>Password</label>
            <input type="password" required value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="••••••••"
              style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:14, outline:'none', boxSizing:'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading}
            style={{ width:'100%', background:'#4f46e5', color:'white', border:'none', borderRadius:8, padding:'12px', fontSize:15, fontWeight:600, cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', color:'#94a3b8', marginTop:24, fontSize:14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'#4f46e5', fontWeight:500 }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;