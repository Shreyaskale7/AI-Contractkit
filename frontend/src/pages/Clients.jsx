import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getClients, createClient, deleteClient } from '../services/api';
import toast from 'react-hot-toast';

const Clients = () => {
  const [clients, setClients]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const [form, setForm]         = useState({ name: '', email: '', phone: '', company: '' });

  const fetchClients = async () => {
    try { const res = await getClients(); setClients(res.data); }
    catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await createClient(form);
      toast.success('Client added!');
      setForm({ name: '', email: '', phone: '', company: '' });
      setShowForm(false);
      fetchClients();
    } catch { toast.error('Failed to add client'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this client?')) return;
    try { await deleteClient(id); toast.success('Deleted!'); fetchClients(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#1e293b' };

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Client Database</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>{clients.length} total clients</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            + Add New Client
          </button>
        </div>

        {/* Add Client Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#0f172a' }}>New Client</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Full Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" style={inputStyle} /></div>
                <div><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Email *</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" style={inputStyle} /></div>
                <div><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" style={inputStyle} /></div>
                <div><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Company</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Pvt Ltd" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '9px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Client'}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#94a3b8' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients by name, email or company..."
              style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1e293b', flex: 1, background: 'transparent' }} />
          </div>

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
            {['Name', 'Email', 'Company', 'Phone', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading clients...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>No clients found</p>
              <p style={{ fontSize: 13 }}>Add your first client to get started</p>
            </div>
          ) : filtered.map((client, i) => (
            <div key={client._id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', alignItems: 'center', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {client.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{client.name}</div>
                  <div style={{ fontSize: 11, color: client.status === 'active' ? '#16a34a' : '#94a3b8' }}>● {client.status}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{client.email}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{client.company || '—'}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{client.phone || '—'}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => handleDelete(client._id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Clients;