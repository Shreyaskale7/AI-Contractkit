import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import PageShell from '../components/PageShell';
import { getContracts, deleteContract, saveContractAsTemplate } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';

const statusClass = { draft: 'badge-draft', sent: 'badge-sent', signed: 'badge-signed' };
const statusLabel = { draft: 'Draft', sent: 'Sent', signed: 'Signed' };

const Contracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

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

  const handleDelete = async (id) => {
    if (!confirm('Delete this contract?')) return;
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
          {['All', 'Draft', 'Sent', 'Signed'].map((tab) => (
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
                <div className="table-primary-text">{contract.title}</div>
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
                  onClick={() => handleDelete(contract._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
};

export default Contracts;
