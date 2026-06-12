import { useState, useEffect } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import PageShell from '../components/PageShell';
import { getContracts, deleteContract, saveContractAsTemplate } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

const statusClass = { draft: 'badge-draft', sent: 'badge-sent', signed: 'badge-signed', expired: 'badge-overdue' };
const statusLabel = { draft: 'Draft', sent: 'Sent', signed: 'Signed', expired: 'Expired' };

const openCommentCount = (contract) =>
  (contract.comments || []).filter((c) => c.status === 'open').length;

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchContracts = async () => {
    try {
      const res = await getContracts();
      setContracts(res.data);
    } catch {
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleDelete = async () => {
    const id = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteContract(id);
      toast.success('Deleted!');
      fetchContracts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSaveTemplate = async (id) => {
    try {
      await saveContractAsTemplate(id, { category: 'Web Development' });
      toast.success('Saved as template!');
    } catch {
      toast.error('Failed to save template');
    }
  };

  const filtered = contracts.filter((c) => {
    const searchValue = search.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(searchValue) ||
      (c.clientId?.name || '').toLowerCase().includes(searchValue);
    const matchesFilter = filter === 'All' || c.status === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <PageShell
      title="Contracts"
      subtitle="Filter, search, and manage your contract pipeline."
      actions={
        <Link to="/contracts/generate" className="btn btn-primary">
          + New contract
        </Link>
      }
    >
      <div className="page-toolbar">
        <div className="page-toolbar-filters">
          {['All', 'Draft', 'Sent', 'Signed', 'Expired'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`filter-pill${filter === tab ? ' active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="dash-search-wrap page-toolbar-search">
          <Search className="dash-search-icon" aria-hidden="true" />
          <input
            className="dash-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contracts..."
            aria-label="Search contracts"
          />
        </div>
      </div>

      <div className="table-shell">
        <div className="table-head table-cols-contracts">
          {['Title', 'Client', 'Status', 'Date', 'Actions'].map((heading) => (
            <div key={heading}>{heading}</div>
          ))}
        </div>
        {loading ? (
          <div className="table-empty">Loading contracts…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="▤"
            title="No contracts found"
            description="Generate your first AI contract from the button above."
            actionLabel="Generate AI contract"
            actionTo="/contracts/generate"
          />
        ) : (
          filtered.map((contract) => (
            <div
              key={contract._id}
              className="table-row table-cols-contracts"
            >
              <div className="table-cell-title">
                <div className="table-primary-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {contract.title}
                  {openCommentCount(contract) > 0 && (
                    <span
                      title={`${openCommentCount(contract)} open change request${openCommentCount(contract) > 1 ? 's' : ''} from client`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12 }}
                    >
                      <MessageCircle size={11} aria-hidden="true" /> {openCommentCount(contract)}
                    </span>
                  )}
                </div>
                {contract.description && (
                  <div className="table-secondary-text">{contract.description}</div>
                )}
              </div>
              <div className="table-secondary-text">{contract.clientId?.name || 'Unknown'}</div>
              <div>
                <span className={`status-badge ${statusClass[contract.status] || 'badge-draft'}`}>
                  {statusLabel[contract.status] || contract.status}
                </span>
              </div>
              <div className="table-secondary-text">
                {new Date(contract.updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              <div className="table-actions">
                <Link
                  to={`/contracts/${contract._id}`}
                  className="btn btn-primary btn-sm"
                >
                  Review
                </Link>
                <button
                  type="button"
                  className="btn btn-accent-soft btn-sm"
                  onClick={() => handleSaveTemplate(contract._id)}
                >
                  Template
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setPendingDelete(contract._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete contract?"
        message="This permanently deletes the contract and its public link. Clients will no longer be able to view or sign it."
        confirmLabel="Delete contract"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </PageShell>
  );
};

export default Contracts;
