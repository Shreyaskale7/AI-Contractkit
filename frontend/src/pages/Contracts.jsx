import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getContracts, deleteContract } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);

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

  const statusColor = { draft:'#94a3b8', sent:'#f59e0b', signed:'#16a34a' };
  const statusBg    = { draft:'#f8fafc',  sent:'#fffbeb', signed:'#f0fdf4' };

  return (
    <div style={{ display:'flex' }}>
      <Sidebar />
      <main style={{ marginLeft:240, flex:1, padding:40 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, color:'#1e293b' }}>Contracts</h1>
            <p style={{ color:'#94a3b8', marginTop:4 }}>{contracts.length} total contracts</p>
          </div>
          <Link to="/contracts/generate"
            style={{ background:'#4f46e5', color:'white', padding:'10px 20px', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:600 }}>
            ✨ Generate New
          </Link>
        </div>

        {loading ? <p style={{ color:'#94a3b8' }}>Loading...</p> : (
          <div style={{ display:'grid', gap:12 }}>
            {contracts.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
                <p>No contracts yet.</p>
                <Link to="/contracts/generate" style={{ color:'#4f46e5', fontWeight:500 }}>Generate your first contract →</Link>
              </div>
            ) : contracts.map(contract => (
              <div key={contract._id} style={{ background:'white', borderRadius:12, padding:20, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:600, color:'#1e293b', marginBottom:4 }}>{contract.title}</div>
                  <div style={{ fontSize:13, color:'#94a3b8' }}>
                    {contract.clientId?.name} · {new Date(contract.createdAt).toLocaleDateString('en-IN')}
                  </div>
                  {contract.riskFlags?.length > 0 && (
                    <div style={{ fontSize:12, color:'#ea580c', marginTop:4 }}>⚠️ {contract.riskFlags.length} risk flags</div>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ background: statusBg[contract.status], color: statusColor[contract.status], fontSize:12, padding:'4px 10px', borderRadius:20, fontWeight:500, textTransform:'capitalize' }}>
                    {contract.status}
                  </span>
                  <button onClick={() => handleDelete(contract._id)}
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

export default Contracts;