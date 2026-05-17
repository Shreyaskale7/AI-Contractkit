import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getClients, getContracts, getInvoices } from '../services/api';
import { Link } from 'react-router-dom';
import { StatCardSkeleton, TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const StatCard = ({ label, value, sub, icon, color, bg }) => (
  <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</div>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ clients: 0, contracts: 0, invoices: 0, revenue: 0, pending: 0, signed: 0 });
  const [recentContracts, setRecentContracts] = useState([]);
  const [recentInvoices, setRecentInvoices]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, co, inv] = await Promise.all([getClients(), getContracts(), getInvoices()]);
        const revenue = inv.data.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
        const pending = inv.data.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.totalAmount, 0);
        const signed  = co.data.filter(c => c.status === 'signed').length;
        setStats({ clients: c.data.length, contracts: co.data.length, invoices: inv.data.length, revenue, pending, signed });
        setRecentContracts(co.data.slice(0, 5));
        setRecentInvoices(inv.data.slice(0, 5));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statusBadge = (status) => {
    const map = {
      draft:   { bg: '#f8fafc', color: '#64748b', label: 'Draft' },
      sent:    { bg: '#fffbeb', color: '#d97706', label: 'Sent' },
      signed:  { bg: '#f0fdf4', color: '#16a34a', label: 'Signed' },
      unpaid:  { bg: '#fffbeb', color: '#d97706', label: 'Unpaid' },
      paid:    { bg: '#f0fdf4', color: '#16a34a', label: 'Paid' },
      overdue: { bg: '#fef2f2', color: '#dc2626', label: 'Overdue' },
    };
    const s = map[status] || map.draft;
    return (
      <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>Here's your business overview for today.</p>
          </div>
          <Link to="/contracts/generate"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
            ✨ Generate AI Contract
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {loading ? (
            Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Total Revenue"   value={`₹${stats.revenue.toLocaleString()}`} sub="From paid invoices" icon="💰" bg="#f0fdf4" color="#16a34a" />
              <StatCard label="Pending Revenue" value={`₹${stats.pending.toLocaleString()}`}  sub="Awaiting payment"   icon="⏳" bg="#fffbeb" color="#d97706" />
              <StatCard label="Total Clients"   value={stats.clients}  sub="Active clients" icon="👥" bg="#eef2ff" color="#6366f1" />
              <StatCard label="Signed Contracts" value={stats.signed}  sub={`of ${stats.contracts} contracts`} icon="✅" bg="#f0fdf4" color="#16a34a" />
            </>
          )}
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Recent Contracts */}
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Recent Contracts</div>
              <Link to="/contracts" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
            </div>
            {loading ? (
              <TableSkeleton rows={5} />
            ) : recentContracts.length === 0 ? (
              <EmptyState
                icon="📄"
                title="No contracts yet"
                description="Generate your first AI contract in seconds."
                actionLabel="✨ Generate"
                actionTo="/contracts/generate"
              />
            ) : recentContracts.map((c, i) => (
              <div key={c._id} style={{ padding: '12px 20px', borderBottom: i < recentContracts.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', marginBottom: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.clientId?.name || 'No client'}</div>
                </div>
                {statusBadge(c.status)}
              </div>
            ))}
          </div>

          {/* Recent Invoices */}
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Recent Invoices</div>
              <Link to="/invoices" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
            </div>
            {loading ? (
              <TableSkeleton rows={5} />
            ) : recentInvoices.length === 0 ? (
              <EmptyState
                icon="🧾"
                title="No invoices yet"
                description="Create your first invoice to manage payments."
                actionLabel="🧾 Create Invoice"
                actionTo="/invoices"
              />
            ) : recentInvoices.map((inv, i) => (
              <div key={inv._id} style={{ padding: '12px 20px', borderBottom: i < recentInvoices.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', marginBottom: 2 }}>{inv.invoiceNumber}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{inv.clientId?.name || 'No client'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>₹{inv.totalAmount?.toLocaleString()}</div>
                  {statusBadge(inv.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 24, background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { to: '/contracts/generate', label: '✨ Generate Contract', primary: true },
              { to: '/proposals/generate', label: '🤖 Generate Proposal', primary: false },
              { to: '/clients',            label: '👥 Add Client',        primary: false },
              { to: '/invoices',           label: '🧾 Create Invoice',    primary: false },
              { to: '/analytics',          label: '📊 View Analytics',   primary: false },
            ].map(({ to, label, primary }) => (
              <Link key={to} to={to} style={{
                padding: '9px 18px', borderRadius: 8, textDecoration: 'none',
                fontSize: 13, fontWeight: 500,
                background: primary ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'white',
                color: primary ? 'white' : '#374151',
                border: primary ? 'none' : '1px solid #e2e8f0',
                boxShadow: primary ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;