import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm]       = useState({ name:'', email:'', password:'', businessName:'' });
  const [loading, setLoading] = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data, res.data.token);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { key:'name',         label:'Full Name',      type:'text',     placeholder:'Shreyas Kumar' },
    { key:'businessName', label:'Business Name',  type:'text',     placeholder:'Shreyas Studio' },
    { key:'email',        label:'Email',          type:'email',    placeholder:'you@example.com' },
    { key:'password',     label:'Password',       type:'password', placeholder:'••••••••' },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
      <div style={{ background:'white', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.1)', padding:40, width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:32 }}>⚡</div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#4f46e5', marginTop:8 }}>Create Account</h1>
          <p style={{ color:'#94a3b8', marginTop:4 }}>Start managing contracts with AI</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>{label}</label>
              <input type={type} required={key !== 'businessName'} value={form[key]}
                onChange={e => setForm({...form, [key]: e.target.value})}
                placeholder={placeholder}
                style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:14, outline:'none', boxSizing:'border-box' }}
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ width:'100%', background:'#4f46e5', color:'white', border:'none', borderRadius:8, padding:'12px', fontSize:15, fontWeight:600, cursor:'pointer', marginTop:8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', color:'#94a3b8', marginTop:24, fontSize:14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#4f46e5', fontWeight:500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;