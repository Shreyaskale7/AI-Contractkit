import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getContracts, deleteContract, saveContractAsTemplate } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';

const statusMap = {
  draft:  { bg: '#f8fafc', color: '#64748b',  label: 'Draft'  },
  sent:   { bg: '#fffbeb', color: '#d97706',  label: 'Sent'   },
  signed: { bg: '#f0fdf4', color: '#16a34a',  label: 'Signed' },
};

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('All');

  const fetchContracts = async () => {
    try { const res = await getContracts(); setContracts(res.data); }
    catch { toast.error('Failed to load contracts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContracts(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this contract?')) return;
    try { await deleteContract(id); toast.success('Deleted!'); fetchContracts(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleSaveTemplate = async (id) => {
    try {
      await saveContractAsTemplate(id, { category: 'Web Development' });
      toast.success('Saved as template! 📋');
    } catch { toast.error('Failed to save template'); }
  };

  const filtered = contracts.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.clientId?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.status === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Contract List</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>{contracts.length} total contracts</p>
          </div>
          <Link to="/contracts/generate"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            + New Contract
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['All', 'Draft', 'Sent', 'Signed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: filter === f ? '#6366f1' : 'white', color: filter === f ? 'white' : '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {f}
            </button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search contracts..."
            style={{ marginLeft: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 13, outline: 'none', width: 220, background: 'white' }} />
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1.5fr 1.5fr', padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
            {['Title', 'Client', 'Status', 'Last Activity', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading contracts...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="📄"
              title="No contracts found"
              description="Generate your first AI contract in seconds — just describe your project."
              actionLabel="✨ Generate AI Contract"
              actionTo="/contracts/generate"
            />
          ) : filtered.map((contract, i) => {
            const s = statusMap[contract.status] || statusMap.draft;
            return (
              <div key={contract._id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1.5fr 1.5fr', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', marginBottom: 2 }}>{contract.title}</div>
                  {contract.riskFlags?.length > 0 && <div style={{ fontSize: 11, color: '#f59e0b' }}>⚠️ {contract.riskFlags.length} risk flags</div>}
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{contract.clientId?.name || '—'}</div>
                <div><span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{s.label}</span></div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(contract.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/contract/public/${contract.publicToken}`); toast.success('Link copied! 🔗'); }}
                    style={{ background: '#eef2ff', color: '#6366f1', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>Share</button>
                  <button onClick={() => handleSaveTemplate(contract._id)}
                    style={{ background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>Template</button>
                  <button onClick={() => handleDelete(contract._id)}
                    style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Contracts;