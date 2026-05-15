import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getClients, getContracts, getInvoices } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ clients:0, contracts:0, invoices:0, revenue:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [c, co, inv] = await Promise.all([getClients(), getContracts(), getInvoices()]);
        const revenue = inv.data.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
        setStats({ clients: c.data.length, contracts: co.data.length, invoices: inv.data.length, revenue });
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const cards = [
    { label:'Total Clients',  value: stats.clients,                          bg:'#eef2ff', color:'#4f46e5', emoji:'👥' },
    { label:'Contracts',      value: stats.contracts,                         bg:'#fdf4ff', color:'#9333ea', emoji:'📄' },
    { label:'Invoices',       value: stats.invoices,                          bg:'#f0fdf4', color:'#16a34a', emoji:'🧾' },
    { label:'Revenue Earned', value: `₹${stats.revenue.toLocaleString()}`,    bg:'#fff7ed', color:'#ea580c', emoji:'💰' },
  ];

  return (
    <div style={{ display:'flex' }}>
      <Sidebar />
      <main style={{ marginLeft:240, flex:1, padding:40, minHeight:'100vh' }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#1e293b' }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color:'#94a3b8', marginTop:4 }}>Here's your business overview.</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:20, marginBottom:32 }}>
          {cards.map(({ label, value, bg, color, emoji }) => (
            <div key={label} style={{ background:'white', borderRadius:12, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ background:bg, color, borderRadius:8, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{emoji}</div>
                <span style={{ fontSize:13, color:'#94a3b8' }}>{label}</span>
              </div>
              <div style={{ fontSize:28, fontWeight:700, color:'#1e293b' }}>{loading ? '...' : value}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background:'white', borderRadius:12, padding:28, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize:17, fontWeight:600, marginBottom:16, color:'#1e293b' }}>Quick Actions</h2>
          <div style={{ display:'flex', gap:12 }}>
            <Link to="/contracts/generate" style={{ background:'#4f46e5', color:'white', padding:'12px 24px', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:600 }}>
              ✨ Generate AI Contract
            </Link>
            <Link to="/clients" style={{ background:'white', border:'1px solid #e2e8f0', color:'#374151', padding:'12px 24px', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:500 }}>
              👥 Add Client
            </Link>
            <Link to="/invoices" style={{ background:'white', border:'1px solid #e2e8f0', color:'#374151', padding:'12px 24px', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:500 }}>
              🧾 Create Invoice
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;