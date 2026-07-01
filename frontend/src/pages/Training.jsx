import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';
import { indexAllContracts } from '../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';

const Training = () => {
  const [indexing, setIndexing] = useState(false);
  const [indexed, setIndexed] = useState(null);
  const [stats, setStats] = useState(null);
  const [contracts, setContracts] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/rag/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data);
      } catch {
        /* stats optional */
      }
    };
    fetchStats();
  }, [indexed]);

  const handleIndexAll = async () => {
    setIndexing(true);
    try {
      const res = await indexAllContracts();
      setIndexed(res.data.count);
      toast.success(`Indexed ${res.data.count} contracts!`);
    } catch {
      toast.error('Indexing failed');
    } finally {
      setIndexing(false);
    }
  };

  return (
    <PageShell title="AI training center" subtitle="Train your AI on your contract library for smarter, more personalized generation.">
      {stats && (
        <div className="card card-body" style={{ marginBottom: 24 }}>
          <h2 className="section-title">Learning library status</h2>
          <div className="stat-grid-3">
            {Object.entries(stats).map(([cat, count]) => (
              <div key={cat} className="stat-cell">
                <div className={`stat-cell-value${count > 0 ? '' : ' stat-cell-value--muted'}`}>{count}</div>
                <div className="stat-cell-label">{cat.replace(/_/g, ' ')}</div>
                <div className="text-secondary" style={{ fontSize: 10, marginTop: 2, fontWeight: 500 }}>
                  {count >= 10 ? 'Well trained' : count >= 3 ? 'Learning' : 'Not trained'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-secondary" style={{ marginTop: 12, fontSize: 12 }}>
            Tip: Each category needs 10+ contracts to be well trained. Keep generating contracts to improve accuracy.
          </p>
        </div>
      )}

      <div className="card card-body" style={{ marginBottom: 24 }}>
        <h2 className="section-title">How smart learning works</h2>
        <div className="step-grid">
          {[
            { step: '01', icon: '📤', title: 'Add your contracts', desc: 'Index your past contracts into a searchable library. The more you add, the better the references.' },
            { step: '02', icon: '🔍', title: 'Patterns indexed', desc: 'Each contract is categorized and indexed by clause patterns using TF-IDF similarity.' },
            { step: '03', icon: '⚡', title: 'Grounded generation', desc: 'New contracts reuse clause patterns from your most similar past agreements.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="step-card">
              <div className="step-card-label">STEP {step}</div>
              <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">{icon}</div>
              <div className="step-card-title">{title}</div>
              <div className="step-card-desc">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-body" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Step 1 — Index your existing contracts</h2>
        <p className="text-secondary" style={{ fontSize: 13, marginBottom: 16 }}>
          Index all contracts you&apos;ve already generated so the AI can learn from them.
        </p>
        <button
          type="button"
          onClick={handleIndexAll}
          disabled={indexing}
          className={`btn btn-primary${indexing ? ' loading' : ''}`}
        >
          {indexing ? 'Indexing…' : 'Index all my contracts'}
        </button>
        {indexed !== null && (
          <div className="alert-success">
            Successfully indexed {indexed} contracts into the learning model.
          </div>
        )}
      </div>

      <div className="card card-body">
        <h2 className="section-title">Step 2 — Add contracts to your library (JSON)</h2>
        <p className="text-secondary" style={{ fontSize: 13, marginBottom: 16 }}>
          Paste past contracts as JSON to index them for reference. Format: array of objects with title and content fields.
        </p>
        <div className="code-block">
          {`[
  { "title": "Web Dev Contract", "content": "CONTRACT TEXT HERE..." },
  { "title": "Design Contract",  "content": "CONTRACT TEXT HERE..." }
]`}
        </div>
        <textarea
          className="textarea-field textarea-field--mono"
          value={contracts}
          onChange={(e) => setContracts(e.target.value)}
          rows={8}
          placeholder="Paste your JSON array of contracts here..."
          style={{ marginBottom: 12 }}
        />
        <button
          type="button"
          disabled={uploading || !contracts}
          className={`btn btn-primary${uploading ? ' loading' : ''}`}
          onClick={async () => {
            setUploading(true);
            try {
              const parsed = JSON.parse(contracts);
              const { uploadContracts } = await import('../services/api');
              const res = await uploadContracts({ contracts: parsed });
              toast.success(`Uploaded ${res.data.count} contracts!`);
              setContracts('');
            } catch {
              toast.error('Invalid JSON or upload failed');
            } finally {
              setUploading(false);
            }
          }}
        >
          {uploading ? 'Uploading…' : 'Upload & train'}
        </button>
      </div>
    </PageShell>
  );
};

export default Training;
