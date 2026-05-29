import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import PageShell from '../components/PageShell';
import { getClients, createClient, deleteClient } from '../services/api';
import toast from 'react-hot-toast';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });

  const fetchClients = async () => {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createClient(form);
      toast.success('Client added!');
      setForm({ name: '', email: '', phone: '', company: '' });
      setShowForm(false);
      fetchClients();
    } catch {
      toast.error('Failed to add client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this client?')) return;
    try {
      await deleteClient(id);
      toast.success('Deleted!');
      fetchClients();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = clients.filter((client) => {
    const query = search.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      (client.company || '').toLowerCase().includes(query)
    );
  });

  return (
    <PageShell
      title="Clients"
      subtitle="Manage your client network and track revenue at a glance."
      actions={
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + Add client
        </button>
      }
    >
      <div className="dash-search-wrap" style={{ marginBottom: 24, maxWidth: 420 }}>
        <Search className="dash-search-icon" aria-hidden="true" />
        <input
          className="dash-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients by name, email or company..."
          aria-label="Search clients"
        />
      </div>

      {showForm && (
        <div className="card card-body" style={{ marginBottom: 24 }}>
          <div className="page-header" style={{ marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>New client</h2>
              <p className="text-secondary" style={{ fontSize: 13 }}>Add a client profile and keep your contract workflow connected.</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Close</button>
          </div>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
            <div>
              <label className="input-label" htmlFor="client-name">Full name *</label>
              <input id="client-name" className="input-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className="input-label" htmlFor="client-email">Email *</label>
              <input id="client-email" className="input-field" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
            </div>
            <div>
              <label className="input-label" htmlFor="client-phone">Phone</label>
              <input id="client-phone" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="input-label" htmlFor="client-company">Company</label>
              <input id="client-company" className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Pvt Ltd" />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="submit" className={`btn btn-primary${saving ? ' loading' : ''}`} disabled={saving}>{saving ? 'Saving…' : 'Save client'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="client-grid">
        {loading ? (
          Array(6).fill(null).map((_, idx) => (
            <div key={idx} className="card card-stat" style={{ opacity: 0.4 }} aria-hidden="true" />
          ))
        ) : filtered.length === 0 ? (
          <div className="card card-body" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 14 }} aria-hidden="true">◉</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No clients found</div>
            <div className="text-secondary">Add a client to start managing contracts and invoices.</div>
          </div>
        ) : (
          filtered.map((client) => {
            const initials = client.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div key={client._id} className="card card-body card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
                    <div className="avatar-circle">{initials}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</div>
                      <div className="text-secondary" style={{ fontSize: 13, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.company || client.email}</div>
                    </div>
                  </div>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-status-success)', flexShrink: 0 }} aria-label="Active" />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div className="text-secondary" style={{ fontSize: 13, marginBottom: 6 }}>Revenue earned</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-surface-strong)' }}>₹{(client.revenue || 0).toLocaleString()}</div>
                </div>
                <button type="button" className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => handleDelete(client._id)}>Delete</button>
              </div>
            );
          })
        )}
      </div>
    </PageShell>
  );
};

export default Clients;
