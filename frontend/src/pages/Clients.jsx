import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getClients, createClient, deleteClient } from '../services/api';
import toast from 'react-hot-toast';

const Clients = () => {
  const [clients, setClients]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ name:'', email:'', phone:'', company:'' });

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
      setForm({ name:'', email:'', phone:'', company:'' });
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

  const inputStyle = { width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12 };

  return (
    <div style={{ display:'flex' }}>
      <Sidebar />
      <main style={{ marginLeft:240, flex:1, padding:40 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>Clients</h1>
            <p style={{ color:'#94a3b8', marginTop:4 }}>{clients.length} total clients</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background:'#4f46e5', color:'white', border:'none', borderRadius:8, padding:'10px 20px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
            + Add Client
          </button>
        </div>

        {/* Add Client Form */}
        {showForm && (
          <div style={{ background:'white', borderRadius:12, padding:28, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', marginBottom:24 }}>
            <h2 style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>New Client</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <input required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} style={inputStyle} />
                <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} style={inputStyle} />
                <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} style={inputStyle} />
                <input placeholder="Company" value={form.company} onChange={e => setForm({...form, company:e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="submit" disabled={saving}
                  style={{ background:'#4f46e5', color:'white', border:'none', borderRadius:8, padding:'10px 24px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  {saving ? 'Saving...' : 'Save Client'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background:'white', border:'1px solid #e2e8f0', color:'#64748b', borderRadius:8, padding:'10px 24px', fontSize:14, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients List */}
        {loading ? <p style={{ color:'#94a3b8' }}>Loading...</p> : (
          <div style={{ display:'grid', gap:12 }}>
            {clients.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>👥</div>
                <p>No clients yet. Add your first client!</p>
              </div>
            ) : clients.map(client => (
              <div key={client._id} style={{ background:'white', borderRadius:12, padding:20, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#4f46e5' }}>
                    {client.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'#1e293b' }}>{client.name}</div>
                    <div style={{ fontSize:13, color:'#94a3b8', marginTop:2 }}>{client.email} {client.company && `· ${client.company}`}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ background: client.status === 'active' ? '#f0fdf4' : '#fef2f2', color: client.status === 'active' ? '#16a34a' : '#dc2626', fontSize:12, padding:'4px 10px', borderRadius:20, fontWeight:500 }}>
                    {client.status}
                  </span>
                  <button onClick={() => handleDelete(client._id)}
                    style={{ background:'#fef2f2', color:'#dc2626', border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13 }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Clients;