import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getProposals, updateProposalStatus, deleteProposal } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetchProposals = async () => {
    try {
      const res = await getProposals();
      setProposals(res.data);
    } catch { toast.error('Failed to load proposals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProposals(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateProposalStatus(id, status);
      toast.success('Status updated!');
      fetchProposals();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this proposal?')) return;
    try {
      await deleteProposal(id);
      toast.success('Deleted!');
      fetchProposals();
    } catch { toast.error('Failed to delete'); }
  };

  const statusColors = {
    draft:    { bg: '#f8fafc', color: '#94a3b8' },
    sent:     { bg: '#fffbeb', color: '#f59e0b' },
    accepted: { bg: '#f0fdf4', color: '#16a34a' },
    rejected: { bg: '#fef2f2', color: '#dc2626' },
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 40, background: '#f8fafc', minHeight: '100vh' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Proposals</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>{proposals.length} total proposals</p>
          </div>
          <Link to="/proposals/generate"
            style={{ background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            🤖 Generate New
          </Link>
        </div>

        {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : (
          <div style={{ display: 'grid', gap: 12 }}>
            {proposals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: 'white', borderRadius: 12 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <p style={{ marginBottom: 16 }}>No proposals yet.</p>
                <Link to="/proposals/generate"
                  style={{ color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>
                  Generate your first proposal →
                </Link>
              </div>
            ) : proposals.map(proposal => (
              <div key={proposal._id}
                style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{proposal.title}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    {proposal.clientId?.name}
                    {proposal.budget && ` · ${proposal.budget}`}
                    {proposal.timeline && ` · ${proposal.timeline}`}
                    {` · ${new Date(proposal.createdAt).toLocaleDateString('en-IN')}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: statusColors[proposal.status]?.bg, color: statusColors[proposal.status]?.color, fontSize: 12, padding: '4px 10px', borderRadius: 20, fontWeight: 500, textTransform: 'capitalize' }}>
                    {proposal.status}
                  </span>
                  <select
                    value={proposal.status}
                    onChange={e => handleStatus(proposal._id, e.target.value)}
                    style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', background: 'white' }}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button onClick={() => handleDelete(proposal._id)}
                    style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
                    🗑
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

export default Proposals;