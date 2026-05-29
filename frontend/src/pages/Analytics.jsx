import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getAnalytics } from '../services/api';

const COLORS = ['#0497f9', '#0d9488', '#d97706', '#dc2626', '#15355c'];

const Analytics = () => {
  const [data, setData] = useState(null);
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

  if (loading) {
    return (
      <PageShell title="Analytics" subtitle="Your business performance at a glance.">
        <p className="text-secondary">Loading analytics…</p>
      </PageShell>
    );
  }

  const invoicePieData = [
    { name: 'Paid', value: data.invoiceStats.paid },
    { name: 'Unpaid', value: data.invoiceStats.unpaid },
    { name: 'Overdue', value: data.invoiceStats.overdue },
  ].filter(d => d.value > 0);

  const contractPieData = [
    { name: 'Draft', value: data.contractStats.draft },
    { name: 'Sent', value: data.contractStats.sent },
    { name: 'Signed', value: data.contractStats.signed },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total revenue', value: `₹${data.totals.totalRevenue.toLocaleString()}` },
    { label: 'Pending revenue', value: `₹${data.totals.pendingRevenue.toLocaleString()}` },
    { label: 'Total clients', value: data.totals.clients },
    { label: 'Total contracts', value: data.totals.contracts },
  ];

  return (
    <PageShell title="Analytics" subtitle="Your business performance at a glance.">
      <div className="stat-grid-4" style={{ marginBottom: 32 }}>
        {statCards.map((item, i) => (
          <div key={item.label} className={`card card-stat page-enter stagger-${i + 1}`}>
            <div className="card-stat-label">{item.label}</div>
            <div className="card-stat-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="card card-body" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Revenue over time</h2>
        {data.revenueByMonth.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }} className="text-secondary">
            No paid invoices yet — revenue will appear here once invoices are marked as paid.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={v => `₹${v.toLocaleString()}`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="var(--saas-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card card-body">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Invoice status</h2>
          {invoicePieData.length === 0 ? (
            <div className="text-secondary" style={{ textAlign: 'center', padding: 40 }}>No invoices yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={invoicePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {invoicePieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card card-body">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Contract status</h2>
          {contractPieData.length === 0 ? (
            <div className="text-secondary" style={{ textAlign: 'center', padding: 40 }}>No contracts yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={contractPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {contractPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card card-body">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Top clients by revenue</h2>
        {data.topClients.length === 0 ? (
          <div className="text-secondary" style={{ textAlign: 'center', padding: 40 }}>No paid invoices yet.</div>
        ) : (
          data.topClients.map((client, i) => (
            <div key={i} className="row-divider" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
              <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 13 }}>{i + 1}</div>
              <div style={{ flex: 1, fontWeight: 500 }}>{client.name}</div>
              <div style={{ fontWeight: 600, color: 'var(--color-surface-strong)' }}>₹{client.revenue.toLocaleString()}</div>
              <div style={{ width: 120, height: 8, background: 'var(--color-border-subtle)', borderRadius: 8 }}>
                <div style={{ width: `${(client.revenue / data.topClients[0].revenue) * 100}%`, height: 8, background: 'var(--color-surface-strong)', borderRadius: 8 }} />
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
};

export default Analytics;
