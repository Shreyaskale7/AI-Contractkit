import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Search, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getClients, getContracts, getInvoices } from '../services/api';
import { TableSkeleton } from '../components/Skeleton';

const statusConfig = {
  draft: { className: 'dash-badge dash-badge--draft', label: 'DRAFT' },
  sent: { className: 'dash-badge dash-badge--pending', label: 'PENDING' },
  signed: { className: 'dash-badge dash-badge--signed', label: 'SIGNED' },
  paid: { className: 'dash-badge dash-badge--signed', label: 'PAID' },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ clients: 0, contracts: 0, revenue: 0, pending: 0, signed: 0 });
  const [recentContracts, setRecentContracts] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, co, inv] = await Promise.all([getClients(), getContracts(), getInvoices()]);
        const revenue = inv.data.filter((i) => i.status === 'paid').reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        const pending = inv.data.filter((i) => i.status !== 'paid').reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        const signed = co.data.filter((contract) => contract.status === 'signed').length;
        setStats({
          clients: c.data.length,
          contracts: co.data.length,
          revenue,
          pending,
          signed,
        });
        setRecentContracts(co.data.slice(0, 3));
        setRecentInvoices(inv.data.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredContracts = recentContracts.filter(
    (contract) =>
      contract.title?.toLowerCase().includes(search.toLowerCase()) ||
      contract.clientId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const firstName = user?.name?.split(' ')[0] || 'there';
  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statCards = [
    { label: 'TOTAL REVENUE', value: `₹${stats.revenue.toLocaleString()}`, meta: 'Paid invoices', trend: '▲ 12%', up: true },
    { label: 'PENDING REVENUE', value: `₹${stats.pending.toLocaleString()}`, meta: 'Awaiting payment', trend: '▼ 3%', up: false },
    { label: 'ACTIVE CLIENTS', value: stats.clients, meta: 'Current relationships', trend: '▲ 8%', up: true },
    { label: 'SIGNED CONTRACTS', value: stats.signed, meta: `of ${stats.contracts}`, trend: '▲ 5%', up: true },
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page-main dash-main">
        <header className="dash-header">
          <div>
            <p className="dash-greeting">Good {greeting}, {userInitials || firstName}.</p>
            <h1 className="dash-title">Contract business overview</h1>
            <p className="dash-subtitle">
              Today is {dateLabel}. Track revenue, contracts, and invoices in one secure view.
            </p>
          </div>
        </header>

        <div className="dash-action-bar">
          <div className="dash-search-wrap">
            <Search className="dash-search-icon" aria-hidden="true" />
            <input
              className="dash-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contracts..."
              aria-label="Search contracts"
            />
          </div>
          <Link to="/contracts/generate" className="dash-btn-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Generate contract
          </Link>
        </div>

        <div className="dash-metrics">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, i) => <div key={i} className="dash-metric-card dash-metric-card--skeleton" />)
            : statCards.map((item) => (
                <div key={item.label} className="dash-metric-card">
                  <div className="dash-metric-label">{item.label}</div>
                  <div className="dash-metric-value">{item.value}</div>
                  <div className="dash-metric-footer">
                    <span>{item.meta}</span>
                    <span className={item.up ? 'dash-trend dash-trend--up' : 'dash-trend dash-trend--down'}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
        </div>

        <div className="dash-bottom-grid">
          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h2 className="dash-panel-title">Recent contracts</h2>
                <p className="dash-panel-meta">{recentContracts.length} latest items</p>
              </div>
              <Link to="/contracts" className="dash-link">View all</Link>
            </div>
            {loading ? (
              <TableSkeleton rows={3} />
            ) : filteredContracts.length === 0 ? (
              <p className="dash-empty-inline">No recent contracts yet.</p>
            ) : (
              <div className="dash-rows">
                {filteredContracts.map((contract) => {
                  const badge = statusConfig[contract.status] || statusConfig.draft;
                  return (
                    <Link
                      key={contract._id}
                      to={`/contracts`}
                      className="dash-row"
                    >
                      <div className="dash-row-main">
                        <div className="dash-row-title">{contract.title}</div>
                        <div className="dash-row-client">{contract.clientId?.name || 'No client selected'}</div>
                      </div>
                      <div className="dash-row-side">
                        <span className={badge.className}>{badge.label}</span>
                        <span className="dash-row-date">
                          {new Date(contract.updatedAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dash-panel">
            <div className="dash-panel-header">
              <div>
                <h2 className="dash-panel-title">Recent invoices</h2>
                <p className="dash-panel-meta">{recentInvoices.length} latest invoices</p>
              </div>
            </div>
            {loading ? (
              <TableSkeleton rows={3} />
            ) : recentInvoices.length === 0 ? (
              <div className="dash-empty">
                <LayoutGrid className="dash-empty-icon" aria-hidden="true" />
                <p className="dash-empty-title">No invoices yet</p>
                <p className="dash-empty-desc">Send your first invoice to start tracking payments.</p>
              </div>
            ) : (
              <div className="dash-rows">
                {recentInvoices.map((invoice) => {
                  const badge = statusConfig[invoice.status] || statusConfig.draft;
                  return (
                    <div key={invoice._id} className="dash-row dash-row--static">
                      <div className="dash-row-main">
                        <div className="dash-row-title">{invoice.invoiceNumber}</div>
                        <div className="dash-row-client">{invoice.clientId?.name || 'Unknown client'}</div>
                      </div>
                      <div className="dash-row-side">
                        <span className="dash-row-amount">₹{invoice.totalAmount?.toLocaleString()}</span>
                        <span className={badge.className}>{badge.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
