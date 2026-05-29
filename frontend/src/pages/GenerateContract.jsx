import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageShell from '../components/PageShell';
import ContractCustomizer from '../components/ContractCustomizer';
import { generateContract, getClients, refineContract } from '../services/api';
import toast from 'react-hot-toast';

const GenerateContract = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ prompt: '', clientId: '', title: '' });
  const [refineInput, setRefineInput] = useState('');
  const [refining, setRefining] = useState(false);
  const [refineHistory, setRefineHistory] = useState([]);
  const [contractStyle, setContractStyle] = useState({ font: 'Georgia, serif', theme: 'white', themeBg: '#ffffff', themeColor: '#1a1a1a', themeBorder: '#e2e8f0', size: 14, spacing: 1.8 });
  const location = useLocation();

  useEffect(() => {
    getClients().then((res) => setClients(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.prefillPrompt) {
      setForm((prev) => ({ ...prev, prompt: location.state.prefillPrompt, title: location.state.prefillTitle || prev.title }));
    }
  }, [location.state]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.clientId) return toast.error('Please select a client');
    setLoading(true);
    setResult(null);
    try {
      const res = await generateContract(form);
      setResult(res.data);
      toast.success('Contract generated! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refineInput.trim() || !result?._id) return;
    setRefining(true);
    try {
      const res = await refineContract(result._id, { instruction: refineInput });
      setResult((prev) => ({ ...prev, content: res.data.content }));
      setRefineHistory((prev) => [refineInput, ...prev].slice(0, 4));
      setRefineInput('');
      toast.success('Contract updated! ✅');
    } catch {
      toast.error('Failed to refine');
    } finally {
      setRefining(false);
    }
  };

  const quickSuggestions = [
    'Add a late payment penalty of 2% per month',
    'Add a non-disclosure clause',
    'Increase notice period to 30 days',
    'Make revision policy stricter — max 1 round',
  ];

  return (
    <PageShell
      title="Generate contract"
      subtitle="Build an AI-drafted contract and preview it instantly."
      actions={
        <>
          <button type="button" className="btn btn-primary btn-sm">AI draft mode</button>
          <button type="button" className="btn btn-secondary btn-sm">Live preview</button>
        </>
      }
    >

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 24, alignItems: 'stretch' }}>
          <section className="card card-body">
            <div style={{ marginBottom: 24 }}>
              <div className="section-title" style={{ marginBottom: 6 }}>Contract details</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>Choose a client, add a title, and describe the project.</div>
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              <div>
                <label className="input-label" htmlFor="gen-client">Client</label>
                <select
                  id="gen-client"
                  className="input-select"
                  required
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>{client.name}{client.company ? ` — ${client.company}` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label" htmlFor="gen-title">Contract title</label>
                <input
                  id="gen-title"
                  className="input-field"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="E.g. App development agreement"
                />
              </div>

              <div>
                <label className="input-label" htmlFor="gen-prompt">Project brief</label>
                <textarea
                  id="gen-prompt"
                  className="textarea-field"
                  required
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  rows={5}
                  placeholder="Describe the scope, milestones, and payment terms in plain English..."
                  style={{ minHeight: 140 }}
                />
              </div>

              <ContractCustomizer style={contractStyle} onChange={setContractStyle} contractType={result?.category || 'standard'} />

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className={`btn btn-primary${loading ? ' loading' : ''}`}
                style={{ width: '100%' }}
              >
                {loading ? 'Generating contract…' : 'Generate contract'}
              </button>
            </div>
          </section>

          <aside className="card card-body" style={{ minHeight: 720, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <div>
                  <div className="section-title" style={{ marginBottom: 6 }}>Live preview</div>
                  <div className="text-secondary" style={{ fontSize: 13 }}>Your contract updates as soon as AI generates it.</div>
                </div>
                <span className="status-badge badge-sent">AI Draft</span>
              </div>

              {result ? (
                <div style={{ display: 'grid', gap: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
                    {result.riskFlags?.map((flag, index) => (
                      <span key={index} className="status-badge badge-sent">⚠️ {flag}</span>
                    ))}
                  </div>

                  <div className="card card-body" style={{ minHeight: 420, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{result.title}</div>
                        <div className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>{clients.find((c) => c._id === result.clientId)?.name || 'Selected client'}</div>
                      </div>
                      <span className="status-badge badge-signed">AI Generated</span>
                    </div>
                    <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: result.content }} />
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ minHeight: 520 }}>
                  <div className="empty-state-icon" aria-hidden="true">📝</div>
                  <div className="empty-state-title">Contract preview shows here</div>
                  <div className="empty-state-desc">Generate a contract to see the paper-style preview, risk chips, and refined content live.</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--saas-border)' }}>
              <div className="section-title" style={{ marginBottom: 10 }}>Refine with AI</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setRefineInput(suggestion)}
                    className="filter-pill"
                    style={{ minHeight: 36, padding: '8px 14px', fontSize: 12 }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  className="input-field"
                  style={{ flex: 1, minWidth: 0 }}
                  value={refineInput}
                  onChange={(e) => setRefineInput(e.target.value)}
                  placeholder='e.g. "Add a penalty clause" or "Make payment terms stricter"'
                />
                <button
                  type="button"
                  onClick={handleRefine}
                  disabled={refining || !refineInput.trim()}
                  className={`btn btn-primary${refining ? ' loading' : ''}`}
                >
                  {refining ? 'Refining…' : 'Apply'}
                </button>
              </div>
              {refineHistory.length > 0 && (
                <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                  {refineHistory.map((change, index) => (
                    <div key={index} className="code-block" style={{ marginBottom: 0, fontFamily: 'inherit' }}>• {change}</div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
    </PageShell>
  );
};

export default GenerateContract;
