import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { getContracts, analyzeScope } from '../services/api';
import toast from 'react-hot-toast';

const ScopeCreepDefender = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [clientRequest, setClientRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getContracts().then(res => setContracts(res.data)).catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!selectedContractId) return toast.error('Please select a contract first.');
    if (!clientRequest.trim()) return toast.error('Please paste the client request.');

    setLoading(true);
    setResult(null);

    try {
      const res = await analyzeScope(selectedContractId, { clientRequest });
      setResult(res.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze scope.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="🛡️ Scope Creep Defender"
      subtitle="Paste a client's request. AI will check the signed contract and draft a polite pushback email."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Side: Input */}
        <div className="card card-body" style={{ display: 'grid', gap: 20 }}>
          <div>
            <label className="input-label">Select Active Contract</label>
            <select
              className="input-select"
              value={selectedContractId}
              onChange={e => setSelectedContractId(e.target.value)}
            >
              <option value="">-- Choose a contract --</option>
              {contracts.filter(c => c.status !== 'draft').map(c => (
                <option key={c._id} value={c._id}>
                  {c.title} ({c.clientId?.name || 'Unknown Client'})
                </option>
              ))}
            </select>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              The AI will read this exact contract to determine scope.
            </div>
          </div>

          <div>
            <label className="input-label">Paste Client's Email / Message</label>
            <textarea
              className="textarea-field"
              rows={8}
              placeholder="e.g. 'Hey, can you also quickly build a mobile app version of this? Shouldn't take long right?'"
              value={clientRequest}
              onChange={e => setClientRequest(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !selectedContractId || !clientRequest}
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            style={{ width: '100%', padding: '12px', fontSize: 15 }}
          >
            {loading ? 'Analyzing Contract...' : '🛡️ Analyze Scope'}
          </button>
        </div>

        {/* Right Side: Results */}
        {result ? (
          <div className="card" style={{ padding: 24, background: result.isOutOfScope ? '#fff1f2' : '#f0fdf4', border: `1px solid ${result.isOutOfScope ? '#fecdd3' : '#bbf7d0'}` }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 32 }}>{result.isOutOfScope ? '🛑' : '✅'}</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: result.isOutOfScope ? '#be123c' : '#15803d' }}>
                  {result.isOutOfScope ? 'Out of Scope' : 'Within Scope'}
                </h3>
                <p style={{ fontSize: 13, color: result.isOutOfScope ? '#e11d48' : '#16a34a' }}>
                  Based on the signed agreement.
                </p>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 8, padding: 16, marginBottom: 20, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>Reasoning</h4>
              <p style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.6 }}>{result.reasoning}</p>
              
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', marginTop: 16, marginBottom: 8, fontWeight: 600 }}>Relevant Clause Found</h4>
              <div style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: 12, borderRadius: 6, borderLeft: '3px solid #cbd5e1' }}>
                "{result.relevantClause}"
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#4f46e5', marginBottom: 8, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                Drafted Response
                <button 
                  onClick={() => { navigator.clipboard.writeText(result.draftEmail); toast.success('Copied!'); }}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
                >
                  Copy
                </button>
              </h4>
              <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {result.draftEmail}
              </div>
            </div>

            {result.isOutOfScope && (
              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/invoices" className="btn btn-primary btn-sm">💰 Bill this as extra work</Link>
                <Link
                  to="/contracts/generate"
                  state={{ prefillPrompt: `Contract addendum covering this additional work: ${clientRequest}`, prefillTitle: 'Contract Addendum' }}
                  className="btn btn-secondary btn-sm"
                >
                  📄 Draft an addendum
                </Link>
              </div>
            )}

          </div>
        ) : (
          <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🛡️</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Ready to defend your time</h3>
            <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 300 }}>
              Paste a client request on the left. The AI will cross-reference it against your signed contract and generate a polite response.
            </p>
          </div>
        )}

      </div>
    </PageShell>
  );
};

export default ScopeCreepDefender;
