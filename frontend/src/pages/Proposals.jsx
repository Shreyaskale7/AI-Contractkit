import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';
import { getProposals, updateProposalStatus, deleteProposal } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const statusClass = {
  draft: 'badge-draft',
  sent: 'badge-sent',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
};

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      const res = await getProposals();
      setProposals(res.data);
    } catch {
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateProposalStatus(id, status);
      toast.success('Status updated!');
      fetchProposals();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this proposal?')) return;
    try {
      await deleteProposal(id);
      toast.success('Deleted!');
      fetchProposals();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <PageShell
      title="Proposals"
      subtitle={`${proposals.length} total proposals`}
      actions={<Link to="/proposals/generate" className="btn btn-primary">Generate new</Link>}
    >
      {loading ? (
        <p className="text-secondary">Loading…</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {proposals.length === 0 ? (
            <div className="card card-body empty-state">
              <div className="empty-state-icon" aria-hidden="true">▧</div>
              <p className="empty-state-desc" style={{ marginBottom: 16 }}>No proposals yet.</p>
              <Link to="/proposals/generate" className="link">Generate your first proposal →</Link>
            </div>
          ) : (
            proposals.map((proposal) => (
              <div key={proposal._id} className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{proposal.title}</div>
                  <div className="text-secondary" style={{ fontSize: 13 }}>
                    {proposal.clientId?.name}
                    {proposal.budget && ` · ${proposal.budget}`}
                    {proposal.timeline && ` · ${proposal.timeline}`}
                    {` · ${new Date(proposal.createdAt).toLocaleDateString('en-IN')}`}
                  </div>
                </div>
                <div className="table-actions">
                  <span className={`status-badge ${statusClass[proposal.status] || 'badge-draft'}`}>
                    {proposal.status}
                  </span>
                  <select
                    className="input-select"
                    style={{ width: 'auto', minHeight: 36, padding: '0 12px', fontSize: 12 }}
                    value={proposal.status}
                    onChange={(e) => handleStatus(proposal._id, e.target.value)}
                    aria-label={`Update status for ${proposal.title}`}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(proposal._id)} aria-label="Delete proposal">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </PageShell>
  );
};

export default Proposals;
