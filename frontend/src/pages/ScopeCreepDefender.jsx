import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { getContracts, analyzeScope, logScopeDefense, getScopeDefenses } from '../services/api';
import toast from 'react-hot-toast';

const TONES = [
  { key: 'professional', label: 'Professional' },
  { key: 'firm',         label: 'Firm' },
  { key: 'friendly',     label: 'Friendly' },
  { key: 'upsell',       label: 'Upsell' },
];

const money = (n, currency = 'INR') => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0);
  } catch {
    return `${currency} ${Math.round(n || 0).toLocaleString()}`;
  }
};

const ScopeCreepDefender = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [clientRequest, setClientRequest] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Revenue protected
  const [summary, setSummary] = useState(null);
  const [estValue, setEstValue] = useState('');
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  const currency = summary?.defenses?.[0]?.currency || 'INR';

  useEffect(() => {
    getContracts().then(res => setContracts(res.data)).catch(() => {});
    refreshSummary();
  }, []);

  const refreshSummary = () => {
    getScopeDefenses().then(res => setSummary(res.data)).catch(() => {});
  };

  const runAnalysis = async (useTone = tone) => {
    if (!selectedContractId) return toast.error('Please select a contract first.');
    if (!clientRequest.trim()) return toast.error('Please paste the client request.');

    setLoading(true);
    setLogged(false);
    try {
      const res = await analyzeScope(selectedContractId, { clientRequest, tone: useTone });
      setResult(res.data);
    } catch {
      toast.error('Failed to analyze scope.');
    } finally {
      setLoading(false);
    }
  };

  const handleToneChange = (t) => {
    setTone(t);
    // Re-draft the email in the new tone if we already have a result.
    if (result && !loading) runAnalysis(t);
  };

  const handleLog = async () => {
    setLogging(true);
    try {
      await logScopeDefense(selectedContractId, {
        estimatedValue: Number(estValue) || 0,
        requestText: clientRequest,
        isOutOfScope: result?.isOutOfScope,
        status: 'logged',
      });
      toast.success('Logged as protected revenue!');
      setEstValue('');
      setLogged(true);
      refreshSummary();
    } catch {
      toast.error('Could not log this defense.');
    } finally {
      setLogging(false);
    }
  };

  const confidencePct = result ? Math.round((result.confidence ?? 0) * 100) : 0;

  return (
    <PageShell
      title="🛡️ Scope Creep Defender"
      subtitle="Paste a client's request. AI checks the signed contract, cites the exact clause, and drafts a response in your chosen tone."
    >
      {/* Revenue protected summary */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="card card-body">
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Revenue Protected</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#15803d' }}>{money(summary.summary.totalIdentified, currency)}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Out-of-scope work you caught</div>
          </div>
          <div className="card card-body">
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Converted to Invoices</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#4f46e5' }}>{money(summary.summary.totalBilled, currency)}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Marked as billed</div>
          </div>
          <div className="card card-body">
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Requests Defended</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#1e293b' }}>{summary.summary.count}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Logged so far</div>
          </div>
        </div>
      )}

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
              rows={7}
              placeholder="e.g. 'Hey, can you also quickly build a mobile app version of this? Shouldn't take long right?'"
              value={clientRequest}
              onChange={e => setClientRequest(e.target.value)}
            />
          </div>

          {/* Tone selector */}
          <div>
            <label className="input-label">Response Tone</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TONES.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleToneChange(t.key)}
                  className={`btn btn-sm ${tone === t.key ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: '1 1 0', minWidth: 90 }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => runAnalysis()}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 32 }}>{result.isOutOfScope ? '🛑' : '✅'}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: result.isOutOfScope ? '#be123c' : '#15803d' }}>
                  {result.isOutOfScope ? 'Out of Scope' : 'Within Scope'}
                </h3>
                <p style={{ fontSize: 13, color: result.isOutOfScope ? '#e11d48' : '#16a34a' }}>
                  Based on the signed agreement.
                </p>
              </div>
            </div>

            {/* Confidence meter */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>
                <span>AI Confidence</span>
                <span>{confidencePct}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
                <div style={{ width: `${confidencePct}%`, height: '100%', background: confidencePct >= 70 ? '#16a34a' : confidencePct >= 40 ? '#f59e0b' : '#ef4444' }} />
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>Reasoning</h4>
              <p style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.6 }}>{result.reasoning}</p>

              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', marginTop: 16, marginBottom: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                Clause in Contract
                {result.clauseVerified
                  ? <span style={{ fontSize: 10, color: '#15803d', background: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>✓ VERIFIED</span>
                  : <span style={{ fontSize: 10, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: 4 }}>⚠ UNVERIFIED — review manually</span>}
              </h4>
              {result.clauseContext ? (
                <div style={{ fontSize: 13, color: '#475569', background: '#f8fafc', padding: 12, borderRadius: 6, borderLeft: '3px solid #cbd5e1', lineHeight: 1.7 }}>
                  <span style={{ color: '#94a3b8' }}>{result.clauseContext.before}</span>
                  <mark style={{ background: '#fde68a', padding: '1px 2px', borderRadius: 3 }}>{result.clauseContext.match}</mark>
                  <span style={{ color: '#94a3b8' }}>{result.clauseContext.after}</span>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: 12, borderRadius: 6, borderLeft: '3px solid #cbd5e1' }}>
                  "{result.relevantClause || 'No specific clause cited.'}"
                </div>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#4f46e5', marginBottom: 8, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                Drafted Response · {tone}
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
              <div style={{ marginTop: 16, background: 'white', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#15803d', marginBottom: 10, fontWeight: 600 }}>💰 Track Protected Revenue</h4>
                {logged ? (
                  <p style={{ fontSize: 13, color: '#15803d' }}>✓ Logged. See your running total above.</p>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder={`Est. value of this work (${currency})`}
                      value={estValue}
                      onChange={e => setEstValue(e.target.value)}
                      style={{ flex: 1, minWidth: 160 }}
                    />
                    <button onClick={handleLog} disabled={logging} className="btn btn-primary btn-sm">
                      {logging ? 'Saving...' : 'Log it'}
                    </button>
                  </div>
                )}
              </div>
            )}

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
              Paste a client request on the left. The AI will cross-reference it against your signed contract, highlight the exact clause, and draft a response.
            </p>
          </div>
        )}

      </div>
    </PageShell>
  );
};

export default ScopeCreepDefender;
