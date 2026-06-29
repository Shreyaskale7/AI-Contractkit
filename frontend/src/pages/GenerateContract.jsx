import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import ContractCustomizer from '../components/ContractCustomizer';
import { getClients, refineContract, markContractSent, generateContractStream } from '../services/api';
import { sanitizeHtml } from '../utils/sanitize';
import toast from 'react-hot-toast';

const stageLabels = {
  drafting: 'Drafting contract…',
  analyzing: 'Analyzing risks…',
};

const GenerateContract = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ prompt: '', clientId: '', title: '' });
  const [notesForm, setNotesForm] = useState({ notes: '', clientId: '', title: '' });
  const [mode, setMode] = useState('prompt'); // 'prompt' or 'notes'
  const [refineInput, setRefineInput] = useState('');
  const [refining, setRefining] = useState(false);
  const [refineHistory, setRefineHistory] = useState([]);
  const [contractStyle, setContractStyle] = useState({ font: 'Georgia, serif', theme: 'white', themeBg: '#ffffff', themeColor: '#1a1a1a', themeBorder: '#e2e8f0', size: 14, spacing: 1.8 });
  const [stage, setStage] = useState(null);       // 'drafting' | 'analyzing'
  const [streamHtml, setStreamHtml] = useState(''); // live partial content
  const [sending, setSending] = useState(false);
  const abortRef = useRef(null);
  const location = useLocation();

  useEffect(() => () => abortRef.current?.(), []);

  useEffect(() => {
    getClients().then((res) => setClients(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.prefillPrompt) {
      setForm((prev) => ({ ...prev, prompt: location.state.prefillPrompt, title: location.state.prefillTitle || prev.title }));
    }
  }, [location.state]);

  const handleGenerate = (e) => {
    e.preventDefault();
    const currentForm = mode === 'prompt' ? form : notesForm;
    if (!currentForm.clientId) return toast.error('Please select a client');
    if (mode === 'prompt' && !form.prompt.trim()) return toast.error('Please describe the project');
    if (mode === 'notes' && !notesForm.notes.trim()) return toast.error('Please paste your meeting notes');

    setLoading(true);
    setResult(null);
    setStreamHtml('');
    setStage('drafting');

    const body = mode === 'prompt'
      ? { mode: 'prompt', prompt: form.prompt, clientId: form.clientId, title: form.title }
      : { mode: 'notes', notes: notesForm.notes, clientId: notesForm.clientId, title: notesForm.title };

    abortRef.current = generateContractStream({
      body,
      onStage: (s) => setStage(s),
      onDelta: (delta) => setStreamHtml((prev) => prev + delta),
      onDone: (contract) => {
        setResult(contract);
        setStreamHtml('');
        setStage(null);
        setLoading(false);
        toast.success('Contract generated and saved as draft! 🎉');
      },
      onError: (err) => {
        setStage(null);
        setLoading(false);
        toast.error(err.message || 'Generation failed');
      },
    });
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/contract/public/${result.publicToken}`);
    toast.success('Client link copied!');
  };

  const handleSendToClient = async () => {
    setSending(true);
    try {
      const res = await markContractSent(result._id);
      setResult((prev) => ({ ...prev, status: res.data.status }));
      copyPublicLink();
      toast.success('Marked as sent — share the copied link with your client');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as sent');
    } finally {
      setSending(false);
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
        result ? (
          <>
            <Link to={`/contracts/${result._id}`} className="btn btn-secondary btn-sm">Open contract</Link>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copyPublicLink}>🔗 Copy client link</button>
            <button
              type="button"
              className={`btn btn-primary btn-sm${sending ? ' loading' : ''}`}
              disabled={sending || result.status === 'sent'}
              onClick={handleSendToClient}
            >
              {result.status === 'sent' ? '✓ Sent to client' : 'Send to client'}
            </button>
          </>
        ) : null
      }
    >

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 24, alignItems: 'stretch' }}>
          <section className="card card-body">
            <div style={{ marginBottom: 24 }}>
              <div className="section-title" style={{ marginBottom: 6 }}>Contract details</div>
              <div className="text-secondary" style={{ fontSize: 13 }}>Choose a client, add a title, and describe the project.</div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button 
                type="button"
                className={`btn ${mode === 'prompt' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setMode('prompt')}
                style={{ flex: 1 }}
              >
                📝 Brief to Contract
              </button>
              <button 
                type="button"
                className={`btn ${mode === 'notes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setMode('notes')}
                style={{ flex: 1 }}
              >
                🎙️ Notes to Contract
              </button>
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              <div>
                <label className="input-label" htmlFor="gen-client">Client</label>
                <select
                  id="gen-client"
                  className="input-select"
                  required
                  value={mode === 'prompt' ? form.clientId : notesForm.clientId}
                  onChange={(e) => mode === 'prompt' ? setForm({ ...form, clientId: e.target.value }) : setNotesForm({ ...notesForm, clientId: e.target.value })}
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
                  value={mode === 'prompt' ? form.title : notesForm.title}
                  onChange={(e) => mode === 'prompt' ? setForm({ ...form, title: e.target.value }) : setNotesForm({ ...notesForm, title: e.target.value })}
                  placeholder="E.g. App development agreement"
                />
              </div>

              {mode === 'prompt' ? (
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
              ) : (
                <div>
                  <label className="input-label" htmlFor="gen-notes">Meeting Notes / Transcript</label>
                  <textarea
                    id="gen-notes"
                    className="textarea-field"
                    required
                    value={notesForm.notes}
                    onChange={(e) => setNotesForm({ ...notesForm, notes: e.target.value })}
                    rows={5}
                    placeholder="Paste rough notes or a Zoom transcript. The AI will extract the deliverables, timeline, and pricing..."
                    style={{ minHeight: 140 }}
                  />
                </div>
              )}

              <ContractCustomizer style={contractStyle} onChange={setContractStyle} contractType={result?.category || 'standard'} />

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className={`btn btn-primary${loading ? ' loading' : ''}`}
                style={{ width: '100%' }}
              >
                {loading ? (stageLabels[stage] || 'Generating…') : 'Generate contract'}
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
                <span className="status-badge badge-sent">{loading ? (stageLabels[stage] || 'Working…') : 'AI Draft'}</span>
              </div>

              {loading ? (
                <div className="card card-body" style={{ minHeight: 420, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>
                    <span className="spinner" aria-hidden="true">⏳</span> {stageLabels[stage] || 'Working…'}
                  </div>
                  {streamHtml ? (
                    <div
                      className="text-secondary"
                      style={{ fontSize: 14, lineHeight: 1.8 }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(streamHtml) }}
                    />
                  ) : (
                    <div className="text-secondary" style={{ fontSize: 13 }}>The contract will appear here as the AI writes it…</div>
                  )}
                </div>
              ) : result ? (
                <div style={{ display: 'grid', gap: 16 }}>
                  {result.riskAnalysis?.length > 0 && (
                    <div style={{ display: 'grid', gap: 8, marginBottom: 4 }}>
                      {result.riskAnalysis.map((risk, index) => (
                        <details key={index} style={{ border: '1px solid var(--saas-border, #e2e8f0)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 600, color: risk.riskLevel === 'high' ? '#dc2626' : risk.riskLevel === 'medium' ? '#d97706' : '#7c3aed' }}>
                            ⚠️ {risk.riskLevel?.toUpperCase()} RISK{risk.originalText ? `: ${risk.originalText.substring(0, 60)}${risk.originalText.length > 60 ? '…' : ''}` : ''}
                          </summary>
                          <div className="text-secondary" style={{ marginTop: 8, lineHeight: 1.6 }}>
                            {risk.reasoning}
                            {risk.originalText && (
                              <div style={{ marginTop: 6, fontStyle: 'italic', opacity: 0.8 }}>"{risk.originalText}"</div>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  )}

                  <div className="card card-body" style={{ minHeight: 420, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{result.title}</div>
                        <div className="text-secondary" style={{ fontSize: 13, marginTop: 4 }}>{clients.find((c) => c._id === result.clientId)?.name || 'Selected client'}</div>
                      </div>
                      <span className="status-badge badge-signed">
                        {result.status === 'sent' ? '✓ Sent to client' : '✓ Saved as draft'}
                      </span>
                    </div>
                    <div className="text-secondary" style={{ fontSize: 14, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.content) }} />
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
