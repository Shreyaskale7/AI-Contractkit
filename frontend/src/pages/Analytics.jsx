import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { getAnalytics } from '../services/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const res = await getAnalytics();
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  fetchAnalytics();
}, []);

  if (loading) return (
    <div style={{ display:'flex' }}>
      <Sidebar />
      <main style={{ marginLeft:240, flex:1, padding:40 }}>
        <div style={{ color:'#94a3b8', fontSize:14 }}>Loading analytics...</div>
      </main>
    </div>
  );

  const invoicePieData = [
    { name: 'Paid',    value: data.invoiceStats.paid },
    { name: 'Unpaid',  value: data.invoiceStats.unpaid },
    { name: 'Overdue', value: data.invoiceStats.overdue },
  ].filter(d => d.value > 0);

  const contractPieData = [
    { name: 'Draft',  value: data.contractStats.draft },
    { name: 'Sent',   value: data.contractStats.sent },
    { name: 'Signed', value: data.contractStats.signed },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total Revenue',   value: `₹${data.totals.totalRevenue.toLocaleString()}`,   bg:'#eef2ff', color:'#4f46e5', emoji:'💰' },
    { label: 'Pending Revenue', value: `₹${data.totals.pendingRevenue.toLocaleString()}`, bg:'#fff7ed', color:'#ea580c', emoji:'⏳' },
    { label: 'Total Clients',   value: data.totals.clients,                                bg:'#f0fdf4', color:'#16a34a', emoji:'👥' },
    { label: 'Total Contracts', value: data.totals.contracts,                              bg:'#fdf4ff', color:'#9333ea', emoji:'📄' },
  ];

  return (
    <div style={{ display:'flex' }}>
      <Sidebar />
      <main style={{ marginLeft:240, flex:1, padding:40, background:'#f8fafc', minHeight:'100vh' }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>📊 Analytics</h1>
          <p style={{ color:'#94a3b8', marginTop:4 }}>Your business performance at a glance.</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, marginBottom:32 }}>
          {statCards.map(({ label, value, bg, color, emoji }) => (
            <div key={label} style={{ background:'white', borderRadius:12, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ background:bg, color, borderRadius:8, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{emoji}</div>
                <span style={{ fontSize:13, color:'#94a3b8' }}>{label}</span>
              </div>
              <div style={{ fontSize:26, fontWeight:700, color:'#1e293b' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div style={{ background:'white', borderRadius:12, padding:28, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', marginBottom:24 }}>
          <h2 style={{ fontSize:16, fontWeight:600, color:'#1e293b', marginBottom:20 }}>💰 Revenue Over Time</h2>
          {data.revenueByMonth.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📈</div>
              <p>No paid invoices yet — revenue will appear here once invoices are marked as paid.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize:12, fill:'#94a3b8' }} />
                <YAxis tick={{ fontSize:12, fill:'#94a3b8' }} tickFormatter={v => `₹${v.toLocaleString()}`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Two Charts Row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }}>

          {/* Invoice Status Pie */}
          <div style={{ background:'white', borderRadius:12, padding:28, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize:16, fontWeight:600, color:'#1e293b', marginBottom:20 }}>🧾 Invoice Status</h2>
            {invoicePieData.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No invoices yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={invoicePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {invoicePieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Contract Status Pie */}
          <div style={{ background:'white', borderRadius:12, padding:28, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize:16, fontWeight:600, color:'#1e293b', marginBottom:20 }}>📄 Contract Status</h2>
            {contractPieData.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>No contracts yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={contractPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {contractPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div style={{ background:'white', borderRadius:12, padding:28, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize:16, fontWeight:600, color:'#1e293b', marginBottom:20 }}>🏆 Top Clients by Revenue</h2>
          {data.topClients.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🏆</div>
              <p>No paid invoices yet — top clients will appear here.</p>
            </div>
          ) : (
            <div>
              {data.topClients.map((client, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 0', borderBottom: i < data.topClients.length-1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'#eef2ff', color:'#4f46e5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex:1, fontWeight:500, color:'#1e293b' }}>{client.name}</div>
                  <div style={{ fontWeight:700, color:'#4f46e5', fontSize:16 }}>₹{client.revenue.toLocaleString()}</div>
                  <div style={{ width:120, height:8, background:'#f1f5f9', borderRadius:8 }}>
                    <div style={{ width:`${(client.revenue / data.topClients[0].revenue) * 100}%`, height:8, background:'#4f46e5', borderRadius:8 }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Analytics;